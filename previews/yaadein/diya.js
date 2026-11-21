/* A small, on-demand WebGL1 clay diya. No textures, libraries, or network calls. */

const VERTEX = `
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute float aGloss;
uniform mat4 uMatrix;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vGloss;
void main() {
  vPosition = aPosition;
  vNormal = aNormal;
  vColor = aColor;
  vGloss = aGloss;
  gl_Position = uMatrix * vec4(aPosition, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uEye;
uniform float uLit;
uniform float uEmissive;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vGloss;
void main() {
  vec3 n = normalize(vNormal);
  vec3 view = normalize(uEye - vPosition);
  if (uEmissive > 0.5) {
    float face = pow(max(dot(n, view), 0.0), 0.65);
    gl_FragColor = vec4(mix(vColor * 0.94, vec3(1.0, 0.91, 0.61), face * 0.32), 1.0);
    return;
  }
  vec3 light = normalize(vec3(-0.65, 1.0, 0.72));
  float diffuse = max(dot(n, light), 0.0);
  float sky = 0.34 + 0.11 * max(n.y, 0.0);
  vec3 color = vColor * (sky + diffuse * 0.63);
  float specular = pow(max(dot(n, normalize(light + view)), 0.0), 24.0);
  color += vec3(1.0, 0.81, 0.56) * specular * vGloss;
  vec3 flameVector = vec3(0.0, 0.73, 1.24) - vPosition;
  float bounce = max(dot(n, normalize(flameVector)), 0.0);
  bounce *= uLit * 0.17 / (0.65 + dot(flameVector, flameVector));
  color += vec3(1.0, 0.53, 0.18) * bounce;
  gl_FragColor = vec4(color, 1.0);
}`;

const SOFT_VERTEX = `
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aUV;
uniform mat4 uMatrix;
varying vec2 vUV;
void main() {
  vUV = aUV;
  gl_Position = uMatrix * vec4(aPosition, 1.0);
}`;

const SOFT_FRAGMENT = `
precision mediump float;
uniform vec4 uColor;
varying vec2 vUV;
void main() {
  float r = length(vUV);
  float alpha = (1.0 - smoothstep(0.12, 1.0, r));
  alpha *= alpha * uColor.a;
  gl_FragColor = vec4(uColor.rgb, alpha);
}`;

const TAU = Math.PI * 2;
const EYE = [2.7, 2.9, 4.4];
const TARGET = [0, 0.35, 0.12];
const FLAME_BASE = [0.005, 0.515, 1.245];
const sub = (a, b) => a.map((v, i) => v - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = a => { const n = Math.hypot(...a) || 1; return a.map(v => v / n); };

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  }
  return out;
}

function camera(aspect) {
  const z = unit(sub(EYE, TARGET)), x = unit(cross([0, 1, 0], z)), y = cross(z, x);
  const view = new Float32Array([
    x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -dot(x, EYE), -dot(y, EYE), -dot(z, EYE), 1
  ]);
  const halfHeight = aspect >= 1 ? 1.29 : 1.29 / aspect;
  const halfWidth = halfHeight * aspect;
  const near = 0.1, far = 20;
  const projection = new Float32Array([
    1 / halfWidth, 0, 0, 0, 0, 1 / halfHeight, 0, 0,
    0, 0, -2 / (far - near), 0, 0, 0, -(far + near) / (far - near), 1
  ]);
  return multiply(projection, view);
}

/* Smooth normals are accumulated on a welded angular seam, not faked in 2D. */
function surface(rows, segments, sample) {
  const points = [], normals = [], triangles = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < segments; i++) {
    points.push(sample(j, TAU * i / segments)); normals.push([0, 0, 0]);
  }
  for (let j = 0; j < rows - 1; j++) for (let i = 0; i < segments; i++) {
    const a = j * segments + i, b = j * segments + (i + 1) % segments;
    const c = b + segments, d = a + segments;
    triangles.push([a, b, d], [b, c, d]);
  }
  for (const ids of triangles) {
    const [a, b, c] = ids.map(i => points[i].position);
    const n = cross(sub(b, a), sub(c, a));
    for (const id of ids) for (let k = 0; k < 3; k++) normals[id][k] += n[k];
  }
  const output = [];
  for (const ids of triangles) for (const id of ids) {
    const p = points[id], n = p.normal || unit(normals[id]);
    output.push(...p.position, ...n, ...p.color, p.gloss || 0);
  }
  return output;
}

function boundary(theta) {
  const angle = Math.atan2(Math.sin(theta), Math.cos(theta));
  const spout = Math.exp(-((angle / 0.29) ** 2));
  return {
    x: Math.sin(theta) * (1 + 0.006 * Math.sin(5 * theta)),
    z: Math.cos(theta) * (0.94 + 0.39 * spout + 0.007 * Math.sin(3 * theta)),
    rise: 0.012 * spout + 0.006 * Math.sin(3 * theta + 0.4)
  };
}

function makeGeometry() {
  // The profile closes beneath the bowl and returns down its open inner cavity.
  const profile = [
    [0, 0.075], [0.33, 0.075], [0.57, 0.095], [0.76, 0.16],
    [0.91, 0.29], [0.995, 0.405], [1.012, 0.436], [0.997, 0.461],
    [0.965, 0.466], [0.928, 0.433], [0.84, 0.313], [0.69, 0.225],
    [0.45, 0.194], [0.18, 0.19], [0, 0.19]
  ];
  const bowl = surface(profile.length, 80, (j, theta) => {
    const [r, h] = profile[j], edge = boundary(theta);
    const variation = 1 + 0.022 * Math.sin(theta * 7 + j * 0.2) + 0.012 * Math.sin(theta * 13);
    const lip = j >= 6 && j <= 9;
    const color = (lip ? [0.72, 0.37, 0.22] : j >= 10 ? [0.59, 0.265, 0.16] : [0.66, 0.30, 0.19]).map(v => v * variation);
    return { position: [r * edge.x, h + edge.rise * r, r * edge.z], color, gloss: 0.045,
      normal: r === 0 ? [0, j === 0 ? -1 : 1, 0] : null };
  });
  // A shallow, satin mustard oil surface remains visibly below the raised lip.
  const oil = surface(3, 64, (j, theta) => {
    const r = [0.725, 0.40, 0][j], b = boundary(theta);
    return { position: [b.x * r, 0.251, b.z * r], normal: [0, 1, 0],
      color: [0.43 + 0.035 * j, 0.285 + 0.022 * j, 0.095], gloss: 0.21 };
  });
  const wickPath = [[0, 0.27, 0.61], [0, 0.30, 0.78], [0, 0.375, 0.99], [0.003, 0.458, 1.15], FLAME_BASE];
  const wick = surface(wickPath.length, 14, (j, theta) => {
    const p = wickPath[j];
    const tangent = unit(sub(wickPath[Math.min(j + 1, wickPath.length - 1)], wickPath[Math.max(0, j - 1)]));
    const side = unit(cross(tangent, [1, 0, 0]));
    const radius = j === wickPath.length - 1 ? 0.021 : 0.031;
    const weave = 1 + 0.045 * Math.cos(theta * 4 + j * 2);
    return {
      position: [p[0] + Math.cos(theta) * radius, p[1] + side[1] * Math.sin(theta) * radius, p[2] + side[2] * Math.sin(theta) * radius],
      color: (j >= 3 ? [0.22, 0.115, 0.075] : [0.79, 0.64, 0.43]).map(v => v * weave), gloss: 0.02
    };
  });
  const flameProfile = [[0.025, 0], [0.065, 0.055], [0.093, 0.12], [0.084, 0.20], [0.061, 0.30], [0.034, 0.40], [0.012, 0.49], [0, 0.55]];
  const flame = surface(flameProfile.length, 32, (j, theta) => {
    const [r, h] = flameProfile[j], t = h / 0.55;
    return { position: [FLAME_BASE[0] + Math.sin(theta) * r - 0.045 * t * t,
      FLAME_BASE[1] + h, FLAME_BASE[2] + Math.cos(theta) * r * 0.72],
      color: [1, 0.49 + t * 0.32, 0.10 + t * 0.36], gloss: 0 };
  });
  const quad = (center, right, up) => {
    const out = [];
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [-1, 1], [1, -1], [1, 1]]) {
      out.push(...center.map((v, i) => v + right[i] * x + up[i] * y), x, y);
    }
    return out;
  };
  const view = unit(sub(EYE, TARGET)), right = unit(cross([0, 1, 0], view)), up = cross(view, right);
  return {
    body: new Float32Array([...bowl, ...oil, ...wick]), flame: new Float32Array(flame),
    shadow: new Float32Array(quad([0.09, 0.015, -0.02], [1.47, 0, 0], [0, 0, 1.46])),
    halo: new Float32Array(quad([FLAME_BASE[0] - 0.015, 0.81, FLAME_BASE[2]], right.map(v => v * 0.48), up.map(v => v * 0.64)))
  };
}

function program(gl, vertexSource, fragmentSource) {
  const shaders = [], p = gl.createProgram();
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
      const s = gl.createShader(type); shaders.push(s); gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const stage = type === gl.VERTEX_SHADER ? 'vertex' : 'fragment';
        throw new Error(`Diya ${stage} shader failed: ${gl.getShaderInfoLog(s) || 'no compiler details'}`);
      }
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Diya program link failed: ${gl.getProgramInfoLog(p) || 'no linker details'}`);
    return p;
  } catch (error) { gl.deleteProgram(p); throw error; }
  finally { for (const s of shaders) gl.deleteShader(s); }
}

// Software projection of exactly the same world-space meshes. This is not a flat
// replacement illustration: visibility, depth, and light come from the geometry.
function initCanvasDiya(canvas, { isReduced }) {
  let context;
  try { context = canvas.getContext('2d', { alpha: true }); }
  catch (error) { console.warn('[diya:canvas2d-unavailable]', error); return null; }
  if (!context) { console.warn('[diya:canvas2d-unavailable] No 2D drawing context.'); return null; }

  let geometry, meshes;
  const light = unit([-0.65, 1, 0.72]);
  const rgb = color => `rgb(${color.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255)).join(',')})`;
  function shade(face, lit) {
    const n = face.normal, view = unit(sub(EYE, face.center));
    if (face.emissive) {
      const amount = Math.pow(Math.max(dot(n, view), 0), 0.65) * 0.32;
      return rgb(face.color.map((c, i) => c * 0.94 * (1 - amount) + [1, 0.91, 0.61][i] * amount));
    }
    const amount = 0.34 + 0.11 * Math.max(n[1], 0) + 0.63 * Math.max(dot(n, light), 0);
    const specular = Math.pow(Math.max(dot(n, unit(light.map((v, i) => v + view[i]))), 0), 24) * face.gloss;
    const towardFlame = sub([0, 0.73, 1.24], face.center);
    const bounce = lit ? Math.max(dot(n, unit(towardFlame)), 0) * 0.17 / (0.65 + dot(towardFlame, towardFlame)) : 0;
    return rgb(face.color.map((c, i) => c * amount + [1, 0.81, 0.56][i] * specular + [1, 0.53, 0.18][i] * bounce));
  }
  function faces(data, emissive) {
    const output = [];
    for (let i = 0; i < data.length; i += 30) {
      const vertices = [0, 10, 20].map(offset => Array.from(data.subarray(i + offset, i + offset + 3)));
      const center = [0, 1, 2].map(k => (vertices[0][k] + vertices[1][k] + vertices[2][k]) / 3);
      const actualNormal = cross(sub(vertices[1], vertices[0]), sub(vertices[2], vertices[0]));
      // Back-face rejection leaves the front outside and the open inner cavity.
      if (dot(actualNormal, sub(EYE, center)) <= 1e-10) continue;
      const normal = unit([3, 4, 5].map(k => data[i + k] + data[i + k + 10] + data[i + k + 20]));
      const color = [6, 7, 8].map(k => (data[i + k] + data[i + k + 10] + data[i + k + 20]) / 3);
      const face = { vertices, center, normal, color, emissive, gloss: (data[i + 9] + data[i + 19] + data[i + 29]) / 3 };
      face.unlit = shade(face, false); face.lit = shade(face, true); output.push(face);
    }
    return output;
  }
  try {
    geometry = makeGeometry();
    meshes = { body: faces(geometry.body, false), flame: faces(geometry.flame, true) };
  } catch (error) { console.warn('[diya:canvas2d-mesh-failed]', error); return null; }

  let lit = false, disposed = false, frame = 0, observer = null;
  function project(point, matrix, width, height) {
    const [x, y, z] = point;
    const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
    return [
      ((matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w * 0.5 + 0.5) * width,
      (0.5 - (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w * 0.5) * height,
      (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
    ];
  }
  function softQuad(data, matrix, width, height, color, alpha) {
    const [a, b, c] = [0, 5, 10].map(i => project(data.subarray(i, i + 3), matrix, width, height));
    const right = [(b[0] - a[0]) / 2, (b[1] - a[1]) / 2];
    const up = [(c[0] - a[0]) / 2, (c[1] - a[1]) / 2];
    context.save();
    context.transform(right[0], right[1], up[0], up[1], (b[0] + c[0]) / 2, (b[1] + c[1]) / 2);
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    glow.addColorStop(0, `rgba(${color},${alpha})`);
    glow.addColorStop(0.34, `rgba(${color},${alpha * 0.65})`);
    glow.addColorStop(0.70, `rgba(${color},${alpha * 0.12})`);
    glow.addColorStop(1, `rgba(${color},0)`);
    context.fillStyle = glow; context.fillRect(-1, -1, 2, 2); context.restore();
  }
  function render() {
    if (disposed) return;
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    if (typeof isReduced === 'function') isReduced();
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(box.width * dpr)), height = Math.max(1, Math.round(box.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, width, height);
    const matrix = camera(width / height);
    softQuad(geometry.shadow, matrix, width, height, '69,33,31', 0.25);
    if (lit) softQuad(geometry.halo, matrix, width, height, '255,166,56', 0.24);
    const visible = (lit ? [...meshes.body, ...meshes.flame] : meshes.body).map(face => {
      const points = face.vertices.map(p => project(p, matrix, width, height));
      return { face, points, depth: (points[0][2] + points[1][2] + points[2][2]) / 3 };
    });
    visible.sort((a, b) => b.depth - a.depth);
    context.lineWidth = 0.55 * dpr; context.lineJoin = 'round';
    for (const { face, points } of visible) {
      context.beginPath(); context.moveTo(points[0][0], points[0][1]);
      context.lineTo(points[1][0], points[1][1]); context.lineTo(points[2][0], points[2][1]); context.closePath();
      context.fillStyle = lit ? face.lit : face.unlit; context.strokeStyle = context.fillStyle;
      // A subpixel same-color seam prevents gaps between adjacent antialiased faces.
      context.fill(); context.stroke();
    }
  }
  function queueRender() {
    if (!frame && !disposed) frame = requestAnimationFrame(() => { frame = 0; render(); });
  }
  try { render(); } catch (error) { console.warn('[diya:canvas2d-render-failed]', error); return null; }
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(queueRender); observer.observe(canvas); }
  window.addEventListener('resize', queueRender, { passive: true });
  if (canvas.dataset) canvas.dataset.diyaRenderer = 'canvas2d';
  return {
    renderer: 'canvas2d',
    setLit(value) { const next = Boolean(value); if (next !== lit) { lit = next; render(); } },
    render,
    dispose() {
      if (disposed) return;
      disposed = true; if (frame) cancelAnimationFrame(frame); frame = 0;
      observer?.disconnect(); window.removeEventListener('resize', queueRender);
      context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height);
      if (canvas.dataset) delete canvas.dataset.diyaRenderer;
    }
  };
}

/**
 * initDiya(canvas, { isReduced: () => boolean })
 * Returns { renderer, setLit(boolean), render(), dispose() }. WebGL1 is preferred;
 * Canvas2D projects the same mesh if GPU rendering is unavailable. Null means neither works.
 * The canvas is decorative: give its parent a real HTML toggle button and a fallback.
 * Deliberately no oscillation, autoplay, frame loop, audio, or interaction listeners.
 * Static geometry is the same with reduced motion on or off.
 */
export function initDiya(canvas, { isReduced = () => false } = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') { console.warn('[diya:invalid-canvas] Expected an HTML canvas.'); return null; }
  let gl;
  let creationMessage = '';
  const creationError = event => { creationMessage = event.statusMessage || ''; };
  canvas.addEventListener('webglcontextcreationerror', creationError);
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' }); }
  catch (error) { console.warn('[diya:context-exception]', error); return initCanvasDiya(canvas, { isReduced }); }
  finally { canvas.removeEventListener('webglcontextcreationerror', creationError); }
  if (!gl) { console.warn('[diya:webgl-unavailable]', creationMessage || 'The browser returned no WebGL1 context.'); return initCanvasDiya(canvas, { isReduced }); }
  if (gl.isContextLost()) { console.warn('[diya:context-lost] The context was already lost during initialization.'); return initCanvasDiya(canvas, { isReduced }); }

  const geometry = makeGeometry();
  let resources = null, lit = false, disposed = false, lost = false, frame = 0, observer = null;
  function release() {
    if (!resources) return;
    for (const b of Object.values(resources.buffers)) gl.deleteBuffer(b);
    gl.deleteProgram(resources.solid); gl.deleteProgram(resources.soft); resources = null;
  }
  function build() {
    const made = { buffers: {}, solid: null, soft: null };
    try {
      made.solid = program(gl, VERTEX, FRAGMENT); made.soft = program(gl, SOFT_VERTEX, SOFT_FRAGMENT);
      for (const [name, data] of Object.entries(geometry)) {
        const b = gl.createBuffer(); if (!b) throw new Error('Diya buffer unavailable');
        made.buffers[name] = b; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      }
      made.solidAttributes = Object.fromEntries(['aPosition', 'aNormal', 'aColor', 'aGloss'].map(n => [n, gl.getAttribLocation(made.solid, n)]));
      made.softAttributes = Object.fromEntries(['aPosition', 'aUV'].map(n => [n, gl.getAttribLocation(made.soft, n)]));
      made.solidUniforms = Object.fromEntries(['uMatrix', 'uEye', 'uLit', 'uEmissive'].map(n => [n, gl.getUniformLocation(made.solid, n)]));
      made.softUniforms = Object.fromEntries(['uMatrix', 'uColor'].map(n => [n, gl.getUniformLocation(made.soft, n)]));
      resources = made;
    } catch (error) {
      for (const b of Object.values(made.buffers)) gl.deleteBuffer(b);
      if (made.solid) gl.deleteProgram(made.solid); if (made.soft) gl.deleteProgram(made.soft);
      throw error;
    }
  }
  function attributes(locations, entries, stride) {
    // Attribute slots may differ between programs. Disable stale slots first.
    for (let i = 0; i < 4; i++) gl.disableVertexAttribArray(i);
    for (const [name, size, offset] of entries) {
      const location = locations[name];
      if (location < 0) continue;
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
    }
  }
  function render() {
    if (disposed || lost || !resources || gl.isContextLost()) return;
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    // Read the preference at render time, never cache it. This renderer never animates.
    if (typeof isReduced === 'function') isReduced();
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(box.width * dpr)), h = Math.max(1, Math.round(box.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const matrix = camera(w / h), r = resources;
    gl.useProgram(r.soft); gl.uniformMatrix4fv(r.softUniforms.uMatrix, false, matrix); gl.depthMask(false);
    for (const name of lit ? ['shadow', 'halo'] : ['shadow']) {
      gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers[name]);
      attributes(r.softAttributes, [['aPosition', 3, 0], ['aUV', 2, 12]], 20);
      gl.uniform4fv(r.softUniforms.uColor, name === 'shadow' ? [0.27, 0.13, 0.12, 0.25] : [1.0, 0.65, 0.22, 0.24]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.depthMask(true); gl.disable(gl.BLEND); gl.useProgram(r.solid);
    gl.uniformMatrix4fv(r.solidUniforms.uMatrix, false, matrix); gl.uniform3fv(r.solidUniforms.uEye, EYE);
    gl.uniform1f(r.solidUniforms.uLit, lit ? 1 : 0);
    for (const name of lit ? ['body', 'flame'] : ['body']) {
      gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers[name]);
      attributes(r.solidAttributes, [['aPosition', 3, 0], ['aNormal', 3, 12], ['aColor', 3, 24], ['aGloss', 1, 36]], 40);
      gl.uniform1f(r.solidUniforms.uEmissive, name === 'flame' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, geometry[name].length / 10);
    }
  }
  function queueRender() {
    if (!frame && !disposed && !lost) frame = requestAnimationFrame(() => { frame = 0; render(); });
  }
  function onLost(event) { event.preventDefault(); lost = true; if (frame) cancelAnimationFrame(frame); frame = 0; resources = null; }
  function onRestored() {
    if (disposed) return;
    lost = false;
    try { build(); render(); } catch (error) { lost = true; console.warn('[diya:restore-failed]', error); }
  }
  try { build(); } catch (error) { console.warn('[diya:build-failed]', error); release(); return initCanvasDiya(canvas, { isReduced }); }
  canvas.addEventListener('webglcontextlost', onLost); canvas.addEventListener('webglcontextrestored', onRestored);
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(queueRender); observer.observe(canvas); }
  window.addEventListener('resize', queueRender, { passive: true });
  try { render(); } catch (error) {
    console.warn('[diya:first-render-failed]', error);
    observer?.disconnect(); window.removeEventListener('resize', queueRender);
    canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored);
    release(); return initCanvasDiya(canvas, { isReduced });
  }
  if (canvas.dataset) canvas.dataset.diyaRenderer = 'webgl';
  return {
    renderer: 'webgl',
    setLit(value) { const next = Boolean(value); if (next !== lit) { lit = next; render(); } },
    render,
    dispose() {
      if (disposed) return;
      disposed = true; if (frame) cancelAnimationFrame(frame); frame = 0;
      observer?.disconnect(); window.removeEventListener('resize', queueRender);
      canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored);
      release(); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (canvas.dataset) delete canvas.dataset.diyaRenderer;
    }
  };
}

export default initDiya;
