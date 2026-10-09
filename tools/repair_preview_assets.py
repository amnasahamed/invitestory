#!/usr/bin/env python3
"""Repair asset defects discovered by the complete catalogue audit."""
from pathlib import Path


def repair_assets(folder):
    prefix = '/previews/' + folder.name + '/'
    replacements = {
        'sage-parchment': {
            'https://surya-jayesh.vercel.appassets/artwork/sage-parchment/og-image.jpg': prefix + 'assets/artwork/sage-parchment/og-image.jpg',
            'https://surya-jayesh.vercel.appexternal/media.invitestory.in/sage-parchment/og-image.jpg': prefix + 'assets/artwork/sage-parchment/og-image.jpg',
        },
        'meadow-nikah': {
            'https://invitestory-meadow-nikah.vercel.appeditable/assets/hero.jpg': prefix + 'editable/assets/hero.jpg',
        },
        'kalyana-mandapam': {
            'https://YOUR-SITE.netlify.app/assets/og-image.jpg': prefix + 'editable/assets/couple.webp',
        },
        'midnight-stargaze': {
            'https://YOUR-SITE.netlify.app/assets/og-image.jpg': prefix + 'editable/assets/couple.webp',
        },
        'wax-seal-royale': {
            'images/cdn/tild3532-3566-4962-b739-616664393337/Screenshot_2026-06-2.png': prefix + 'editable/assets/ChatGPT Image Jun 23, 2026, 04_40_29 PM.webp',
        },
        'noor-e-zahra': {
            'src:`/images/map.jpg`,alt:`Map preview of ${$.venue}`': 'src:`editable/assets/masjid.webp`,alt:`Venue illustration for ${$.venue}`',
        },
        'diya-haveli': {
            # This optional audio file never existed in the exported template.
            # Only expose music when an explicit source is configured.
            '.VITE_AUDIO_URL??`/__local/audio.mp3`,n=new Audio(e);': '.VITE_AUDIO_URL??window.WEDDING_DATA?.media?.audio;if(!e)return;let n=new Audio(e);',
            'return e?(0,a.jsx)(`button`,{type:`button`,onClick:()=>{let e=t.current;!e||o||': 'return e&&window.WEDDING_DATA?.media?.audio?(0,a.jsx)(`button`,{type:`button`,onClick:()=>{let e=t.current;!e||o||',
        },
    }.get(folder.name, {})
    changes = []
    for file in folder.rglob('*'):
        if not file.is_file() or file.suffix not in ('.html', '.css', '.js', '.mjs'):
            continue
        original = updated = file.read_text()
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if updated != original:
            file.write_text(updated)
            changes.append(file.relative_to(folder).as_posix())
    return changes


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1] / 'previews'
    for folder in root.iterdir():
        if folder.is_dir():
            changes = repair_assets(folder)
            if changes:
                print(folder.name + ': ' + ', '.join(changes))
