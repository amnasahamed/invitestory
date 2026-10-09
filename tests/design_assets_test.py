"""Check the complete catalogue and exercise asset-base resolution."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).parents[1] / 'tools'))
from audit_design_assets import audit
from repair_preview_assets import repair_assets


class DesignAssetTests(unittest.TestCase):
    def test_all_catalogue_designs_have_existing_asset_references(self):
        report = audit()
        self.assertEqual(report['designCount'], 35)
        self.assertGreater(report['checkedReferences'], 1000)
        self.assertEqual(report['missingCount'], 0, report['designs'])

    def test_missing_media_and_wrong_css_base_are_detected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            folder = root / 'previews/example'
            (folder / 'css').mkdir(parents=True)
            (folder / 'assets').mkdir()
            (root / 'previews/manifest.json').write_text(json.dumps({'designs': [
                {'name': 'Example', 'url': '/previews/example/'}]}))
            (folder / 'assets/flower.webp').write_bytes(b'fixture')
            (folder / 'index.html').write_text('<img src="assets/flower.webp"><video poster="missing.webp"><source src="missing.mp4"></video>')
            (folder / 'css/main.css').write_text('a{background:url(assets/flower.webp)}b{background:url(../assets/flower.webp)}')
            report = audit(root)
            self.assertEqual({item['url'] for item in report['designs'][0]['missing']},
                             {'missing.webp', 'missing.mp4', 'assets/flower.webp'})

    def test_module_relative_media_and_spaced_paths_are_resolved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            folder = root / 'previews/example'
            (folder / 'js').mkdir(parents=True)
            (folder / 'assets').mkdir()
            (root / 'previews/manifest.json').write_text(json.dumps({'designs': [
                {'name': 'Example', 'url': '/previews/example/'}]}))
            (folder / 'assets/flower (1).webp').write_bytes(b'fixture')
            (folder / 'js/main.js').write_text('const image=new URL("../assets/flower (1).webp",import.meta.url);link.download="generated-card.png";')
            self.assertEqual(audit(root)['missingCount'], 0)

    def test_unavailable_audio_is_optional_and_venue_art_is_local(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory) / 'diya-haveli'
            folder.mkdir()
            file = folder / 'main.js'
            file.write_text('const config={}.VITE_AUDIO_URL??`/__local/audio.mp3`,n=new Audio(e);')
            repair_assets(folder)
            self.assertNotIn('/__local/audio.mp3', file.read_text())
            self.assertIn('if(!e)return;', file.read_text())
            self.assertIn('window.WEDDING_DATA?.media?.audio', file.read_text())


if __name__ == '__main__':
    unittest.main()
