import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../scripts.js', import.meta.url), 'utf8');
const closeSource = source.slice(source.indexOf('function closePreview('), source.indexOf('// --- Preview Modal FAQ Functions'));
test('Close dismisses immediately, clears design URLs, and restores focus without history traversal', () => {
  let open = true, url = '', focused = 0, cleanup = 0;
  const classes = { contains: () => open, remove: () => { open = false; } };
  const context = vm.createContext({
    URL, setTimeout: () => {},
    previewModal: { classList: classes, contains: () => false, setAttribute: () => {} },
    InviteInteractions: { requestPreviewClose: () => { throw Error('Close must not wait for history'); }, beforePreviewClose: () => cleanup++ },
    document: { activeElement: null, documentElement: { classList: classes }, body: { classList: classes } },
    window: { location: { href: 'https://invitestory.in/?design=toran-telugu&currency=INR' }, scrollTo: () => {}, history: { state: { modalOpen: true, storyOverlay: 'preview', templateId: 3 }, replaceState: (state, _, value) => { assert.equal(state.modalOpen, false); assert.equal(state.storyOverlay, null); url = value; } } },
    previewState: { currentIndex: 2, savedScrollY: 450, lastFocusedElement: { focus: () => focused++ } },
    restoreDefaultMetaTags: () => {}, stopLoaderPulse: () => {}, phonePhysicsStop: () => {}, phonePhysicsDisableGyroscope: () => {}, closePreviewFaq: () => {},
  });
  vm.runInContext(closeSource + '\nclosePreview(); closePreview();', context);
  assert.equal(open, false);
  assert.equal(url, 'https://invitestory.in/?currency=INR');
  assert.equal(focused, 1);
  assert.equal(cleanup, 1);
  assert.equal(context.previewState.currentIndex, -1);
});
