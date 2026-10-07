"""Importer checks use synthetic fixtures, with no live network dependency."""
import importlib.util
import io
import tempfile
import unittest
import sys
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('import_previews', Path(__file__).parents[1] / 'tools/import_previews.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
sys.path.insert(0, str(Path(__file__).parents[1] / 'tools'))
from stage_local_previews import repair_archived_exports, repair_optional_dependencies


class Response(io.BytesIO):
    def __init__(self, data, url, content_type):
        super().__init__(data)
        self.url = url
        self.headers = type('Headers', (), {'get_content_type': lambda _: content_type})()


class ImporterTests(unittest.TestCase):
    def test_editable_data_namespace_preserves_vendor_function(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder) / 'example'
            root.mkdir()
            script = root / 'main.js'
            script.write_text('const _w=n=>n;var _w=window.WEDDING_DATA||{},_wc=_w.couple||{};const story=_w.story;')
            repair_archived_exports(root)
            source = script.read_text()
            self.assertIn('const _w=n=>n;', source)
            self.assertIn('var __inviteWeddingData=window.WEDDING_DATA', source)
            self.assertIn('const story=__inviteWeddingData.story', source)

    def test_missing_optional_chunks_do_not_break_the_invitation(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            script = root / 'main.js'
            script.write_text('import(`./lenis-missing.js`).then(({default:r})=>{let i=new r({lerp:.1});});const decoration=import(`./Aurora-missing.js`);')
            repairs = repair_optional_dependencies(root)
            source = script.read_text()
            self.assertEqual(len(repairs), 2)
            self.assertNotIn('import(`./lenis-', source)
            self.assertIn('if(typeof r!="function")return;', source)
            self.assertIn('Promise.resolve({default:()=>null})', source)

    def test_nested_dependencies_srcset_and_fragment_are_preserved(self):
        origin = 'https://example.invitestory.in/'
        fixtures = {
            origin: (b'<link rel="stylesheet" href="css/main.css"><img src="images/a.svg" srcset="images/a.svg 1x, images/b.svg 2x"><script src="js/main.js"></script>', 'text/html'),
            origin + 'css/main.css': (b'@import "extra.css";a{background:url(../images/a.svg#flower)}', 'text/css'),
            origin + 'css/extra.css': (b'body{color:red}', 'text/css'),
            origin + 'images/a.svg': (b'<svg id="flower"></svg>', 'image/svg+xml'),
            origin + 'images/b.svg': (b'<svg></svg>', 'image/svg+xml'),
            origin + 'js/main.js': (b'const poster="../images/b.svg";', 'application/javascript'),
        }
        def fetch(request, **kwargs):
            data, mime = fixtures[request.full_url]
            return Response(data, request.full_url, mime)
        with tempfile.TemporaryDirectory() as folder, patch.object(module, 'ROOT', Path(folder)), patch.object(module, 'DEST', Path(folder) / 'previews'), patch.object(module.urllib.request, 'urlopen', fetch):
            mirror = module.Mirror({'id': 1, 'name': 'Example', 'slug': 'example', 'source': origin})
            report = mirror.run()
            self.assertEqual(report['status'], 'staged')
            self.assertEqual(len(report['assets']), 6)
            css = (mirror.folder / 'resources/example.invitestory.in/css/main.css').read_text()
            self.assertIn('/previews/example/resources/example.invitestory.in/images/a.svg#flower', css)
            entry = (mirror.folder / 'index.html').read_text()
            self.assertIn('a.svg 1x, /previews/', entry)
            self.assertIn('b.svg 2x', entry)

    def test_failure_never_looks_ready(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(module, 'ROOT', Path(folder)), patch.object(module, 'DEST', Path(folder) / 'previews'), patch.object(module.urllib.request, 'urlopen', side_effect=OSError('unreachable')):
            report = module.Mirror({'id': 1, 'name': 'Example', 'slug': 'example', 'source': 'https://example.invitestory.in/'}).run()
            self.assertEqual(report['status'], 'incomplete')
            self.assertTrue(report['failures'])

    def test_image_conversion_preserves_transparent_pixels(self):
        if not module.shutil.which('cwebp'):
            self.skipTest('cwebp unavailable')
        from PIL import Image
        image = Image.new('RGBA', (128, 128), (18, 34, 56, 0))
        output = io.BytesIO()
        image.save(output, format='PNG', compress_level=0)
        original = output.getvalue()
        result, extension, optimization = module.lossless_image(original, '.png')
        self.assertLess(len(result), len(original))
        self.assertEqual(extension, '.webp')
        self.assertEqual(Image.open(io.BytesIO(result)).convert('RGBA').tobytes(), image.tobytes())


if __name__ == '__main__':
    unittest.main()
