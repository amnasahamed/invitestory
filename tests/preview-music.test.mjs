import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('previews/music.js', root), 'utf8');
const tracks = vm.runInNewContext(source.match(/const TRACKS = (\[[\s\S]*?\n {2}\]);/)[1]);
const ownAudio = /\.mp3|new Audio|<audio|AudioContext/;
// Its player only runs when WEDDING_DATA.media.audio is set, and the sample sets none.
const inertPlayers = new Set(['Diya Haveli']);

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

test('every sample invitation has music: its own soundtrack or the tap-to-open rotation', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('previews/manifest.json', root), 'utf8'));
  let rotation = 0;
  for (const design of manifest.designs) {
    if (design.url.startsWith('/dearly/')) continue;
    const folder = new URL(design.url.slice(1), root);
    const html = fs.readFileSync(new URL('index.html', folder), 'utf8');
    const tag = html.match(/<script src="\/previews\/music\.js\?v=\d+" data-pool="(\w+)" defer><\/script>/);
    const own = !inertPlayers.has(design.name) && filesUnder(folder).some(file => /\.(html|js)$/.test(file.pathname) && ownAudio.test(fs.readFileSync(file, 'utf8')));
    if (tag) {
      rotation += 1;
      assert.ok(!own, `${design.name} already has music; two soundtracks would play together`);
      assert.match(source, new RegExp(`\\b${tag[1]}: \\(\\)`), `${design.name} uses a known playlist`);
    } else {
      assert.ok(own, `${design.name} has no music; add the music.js tag`);
    }
  }
  assert.equal(rotation, 31);
});

test('every rotation track ships as a small 30-second clip', () => {
  assert.equal(tracks.length, 41);
  assert.equal(new Set(tracks.map(t => t[0])).size, tracks.length);
  for (const [file] of tracks) {
    const { size } = fs.statSync(new URL(`previews/_music/${file}.mp3`, root));
    assert.ok(size > 400_000 && size < 520_000, `${file}.mp3 is ${size} bytes`);
  }
  assert.deepEqual(fs.readdirSync(new URL('previews/_music/', root)).sort(), [...tracks.map(t => `${t[0]}.mp3`)].sort());
});

test('Nikah and church playlists leave out Hindu devotional songs', () => {
  const pick = pool => vm.runInNewContext(`(${source.match(/const POOLS = (\{[\s\S]*?\n {2}\});/)[1]})`, { TRACKS: tracks })[pool]().map(t => t[0]);
  for (const pool of ['nikah', 'romantic']) {
    for (const song of ['wah-wah-ramji', 'maiyya-yashoda', 'prem-ratan-dhan-payo']) assert.ok(!pick(pool).includes(song), `${pool} excludes ${song}`);
  }
  assert.ok(!pick('romantic').includes('yeh-ladka-hai-allah'));
  assert.equal(pick('festive').length, tracks.length);
});
