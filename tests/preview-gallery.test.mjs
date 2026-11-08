import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../preview-gallery.js', import.meta.url), 'utf8');
function setup({ reduced = false, storageBlocked = false, discovered = false, theme } = {}) {
  const animations = [], ids = new Map(), stored = new Map(), opened = [];
  class Element {
    constructor(tag = 'div') {
      this.tag = tag; this.children = []; this.listeners = {}; this.attributes = {};
      this.className = ''; this.textContent = ''; this.clientWidth = 260;
      const properties = new Map();
      this.style = { setProperty: (k, v) => properties.set(k, v), removeProperty: k => properties.delete(k), getPropertyValue: k => properties.get(k) || '' };
      this.classList = { add: c => { this.className += ` ${c}`; }, contains: c => this.className.split(' ').includes(c) };
    }
    append(...children) { this.children.push(...children); }
    prepend(...children) { this.children.unshift(...children); }
    replaceChildren(...children) { this.children = children; }
    get firstElementChild() { return this.children[0]; }
    setAttribute(k, v) { this.attributes[k] = v; }
    hasAttribute(k) { return k in this.attributes; }
    closest() { return null; }
    querySelector(selector) {
      if (selector === 'span') return this.children.find(e => e.tag === 'span');
      return nodes[selector];
    }
    querySelectorAll() { return this.children.flatMap(e => [e, ...e.querySelectorAll()]).filter(e => e.tag === 'button'); }
    addEventListener(name, listener) { (this.listeners[name] ||= []).push(listener); }
    async emit(name, properties = {}) {
      const event = { clientX: 0, clientY: 0, button: 0, target: this, preventDefault() {}, stopImmediatePropagation() {}, ...properties };
      for (const listener of this.listeners[name] || []) await listener(event);
    }
    animate(frames, options) { animations.push(options); return { finished: Promise.resolve(), cancel() {} }; }
  }
  const document = new Element();
  const modal = new Element(); modal.className = 'is-open';
  const nodes = Object.fromEntries(['.preview-modal-close', '.preview-browse-controls', '.preview-modal-toolbar'].map(s => [s, new Element('button')]));
  for (const id of ['preview-modal', 'preview-sheet-title', 'preview-counter-badge', 'preview-favourite-btn', 'preview-fullscreen-btn', 'preview-modal-iframe-wrap', 'preview-names-edit', 'preview-footer-share-btn', 'preview-side-prev', 'preview-side-next', 'preview-modal-iframe', 'preview-instant-pay-btn']) ids.set(id, new Element('button'));
  ids.set('preview-modal', modal);
  ids.get('preview-fullscreen-btn').append(new Element('span'));
  document.getElementById = id => ids.get(id);
  document.createElement = tag => new Element(tag);
  document.querySelector = () => null;
  const catalogue = [{ id: 1, name: 'First', image: 'first.png' }, { id: 2, name: 'Hidden', hidden: true }, { id: 3, name: 'Middle', image: 'middle.png' }, { id: 4, name: 'Last', image: 'last.png' }];
  const window = {};
  if (discovered) stored.set('invitestory.previewSwipeDiscovered', '1');
  const context = { document, window, TEMPLATE_DATABASE: catalogue, matchMedia: () => ({ matches: reduced }),
    localStorage: { getItem(k) { if (storageBlocked) throw Error('blocked'); return stored.get(k); }, setItem(k, v) { if (storageBlocked) throw Error('blocked'); stored.set(k, v); } },
    ResizeObserver: class { observe() {} }, AbortController, setTimeout,
    schedulePreviewScale() {}, openPreview(id) { opened.push(id); window.PreviewGallery.render(catalogue.find(item => item.id === id)); } };
  vm.runInNewContext(readFileSync(new URL('../preview-themes.js', import.meta.url), 'utf8') + '\n' + source, context);
  if (theme) {
    context.testTheme = theme;
    vm.runInNewContext('PreviewThemes.themeFor = () => testTheme', context);
  }
  const shell = modal.children.at(-1), stage = shell.children[1], navigation = shell.children[2];
  const frame = ids.get('preview-modal-iframe');
  frame.contentDocument = new Element('document');
  frame.getBoundingClientRect = () => ({ left: 50 + (parseFloat(stage.style.getPropertyValue('--drag-x')) || 0), top: 80, width: 260 });
  return { gallery: window.PreviewGallery, catalogue, stage, frame, hint: navigation.children[0], peeks: stage.children.filter(e => e.className.includes('preview-gallery-peek')), animations, opened, stored, cta: ids.get('preview-instant-pay-btn') };
}

test('peeks exclude hidden designs and stop at the catalogue boundaries', async () => {
  const h = setup();
  h.gallery.render(h.catalogue[0]);
  assert.equal(h.peeks[0].hidden, true);
  assert.equal(h.peeks[1].attributes['aria-label'], 'Preview Middle');
  assert.equal(await h.gallery.navigate(-1), false);
  await h.gallery.navigate(1);
  assert.deepEqual(h.opened, [3]);
  assert.equal(h.hint.hidden, true);
  assert.equal(h.stored.get('invitestory.previewSwipeDiscovered'), '1');
  await h.gallery.navigate(1);
  assert.equal(h.peeks[1].hidden, true);
  assert.equal(await h.gallery.navigate(1), false);
  assert.equal(h.animations[0].duration, 220);
});

test('short drags snap back; a drag past halfway selects the nearest neighbour', async () => {
  const h = setup(); h.gallery.render(h.catalogue[2]);
  await h.stage.emit('pointerdown', { clientX: 200 });
  await h.stage.emit('pointermove', { clientX: 150 });
  await h.stage.emit('pointerup');
  assert.deepEqual(h.opened, []);
  assert.notEqual(h.hint.hidden, true);
  await h.stage.emit('pointerdown', { clientX: 200 });
  await h.stage.emit('pointermove', { clientX: 40 });
  await h.stage.emit('pointerup');
  assert.deepEqual(h.opened, [4]);
});

test('navigation starts loading immediately and retains a tap during the slide', async () => {
  const h = setup(); h.gallery.render(h.catalogue[0]);
  const first = h.gallery.navigate(1);
  assert.deepEqual(h.opened, [3], 'loading must start before animation completion');
  await h.gallery.navigate(1);
  await first;
  assert.deepEqual(h.opened, [3, 4]);
});

test('vertical gestures leave the invitation alone; reduced motion has no animations', async () => {
  const h = setup({ reduced: true, storageBlocked: true }); h.gallery.render(h.catalogue[2]);
  await h.stage.emit('pointerdown', { clientX: 200 });
  await h.stage.emit('pointermove', { clientX: 195, clientY: 100 });
  await h.stage.emit('pointerup');
  assert.deepEqual(h.opened, []);
  await h.gallery.navigate(-1);
  assert.deepEqual(h.opened, [1]);
  assert.equal(h.hint.hidden, true);
  assert.equal(h.animations.length, 0);
});

test('a previously discovered carousel never shows the hint after initialization', () => {
  assert.equal(setup({ discovered: true }).hint.hidden, true);
});

test('CTA replaces a failing palette text color at runtime', () => {
  for (const [accent, onAccent, expected] of [['#ffffff','#ffffff','#000000'], ['#111111','#222222','#ffffff'], ['#ffffff','#171717','#171717']]) {
    const h = setup({ theme: { accent, onAccent } });
    h.gallery.render(h.catalogue[0]);
    assert.equal(h.cta.style.getPropertyValue('--gallery-cta-text'), expected);
  }
});

test('swipes inside a moving scaled iframe use stationary carousel coordinates', async () => {
  const h = setup(); h.gallery.render(h.catalogue[2]);
  await h.frame.emit('load');
  await h.frame.contentDocument.emit('pointerdown', { clientX: 350 });
  await h.frame.contentDocument.emit('pointermove', { clientX: 250 });
  await h.frame.contentDocument.emit('pointermove', { clientX: 150 });
  await h.frame.contentDocument.emit('pointerup');
  assert.deepEqual(h.opened, [4]);
});
