#!/usr/bin/env python3
"""Mirror catalogue demos without crawling navigation. Stage imports for review.

Usage: python3 tools/import_previews.py [--design marigold-bhavan] [--all]
Imports never change catalogue URLs automatically. Read the report and inspect
the staged page before marking a design ready in previews/manifest.json.
"""
import argparse
import concurrent.futures
import hashlib
import html
import json
import re
import shutil
import subprocess
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'previews'
ASSET_EXT = r'(?:css|js|mjs|json|png|jpe?g|webp|gif|svg|avif|ico|mp4|webm|mp3|ogg|wav|woff2?|ttf|otf|wasm)'
QUOTED_ASSET = re.compile(r'''(["'])([^"'\n<>]+\.''' + ASSET_EXT + r'''(?:\?[^"'\n<>]*)?)\1''', re.I)
CSS_URL = re.compile(r'''url\(\s*(["']?)([^)'"\s]+)\1\s*\)''', re.I)
CSS_IMPORT = re.compile(r'''(@import\s+)(["'])([^"']+)\2''', re.I)
TAG = re.compile(r'<(?:script|img|source|video|audio|link|image)\b[^>]*>', re.I)
ATTR = re.compile(r'''\b(src|href|xlink:href|poster|data-src|srcset|data-srcset)\s*=\s*(["'])(.*?)\2''', re.I | re.S)


def catalogue():
    source = (ROOT / 'scripts.js').read_text()
    return [dict(id=int(m[0]), name=m[1], source=m[2], slug=urllib.parse.urlsplit(m[2]).hostname.split('.')[0])
            for m in re.findall(r'id:\s*(\d+),\s*name:\s*"([^"]+)"[\s\S]*?demoUrl:\s*"([^"]+)"', source)]


def pixel_equal(first, second):
    # Compare decoded pixels and colour metadata, including transparent RGB.
    from PIL import Image
    with Image.open(first) as a, Image.open(second) as b:
        if getattr(a, 'n_frames', 1) != 1 or getattr(b, 'n_frames', 1) != 1:
            return False
        return (a.size == b.size and a.convert('RGBA').tobytes() == b.convert('RGBA').tobytes()
                and a.info.get('icc_profile') == b.info.get('icc_profile')
                and a.info.get('exif', b'') == b.info.get('exif', b''))


def lossless_image(data, extension):
    """Never resize, lower quality, discard animation or accept changed pixels."""
    if extension.lower() not in ('.png', '.jpg', '.jpeg', '.webp') or not shutil.which('cwebp'):
        return data, extension, 'original retained'
    try:
        from PIL import Image
        with tempfile.TemporaryDirectory(prefix='invitestory-image-') as folder:
            original = Path(folder) / ('original' + extension)
            candidate = Path(folder) / 'candidate.webp'
            original.write_bytes(data)
            with Image.open(original) as image:
                if getattr(image, 'n_frames', 1) != 1:
                    return data, extension, 'animation retained'
            subprocess.run(['cwebp', '-quiet', '-z', '9', '-exact', '-metadata', 'all', str(original), '-o', str(candidate)],
                           check=True, timeout=180, capture_output=True)
            compressed = candidate.read_bytes()
            if len(compressed) < len(data) and pixel_equal(original, candidate):
                return compressed, '.webp', 'verified lossless WebP'
    except (ImportError, OSError, subprocess.SubprocessError, ValueError):
        pass
    return data, extension, 'original retained'


def stream_copy_video(data, extension):
    """Move MP4 indexing to the front without re-encoding any media stream."""
    if extension.lower() != '.mp4' or not shutil.which('ffmpeg'):
        return data, 'original retained'
    try:
        with tempfile.TemporaryDirectory(prefix='invitestory-video-') as folder:
            original, candidate = Path(folder) / 'original.mp4', Path(folder) / 'candidate.mp4'
            original.write_bytes(data)
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(original), '-map', '0', '-map_metadata', '0',
                            '-c', 'copy', '-movflags', '+faststart', str(candidate)], check=True, timeout=180, capture_output=True)
            compressed = candidate.read_bytes()
            # No decoded quality changes; retain original when remux increases size.
            if len(compressed) <= len(data):
                return compressed, 'MP4 stream copy with fast-start'
    except (OSError, subprocess.SubprocessError):
        pass
    return data, 'original retained'


class Mirror:
    def __init__(self, design):
        self.design = design
        self.folder = DEST / design['slug']
        self.paths = {}
        self.assets = []
        self.failures = []
        self.external = set()
        self.bytes = 0

    def resolve(self, reference, base):
        reference = html.unescape(reference)
        parsed = urllib.parse.urlsplit(urllib.parse.urljoin(base, reference))
        if parsed.scheme not in ('http', 'https') or '${' in reference or '\\' in reference:
            return None
        return urllib.parse.urlunsplit(parsed._replace(fragment=''))

    def local_path(self, url, entry=False):
        parsed = urllib.parse.urlsplit(url)
        if entry:
            return self.folder / 'index.html'
        # Preserve directories within each resource origin, including JS chunks.
        segments = [urllib.parse.quote(s, safe='.-_') if s not in ('.', '..') else '_'
                    for s in parsed.path.split('/') if s]
        path = Path(*segments) if segments else Path('index.css' if 'fonts.googleapis.com' in parsed.netloc else 'index')
        if parsed.query:
            path = path.with_name(path.stem + '-' + hashlib.sha256(parsed.query.encode()).hexdigest()[:12] + path.suffix)
        return self.folder / 'resources' / parsed.netloc / path

    def fetch(self, url, entry=False):
        if url in self.paths:
            return self.paths[url]
        path = self.local_path(url, entry)
        self.paths[url] = path
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 InviteStoryTemplateImporter/1.0'})
            with urllib.request.urlopen(request, timeout=30) as response:
                if urllib.parse.urlsplit(response.url).scheme != 'https':
                    raise ValueError('Unexpected non-HTTPS redirect')
                data = response.read(128 * 1024 * 1024 + 1)
                content_type = response.headers.get_content_type()
                base = response.url
            if len(data) > 128 * 1024 * 1024:
                raise ValueError('Asset exceeds 128 MiB; import separately')
            self.bytes += len(data)
            before = len(data)
            optimization = 'original retained'
            extension = path.suffix.lower()
            if entry or content_type in ('text/html', 'text/css', 'application/javascript', 'text/javascript', 'application/json') or extension in ('.css', '.js', '.mjs', '.json'):
                text = data.decode('utf-8-sig')
                if entry or content_type == 'text/html':
                    # Resolve the original base before removing it from the copy.
                    original_base = re.search(r'''<base\b[^>]*href=["']([^"']+)''', text, re.I)
                    if original_base:
                        base = urllib.parse.urljoin(base, html.unescape(original_base[1]))
                    text = re.sub(r'<base\b[^>]*>', '', text, flags=re.I)
                    text = TAG.sub(lambda m: self.rewrite_tag(m[0], base, path), text)
                text = CSS_URL.sub(lambda m: 'url("' + self.reference(m[2], base, path) + '")', text)
                text = CSS_IMPORT.sub(lambda m: m[1] + m[2] + self.reference(m[3], base, path) + m[2], text)
                # Literal JS asset URLs are mirrored; computed paths require review.
                text = QUOTED_ASSET.sub(lambda m: m[1] + self.reference(m[2], base, path) + m[1], text)
                data = text.encode()
            elif content_type.startswith('image/'):
                data, new_extension, optimization = lossless_image(data, extension)
                if new_extension != extension:
                    path = path.with_suffix(new_extension)
                    self.paths[url] = path
            elif extension == '.mp4':
                data, optimization = stream_copy_video(data, extension)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            self.assets.append({'source': url, 'path': '/' + path.relative_to(ROOT).as_posix(), 'before': before, 'after': len(data), 'optimization': optimization})
            return path
        except Exception as error:
            self.paths.pop(url, None)
            self.failures.append({'url': url, 'error': str(error)})
            return None

    def reference(self, reference, base, owner):
        if reference.startswith(('/previews/', 'data:', 'blob:', '#')):
            return reference
        url = self.resolve(reference, base)
        if not url:
            return reference
        if urllib.parse.urlsplit(url).scheme != 'https':
            self.external.add(url)
            return url
        # Never import telemetry, payments or arbitrary API endpoints as scripts.
        if any(host in urllib.parse.urlsplit(url).hostname for host in ('googletagmanager', 'google-analytics', 'clarity.ms', 'facebook.net', 'razorpay')):
            self.external.add(url)
            return url
        local = self.fetch(url)
        if not local:
            self.external.add(url)
            return url
        fragment = urllib.parse.urlsplit(reference).fragment
        return '/' + local.relative_to(ROOT).as_posix() + ('#' + fragment if fragment else '')

    def rewrite_tag(self, tag, base, owner):
        # Integrity hashes on rewritten CSS/JS no longer match. Flag removal.
        def replace(match):
            name, quote, value = match.groups()
            if name.lower() in ('href', 'xlink:href') and tag.lower().startswith('<link') and not re.search(r'\b(?:stylesheet|preload|icon|modulepreload)\b', tag, re.I):
                return match[0]
            if name.lower().endswith('srcset'):
                if 'data:' in value: return match[0]
                candidates = []
                for candidate in value.split(','):
                    parts = candidate.strip().split()
                    if parts: candidates.append(' '.join([self.reference(parts[0], base, owner), *parts[1:]]))
                value = ', '.join(candidates)
            else:
                value = self.reference(value, base, owner)
            return name + '=' + quote + html.escape(value, quote=True) + quote
        rewritten = ATTR.sub(replace, tag)
        if rewritten != tag:
            rewritten = re.sub(r'''\s+integrity\s*=\s*(["']).*?\1''', '', rewritten, flags=re.I)
        return rewritten

    def run(self):
        self.folder.mkdir(parents=True, exist_ok=True)
        entry = self.fetch(self.design['source'], entry=True)
        report = {**self.design, 'status': 'staged' if entry and not self.failures else 'incomplete',
                  'requiresReview': ['Computed JavaScript asset paths', 'External scripts and backend calls', 'RSVP forms must stay in demo mode', 'Opening animation and mobile layout'],
                  'downloadedBytes': self.bytes, 'savedBytes': sum(a['before'] - a['after'] for a in self.assets),
                  'assets': self.assets, 'failures': self.failures, 'external': sorted(self.external)}
        (self.folder / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
        print(f"{self.design['slug']}: {report['status']}, {len(self.assets)} assets, {len(self.failures)} failures", flush=True)
        return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--design', help='Exact demo subdomain slug')
    parser.add_argument('--all', action='store_true')
    args = parser.parse_args()
    designs = catalogue()
    if args.design:
        designs = [d for d in designs if d['slug'] == args.design]
        if not designs: parser.error('Unknown catalogue design')
    elif not args.all:
        designs = designs[:1]
    # Four concurrent templates; recursive asset downloads stay bounded per template.
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        reports = list(pool.map(lambda d: Mirror(d).run(), designs))
    DEST.mkdir(exist_ok=True)
    (DEST / 'last-import.json').write_text(json.dumps(reports, indent=2) + '\n')
    return 1 if any(r['status'] == 'incomplete' for r in reports) else 0


if __name__ == '__main__':
    raise SystemExit(main())
