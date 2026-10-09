#!/usr/bin/env python3
"""Import existing production exports and optimize without modifying originals."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import shutil
from import_previews import ROOT, DEST, catalogue, lossless_image, stream_copy_video
from localize_preview_media import localize, OLD as MEDIA_SOURCE, NEW as MEDIA_TARGET
from repair_preview_assets import repair_assets

RUNTIME_EXTENSIONS = {'.html', '.css', '.js', '.mjs', '.json', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.mov', '.webm', '.mp3', '.ogg', '.wav'}
TEXT_EXTENSIONS = {'.html', '.css', '.js', '.mjs', '.json'}


def repair_mobile_canvas(folder):
    """Cap full-screen particle buffers, preserving CSS size and coordinates."""
    changes = []
    for file in folder.rglob('*.js'):
        text = file.read_text()
        if 'window.innerWidth*devicePixelRatio' not in text or 'window.innerHeight*devicePixelRatio' not in text:
            continue
        for old in ('window.innerWidth*devicePixelRatio', 'window.innerHeight*devicePixelRatio',
                    'setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)'):
            text = text.replace(old, old.replace('devicePixelRatio', 'Math.min(devicePixelRatio||1,2)'))
        file.write_text(text)
        changes.append(file.relative_to(folder).as_posix())
    return changes


def stage(design, source):
    original = source / design['slug']
    folder = DEST / design['slug']
    # Only replace our generated export; the source directory is never modified.
    prior_report = folder / 'import-report.json'
    if prior_report.exists():
        prior = json.loads(prior_report.read_text())
        if prior.get('sourceDirectory') == str(original):
            shutil.rmtree(folder)
    folder.mkdir(parents=True, exist_ok=True)
    records = []
    rewrites = {}
    original_hashes = {}
    for file in original.rglob('*'):
        relative = file.relative_to(original)
        if not file.is_file() or file.suffix.lower() not in RUNTIME_EXTENSIONS or any(part in ('original-build', '.git', 'node_modules') for part in relative.parts) or file.name == 'mirror.json':
            continue
        data = file.read_bytes()
        original_hashes[relative.as_posix()] = hashlib.sha256(data).hexdigest()
        target = folder / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    files = [p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp', '.mp4')]
    def optimize(file):
        original_data = file.read_bytes()
        if file.suffix.lower() == '.mp4':
            compressed, method = stream_copy_video(original_data, file.suffix)
            extension = file.suffix
        else:
            compressed, extension, method = lossless_image(original_data, file.suffix)
        target = file.with_suffix(extension)
        if len(compressed) < len(original_data) or (method.startswith('MP4') and len(compressed) == len(original_data)):
            target.write_bytes(compressed)
            if target != file:
                # Originals remain in the source repository; imported copy is replaceable.
                file.unlink()
            return file, target, len(original_data), len(compressed), method
        return file, file, len(original_data), len(original_data), 'original retained'
    with ThreadPoolExecutor(max_workers=4) as pool:
        for old, new, before, after, method in pool.map(optimize, files):
            if old != new:
                rewrites[old.relative_to(folder).as_posix()] = new.relative_to(folder).as_posix()
            records.append({'path': new.relative_to(folder).as_posix(), 'before': before, 'after': after, 'method': method})

    routing_patches = 0
    for file in folder.rglob('*'):
        if not file.is_file() or file.suffix not in TEXT_EXTENSIONS or file.name == 'import-report.json': continue
        text = file.read_text()
        for old, new in rewrites.items():
            text = text.replace(old, new)
            # Bundles may address sibling assets by filename instead of full path.
            if old.startswith('assets/'):
                text = text.replace('./' + Path(old).name, './' + Path(new).name)
                text = re.sub(r'''(["'`])''' + re.escape(Path(old).name) + r'''\1''',
                              lambda match: match[1] + Path(new).name + match[1], text)
        if file.suffix in ('.js', '.mjs'):
            text, count = re.subn(r'\(\{routeTree:', '({basepath:' + json.dumps('/previews/' + design['slug']) + ',routeTree:', text)
            routing_patches += count
        # Root-relative references that resolve to files within this export must
        # stay in this preview, rather than pointing at the main site's root.
        def root_reference(match):
            quote, path = match.groups()
            local = path.split('?', 1)[0].split('#', 1)[0]
            if (folder / local).is_file():
                return quote + '/previews/' + design['slug'] + '/' + path + quote
            return match[0]
        text = re.sub(r'''(["'`])/([^"'`\s<>]+)\1''', root_reference, text)
        file.write_text(text)
    # Imports are explicit samples; block native form submissions before template handlers.
    entry = folder / 'index.html'
    text = entry.read_text()
    text = text.replace('<head>', '<head><script src="/previews/names.js"></script>', 1)
    text = text.replace('</head>', '<script src="/previews/demo-guard.js"></script></head>', 1)
    entry.write_text(text)
    module_data = folder / 'content/wedding-data.js'
    if module_data.exists() and 'export const weddingData' in module_data.read_text():
        module_data.write_text(module_data.read_text() + '\nwindow.InvitationNames?.applyData(weddingData);\n')
    export_repairs = repair_archived_exports(folder)
    mobile_canvas_repairs = repair_mobile_canvas(folder)
    repairs = repair_optional_dependencies(folder)
    localize(folder)
    for record in records:
        record['path'] = record['path'].replace(MEDIA_SOURCE, MEDIA_TARGET)
    report = {**design, 'sourceDirectory': str(original), 'status': 'staged', 'routingPatches': routing_patches,
              'originalFileHashes': original_hashes, 'optimizations': records, 'optionalDependencyFallbacks': repairs,
              'exportRepairs': export_repairs, 'mobileCanvasRepairs': mobile_canvas_repairs,
              'assetBytesBefore': sum(r['before'] for r in records), 'assetBytesAfter': sum(r['after'] for r in records)}
    (folder / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(f"{design['slug']}: {report['assetBytesBefore']} → {report['assetBytesAfter']} asset bytes", flush=True)
    return report


def repair_archived_exports(folder):
    """Resolve namespace and subdirectory defects in archived production copies."""
    repairs = []
    for path in repair_assets(folder):
        repairs.append({'file': path, 'repair': 'Repair catalogue artwork and optional media references'})
    entry = folder / 'index.html'
    if entry.exists():
        original = entry.read_text()
        # Browsers do not support video as a link-preload destination. The
        # video's own preload setting controls loading instead.
        text = re.sub(r'<link\b(?=[^>]*\brel=["\']preload["\'])(?=[^>]*\bas=["\']video["\'])[^>]*>', '', original, flags=re.I)
        if text != original:
            entry.write_text(text)
            repairs.append({'file': 'index.html', 'repair': 'Remove unsupported video link preload'})
    # These decorative files are absent from the archived exports. Use existing
    # local artwork only when an original is unavailable; never replace photos.
    missing_artwork = {
        'marigold-bhavan': {'paper-DO4RrJfl.jpg': '/assets/preview-paper-grain.svg'},
        'toran-telugu': {'paper-texture-DgpYz7nq.jpg': '/assets/preview-paper-grain.svg',
                         'footer-bg-PVOXZvic.jpg': '../editable/assets/hero-flatlay.jpg'},
        'sage-parchment': {'jaali-fNNuOcAD.jpg': '/assets/preview-jaali.svg'},
    }.get(folder.name, {})
    for file in folder.rglob('*.js'):
        original = text = file.read_text()
        for missing, replacement in missing_artwork.items():
            if not (file.parent / missing).exists():
                pattern = r'new URL\(([`\'\"])' + re.escape(missing) + r'\1,import\.meta\.url\)'
                text, count = re.subn(pattern, lambda _: 'new URL(' + json.dumps(replacement) + ',import.meta.url)', text)
                if count:
                    repairs.append({'file': str(file.relative_to(folder)), 'repair': 'Missing decorative asset fallback',
                                    'missing': missing, 'replacement': replacement})
        start = text.find('var _w=window.WEDDING_DATA')
        if start >= 0:
            end = text.find(';', start) + 1
            text = text[:start] + re.sub(r'\b_w\b', '__inviteWeddingData', text[start:end]) + text[end:]
            repairs.append({'file': str(file.relative_to(folder)), 'repair': 'Namespace editable data to avoid vendor variable collisions'})
        if '__inviteWeddingData=window.WEDDING_DATA' in text:
            text = re.sub(r'\b_w\.', '__inviteWeddingData.', text)
        if '"code-path":"src/App.tsx:7:7",path:"/"' in text and '"code-path":"src/main.tsx:9:5",basename:' not in text:
            text = text.replace('"code-path":"src/main.tsx:9:5",children:',
                                '"code-path":"src/main.tsx:9:5",basename:"/previews/' + folder.name + '",children:')
        text = text.replace('basepath:``,serializationAdapters:', 'basepath:"/previews/' + folder.name + '",serializationAdapters:')
        for router in set(re.findall(r'function (\w+)\(\{basename:', text)):
            snapshot = text
            def basename(match):
                fields = snapshot[match.end():snapshot.find('children:', match.end())]
                return match[0] if 'basename:' in fields else match[0] + 'basename:"/previews/' + folder.name + '",'
            text = re.sub(r'(\.jsx\(' + re.escape(router) + r',\{)', basename, snapshot)
        if folder.name == 'diya-haveli':
            text = text.replace('},var __inviteWeddingData=', '};var __inviteWeddingData=')
            text = text.replace('var h_=__inviteWeddingData.story||[', 'var h_=(__inviteWeddingData.story||[')
        if folder.name == 'emerald-nikah':
            text = re.sub(r'var _zv_unused=[\s\S]*?\];function Bv', 'function Bv', text)
        if folder.name in ('gilded-hall', 'diya-haveli'):
            text = re.sub(r'\(0,(\w+)\.hydrateRoot\)\(',
                          lambda match: hydration_wrapper(match[1]), text)
        if text != original:
            file.write_text(text)
    if folder.name == 'wax-seal-royale':
        entry = folder / 'index.html'
        text = entry.read_text()
        text = re.sub(r'<script\b[^>]*>(?:(?!</script>)[\s\S])*tilda-stat-1\.0\.min\.js(?:(?!</script>)[\s\S])*</script>', '', text, flags=re.I)
        entry.write_text(text)
    if folder.name == 'lake-pichola-royal':
        file = folder / 'sections/gallery.js'
        file.write_text(file.read_text().replace('id="gallery-lightbox-img" src=""', 'id="gallery-lightbox-img"'))
    return repairs


def hydration_wrapper(alias):
    # Archived SSR snapshots differ from live countdowns/editable data. React
    # recovers normally; record that recovery separately from uncaught failures.
    return '((container,children)=>{' + alias + '.hydrateRoot(container,children,{onRecoverableError:error=>{console.warn("Preview hydration recovered:",error.message);window.InvitationDemoDiagnostics?.recoveries.push(error.message)}})})('


def repair_optional_dependencies(folder):
    """Absent optional effects use native scrolling / an empty decoration."""
    repairs = []
    for file in folder.rglob('*.js'):
        text = file.read_text()
        def optional_import(match):
            relative = match[1]
            if (file.parent / relative).is_file(): return match[0]
            repairs.append({'file': str(file.relative_to(folder)), 'missing': relative,
                            'fallback': 'native scrolling' if relative.startswith('./lenis-') else 'no optional Aurora overlay'})
            return 'Promise.resolve({default:null})' if relative.startswith('./lenis-') else 'Promise.resolve({default:()=>null})'
        text = re.sub(r'''import\(["'`](\./(?:lenis-|Aurora-)[^"'`]+)["'`]\)''', optional_import, text)
        if 'Promise.resolve({default:null})' in text:
            text = re.sub(r'(?<!return;)let (\w+)=new (\w+)\(\{(lerp|duration):',
                          lambda match: 'if(typeof ' + match[2] + '!="function")return;' + match[0], text)
        file.write_text(text)
    return repairs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--design')
    parser.add_argument('--all', action='store_true')
    args = parser.parse_args()
    designs = [d for d in catalogue() if (args.source / d['slug'] / 'index.html').is_file()]
    if args.design: designs = [d for d in designs if d['slug'] == args.design]
    elif not args.all: designs = designs[:1]
    if not designs: parser.error('No matching template exports found')
    # Finish each template before moving on; preserve the original exports intact.
    reports = [stage(d, args.source) for d in designs]
    (DEST / 'local-import-report.json').write_text(json.dumps(reports, indent=2) + '\n')


if __name__ == '__main__':
    main()
