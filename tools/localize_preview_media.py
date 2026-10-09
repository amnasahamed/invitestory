#!/usr/bin/env python3
"""Give mirrored artwork ordinary local URLs, without an embedded media host.

Run after importing/finalizing previews. Original import reports retain their
source paths; only runtime references and mirrored artwork are migrated.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = 'external/media.invitestory.in/'
NEW = 'assets/artwork/'
TEXT = {'.html', '.css', '.js', '.mjs', '.json'}


def localize(folder):
    source = folder / OLD
    if not source.exists():
        return 0
    files = [file for file in source.rglob('*') if file.is_file()]
    # Check collisions before changing any references or moving files.
    for file in files:
        target = folder / NEW / file.relative_to(source)
        if target.exists() and target.read_bytes() != file.read_bytes():
            raise ValueError(f'Artwork destination already exists: {target}')
    for file in folder.rglob('*'):
        if not file.is_file() or file.suffix not in TEXT or file.name == 'import-report.json':
            continue
        text = file.read_text()
        updated = text.replace(OLD, NEW)
        if updated != text:
            file.write_text(updated)
    for file in files:
        target = folder / NEW / file.relative_to(source)
        target.parent.mkdir(parents=True, exist_ok=True)
        file.replace(target)
    for directory in sorted(source.rglob('*'), key=lambda path: len(path.parts), reverse=True):
        if directory.is_dir():
            directory.rmdir()
    source.rmdir()
    return len(files)


if __name__ == '__main__':
    count = sum(localize(folder) for folder in (ROOT / 'previews').iterdir() if folder.is_dir())
    print(f'Localized {count} preview artwork files.')
