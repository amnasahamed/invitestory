#!/usr/bin/env python3
"""Repair export references, share identical fonts, and summarize imported assets."""
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import shutil
from urllib.parse import unquote
from import_previews import ROOT, DEST, catalogue
from stage_local_previews import repair_optional_dependencies, repair_archived_exports


def main():
    reports = []
    for design in catalogue():
        folder = DEST / design['slug']
        if not (folder / 'index.html').exists(): continue
        report = json.loads((folder / 'import-report.json').read_text())
        original = Path(report['sourceDirectory'])
        rewrites = {}
        for source_path in report['originalFileHashes']:
            old = folder / source_path
            if not old.exists() and old.suffix in ('.png', '.jpg', '.jpeg') and old.with_suffix('.webp').exists():
                rewrites[old] = old.with_suffix('.webp')
        for file in folder.rglob('*'):
            if not file.is_file() or file.suffix not in ('.html', '.css', '.js', '.json') or file.name == 'import-report.json': continue
            text = file.read_text()
            for old, new in rewrites.items():
                text = text.replace(old.relative_to(folder).as_posix(), new.relative_to(folder).as_posix())
                if old.parent == folder / 'assets':
                    text = re.sub(r'''(["'`])(\./)?''' + re.escape(old.name) + r'''\1''',
                                  lambda match: match[1] + (match[2] or '') + new.name + match[1], text)
            file.write_text(text)
        report['optionalDependencyFallbacks'] = report.get('optionalDependencyFallbacks', []) + repair_optional_dependencies(folder)
        report['exportRepairs'] = report.get('exportRepairs', []) + repair_archived_exports(folder)
        records = report['optimizations']
        # Count each input exactly once, including a pilot that was imported twice.
        original_assets = [original / p for p in report['originalFileHashes'] if Path(p).suffix in ('.png', '.jpg', '.jpeg', '.webp', '.mp4')]
        report['assetBytesBefore'] = sum(p.stat().st_size for p in original_assets)
        report['assetBytesAfter'] = sum((folder / p.relative_to(original)).stat().st_size if (folder / p.relative_to(original)).exists() else (folder / p.relative_to(original)).with_suffix('.webp').stat().st_size for p in original_assets)
        reports.append(report)

    # Share byte-identical fonts through content-addressed URLs. CSS always uses
    # literal font URLs, so this does not alter computed media paths in scripts.
    fonts = defaultdict(list)
    for report in reports:
        for file in (DEST / report['slug']).rglob('*'):
            if file.is_file() and file.suffix in ('.woff', '.woff2', '.ttf', '.otf'):
                fonts[hashlib.sha256(file.read_bytes()).hexdigest()].append(file)
    replacements = {}
    shared = DEST / '_shared'
    shared.mkdir(exist_ok=True)
    for digest, files in fonts.items():
        if len(files) < 2: continue
        target = shared / (digest[:24] + files[0].suffix)
        shutil.copyfile(files[0], target)
        for file in files: replacements[file.resolve()] = '/' + target.relative_to(ROOT).as_posix()
    referenced = set()
    for report in reports:
        folder = DEST / report['slug']
        for file in folder.rglob('*.css'):
            text = file.read_text()
            def replace(match):
                value = match[2]
                local = (ROOT / value.lstrip('/') if value.startswith('/') else file.parent / unquote(value)).resolve()
                if local not in replacements: return match[0]
                referenced.add(local)
                return 'url("' + replacements[local] + '")'
            text = re.sub(r'''url\(\s*(["']?)([^)'"\s]+)\1\s*\)''', replace, text)
            file.write_text(text)
    # Keep any font with a non-CSS reference; remove only proven CSS-only copies.
    all_other_text = '\n'.join(p.read_text() for report in reports for p in (DEST / report['slug']).rglob('*') if p.is_file() and p.suffix in ('.html', '.js', '.mjs') and p.name != 'import-report.json')
    removed_bytes = 0
    for file in referenced:
        if file.name not in all_other_text:
            removed_bytes += file.stat().st_size
            file.unlink()
    for report in reports:
        (DEST / report['slug'] / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
    font_extensions = ('.woff', '.woff2', '.ttf', '.otf')
    original_font_bytes = sum((Path(r['sourceDirectory']) / p).stat().st_size
                              for r in reports for p in r['originalFileHashes']
                              if Path(p).suffix in font_extensions)
    current_font_bytes = sum(p.stat().st_size for r in reports
                             for p in (DEST / r['slug']).rglob('*')
                             if p.is_file() and p.suffix in font_extensions)
    current_font_bytes += sum(p.stat().st_size for p in shared.iterdir() if p.suffix in font_extensions)
    summary = {'importedTemplates': len(reports), 'assetBytesBefore': sum(r['assetBytesBefore'] for r in reports),
               'assetBytesAfter': sum(r['assetBytesAfter'] for r in reports), 'sharedFontSavings': original_font_bytes - current_font_bytes,
               'originalExportsPreserved': True, 'templates': reports}
    (ROOT / 'docs/preview-import-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps({k:v for k,v in summary.items() if k != 'templates'}))


if __name__ == '__main__':
    main()
