#!/usr/bin/env python3
"""Audit literal runtime asset references in every catalogue design.

No network calls. HTML/CSS references use their document/stylesheet base;
module URLs use the module base. Runtime-generated asset names are validated
for the Dearly asset helper. A browser audit is still needed for interactions.
"""
import argparse
import html
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXT = r'(?:avif|gif|ico|jpe?g|png|svg|webp|mp4|mov|webm|mp3|ogg|wav|woff2?|ttf|otf|css|m?js)'
QUOTED = re.compile(r'''(["'`])([^"'`\n<>]*?\.'''+EXT+r'''(?:[?#][^"'`\n<>]*)?)\1''', re.I)
CSS_URL = re.compile(r'''url\(\s*(["']?)([^)'"\s]+)\1\s*\)''', re.I)


def audit(root=ROOT):
    manifest = json.loads((root / 'previews/manifest.json').read_text())
    results = []
    for design in manifest['designs']:
        folder = root / design['url'].split('?')[0].strip('/')
        checked, references, missing, external = set(), set(), [], set()
        for file in folder.rglob('*'):
            if not file.is_file() or file.suffix not in ('.html', '.css', '.js', '.mjs'):
                continue
            text = file.read_text()
            candidates = [(m[2], m.start()) for m in QUOTED.finditer(text)]
            candidates += [(m[2], m.start()) for m in CSS_URL.finditer(text)]
            for value, pos in candidates:
                value = html.unescape(value).replace('\\/', '/')
                if value.startswith(('data:', 'blob:', '#')) or '${' in value:
                    continue
                # Reject expressions, file-extension constants and CSS fragments.
                if not re.fullmatch(r'''[\w./% :@+(),\-]+\.'''+EXT+r'''(?:[?#][\w=&%.,:+/\-]*)?''', value, re.I):
                    continue
                path = unquote(urlsplit(value).path)
                if path.startswith('#') or not Path(path).stem.strip('.') or (value.startswith('.') and '/' not in value):
                    continue
                context = text[max(0, pos - 70):pos]
                if re.search(r'\.download\s*=\s*$', context):
                    continue  # Filename for generated canvas/blob downloads.
                if re.search(r'src\*\s*=\s*$', context):
                    continue  # CSS selector that finds an existing video source.
                if file.name.startswith('tilda-') and path.startswith('/') and context.endswith('+'):
                    continue  # Tilda appends these paths to its remote CDN host.
                if re.match(r'^(https?:)?//', value):
                    # Remote fallback scripts are vendor recovery dependencies.
                    external.add(value)
                    continue
                if path.startswith('/api/'):
                    continue
                if path.startswith('/'):
                    targets = [root / path.lstrip('/')]
                elif file.suffix in ('.html', '.css') or re.search(r'new URL\(\s*$', context):
                    targets = [file.parent / path]
                elif folder.parent.name == 'dearly' and '/' not in path:
                    targets = [folder / 'assets' / path]
                else:
                    targets = [folder / path, file.parent / path]
                found = next((target for target in targets if target.is_file()), None)
                key = (file.relative_to(root).as_posix(), value)
                if key in references:
                    continue
                references.add(key)
                if found:
                    checked.add(found.resolve().relative_to(root.resolve()).as_posix())
                else:
                    missing.append({'file': key[0], 'url': value})
        results.append({**design, 'checkedReferences': len(references), 'assets': sorted(checked),
                        'missing': missing, 'externalDependencies': sorted(external)})
    return {'scope': 'Static literal references; generated and interactive loading require the browser audit',
            'designCount': len(results), 'checkedReferences': sum(d['checkedReferences'] for d in results),
            'missingCount': sum(len(d['missing']) for d in results), 'designs': results}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    report = audit()
    if args.output:
        args.output.write_text(json.dumps(report, indent=2) + '\n')
    for design in report['designs']:
        for missing in design['missing']:
            print(design['name'] + ': ' + missing['file'] + ' -> ' + missing['url'])
    print(f"{report['designCount']} designs; {report['checkedReferences']} references; {report['missingCount']} missing")
    raise SystemExit(bool(report['missingCount']))
