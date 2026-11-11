// Versioned, local films: lengths are verified against the shipped files in tests.
export const videoAssetSizes = {
  '/assets/video/how-it-works-vertical-20261111.mp4': 3412395,
  '/assets/video/how-it-works-horizontal-20261111.mp4': 3499176,
};

// Static Assets ignores Range; Safari needs byte ranges for reliable video seeking.
export async function serveVideoAsset(request, assets, size) {
  const upstream = new Request(request);
  upstream.headers.delete('Range');
  upstream.headers.delete('If-Range');
  const response = await assets.fetch(upstream);
  if (response.status !== 200 || !['GET', 'HEAD'].includes(request.method)) return response;
  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(size));
  const range = request.headers.get('Range');
  const validator = request.headers.get('If-Range');
  const mayUseRange = !validator || (!validator.startsWith('W/') &&
    (validator === headers.get('ETag') || validator === headers.get('Last-Modified')));
  const match = mayUseRange && range?.match(/^bytes=(\d*)-(\d*)$/i);
  // Unknown units and multipart ranges can be ignored and served as a normal GET.
  if (!match || (!match[1] && !match[2])) {
    return new Response(response.body, { status: 200, headers });
  }
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start >= size || end < start || (!match[1] && Number(match[2]) === 0)) {
    if (response.body) await response.body.cancel();
    headers.set('Content-Range', `bytes */${size}`);
    headers.set('Content-Length', '0');
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  if (request.method === 'HEAD') return new Response(null, { status: 206, headers });

  // Skip and slice chunks with backpressure, without buffering a whole film per viewer.
  const reader = response.body.getReader();
  let offset = 0;
  const body = new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) { controller.close(); return; }
          const chunkStart = offset;
          offset += value.byteLength;
          if (offset <= start) continue;
          controller.enqueue(value.subarray(Math.max(0, start - chunkStart), Math.min(value.byteLength, end - chunkStart + 1)));
          if (offset > end) { controller.close(); await reader.cancel(); }
          return;
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  return new Response(body, { status: 206, headers });
}
