// Versioned, local films: lengths are verified against the shipped files in tests.
export const videoAssetSizes = {
  '/assets/video/how-it-works-vertical-20261111.mp4': 3412395,
  '/assets/video/how-it-works-horizontal-20261111.mp4': 3499176,
};

// Tap-to-open song clips (previews/music.js); iPhone Safari also expects byte ranges for audio.
export const musicAssetSizes = {
  '/previews/_music/aaja-nachle.mp3': 480384,
  '/previews/_music/are-re-are.mp3': 480384,
  '/previews/_music/bole-chudiyan.mp3': 480384,
  '/previews/_music/chalte-chalte.mp3': 480384,
  '/previews/_music/chammak-challo.mp3': 480384,
  '/previews/_music/chand-sifarish.mp3': 480384,
  '/previews/_music/chhote-chhote-bhaiyon.mp3': 480384,
  '/previews/_music/d-se-dance.mp3': 480384,
  '/previews/_music/deewani-mastani.mp3': 480384,
  '/previews/_music/didi-tera-devar-deewana.mp3': 480384,
  '/previews/_music/dil-laga-liya.mp3': 480384,
  '/previews/_music/gerua.mp3': 480384,
  '/previews/_music/har-dil-jo-pyaar-karega.mp3': 480384,
  '/previews/_music/janam-janam.mp3': 480384,
  '/previews/_music/jeena-jeena.mp3': 480384,
  '/previews/_music/ladki-badi-anjani-hai.mp3': 480384,
  '/previews/_music/lal-dupatta.mp3': 480384,
  '/previews/_music/maahi-ve.mp3': 480384,
  '/previews/_music/main-rang-sharbaton-ka.mp3': 480384,
  '/previews/_music/maiyya-yashoda.mp3': 480384,
  '/previews/_music/manwa-laage.mp3': 480384,
  '/previews/_music/mehndi-laga-ke-rakhna.mp3': 480384,
  '/previews/_music/mera-yaar-dildar.mp3': 480384,
  '/previews/_music/mere-khwabon-mein.mp3': 480384,
  '/previews/_music/pee-loon.mp3': 480384,
  '/previews/_music/pinga.mp3': 480384,
  '/previews/_music/piya-o-re-piya.mp3': 480384,
  '/previews/_music/prem-ratan-dhan-payo.mp3': 480384,
  '/previews/_music/pretty-woman.mp3': 480384,
  '/previews/_music/saajanji-ghar-aaye.mp3': 480384,
  '/previews/_music/saans.mp3': 480384,
  '/previews/_music/sajan-tumse-pyar.mp3': 480384,
  '/previews/_music/samjhawan-unplugged.mp3': 480384,
  '/previews/_music/suraj-hua-maddham.mp3': 480384,
  '/previews/_music/tenu-leke.mp3': 480384,
  '/previews/_music/tere-bina.mp3': 480384,
  '/previews/_music/tere-sang-yaara.mp3': 480384,
  '/previews/_music/wah-wah-ramji.mp3': 480384,
  '/previews/_music/yeh-ladka-hai-allah.mp3': 480384,
  '/previews/_music/zaalima.mp3': 480384,
  '/previews/_music/zara-sa-jhoom-loon-main.mp3': 480384,
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
