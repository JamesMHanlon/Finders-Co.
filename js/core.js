// ---------------------------------------------------------------
//  Finders & Co. — core helpers: seeded RNG + hand-drawn primitives
// ---------------------------------------------------------------
'use strict';

const TAU = Math.PI * 2;
const INK = '#2e2535';

function RNG(seed) {
  let a = seed >>> 0;
  const f = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (lo, hi) => lo + (hi - lo) * f();
  f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.chance = (p) => f() < p;
  return f;
}

function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function shade(hex, amt) {
  // amt -1..1 : darken / lighten
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
}

// ------------- hand-drawn drawing primitives ------------------
const D = {
  lw: 1.1,
  jit: 0.55,

  path(c, pts, smooth, closed) {
    c.beginPath();
    const n = pts.length;
    if (!smooth || n < 3) {
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n; i++) c.lineTo(pts[i][0], pts[i][1]);
      if (closed) c.closePath();
      return;
    }
    if (closed) {
      const a = pts[n - 1], b = pts[0];
      c.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      c.closePath();
    } else {
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) {
        const p = pts[i], q = pts[i + 1];
        c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      c.lineTo(pts[n - 1][0], pts[n - 1][1]);
    }
  },

  shape(c, pts, fill, r, o) {
    o = o || {};
    const j = o.j !== undefined ? o.j : D.jit;
    const jp = r && j > 0 ? pts.map(p => [p[0] + (r() - 0.5) * 2 * j, p[1] + (r() - 0.5) * 2 * j]) : pts;
    D.path(c, jp, !!o.smooth, !o.open);
    if (fill && !o.open) { c.fillStyle = fill; c.fill(); }
    if (o.stroke !== false) {
      c.strokeStyle = o.stroke || INK;
      c.lineWidth = o.lw || D.lw;
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.stroke();
    }
  },

  ellipse(c, cx, cy, rx, ry, fill, r, o) {
    o = o || {};
    const n = o.n || Math.max(8, Math.min(26, Math.round((rx + ry) * 0.8)));
    const a0 = r ? r() * TAU : 0;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    const oo = Object.assign({}, o, { smooth: true });
    if (oo.j === undefined) oo.j = Math.min(D.jit, (rx + ry) * 0.06);
    D.shape(c, pts, fill, r, oo);
  },

  rect(c, x, y, w, h, fill, r, o) {
    o = o || {};
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    if (w > 30 || h > 30) {
      pts.splice(1, 0, [x + w / 2, y]);
      pts.splice(3, 0, [x + w, y + h / 2]);
      pts.splice(5, 0, [x + w / 2, y + h]);
      pts.push([x, y + h / 2]);
    }
    const oo = Object.assign({}, o);
    if (oo.j === undefined) oo.j = Math.min(D.jit, Math.min(w, h) * 0.12);
    D.shape(c, pts, fill, r, oo);
  },

  poly(c, pts, fill, r, o) { D.shape(c, pts, fill, r, o); },

  line(c, x1, y1, x2, y2, r, o) {
    o = o || {};
    const j = o.j !== undefined ? o.j : D.jit;
    const mx = (x1 + x2) / 2 + (r ? (r() - 0.5) * 2 * j : 0);
    const my = (y1 + y2) / 2 + (r ? (r() - 0.5) * 2 * j : 0);
    c.beginPath();
    c.moveTo(x1, y1);
    c.quadraticCurveTo(mx, my, x2, y2);
    c.strokeStyle = o.stroke || INK;
    c.lineWidth = o.lw || D.lw;
    c.lineCap = 'round';
    c.stroke();
  },

  // thick limb with ink outline
  limb(c, x1, y1, x2, y2, col, w, r) {
    D.line(c, x1, y1, x2, y2, r, { lw: w + 1.8, j: 0.2 });
    D.line(c, x1, y1, x2, y2, null, { lw: w, stroke: col });
  },

  curve(c, pts, r, o) {
    D.shape(c, pts, null, r, Object.assign({ smooth: true, open: true }, o || {}));
  },

  dot(c, x, y, rad, col) {
    c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fillStyle = col || INK; c.fill();
  },

  shadow(c, cx, cy, rx, ry, a) {
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    c.fillStyle = 'rgba(46,37,53,' + (a || 0.16) + ')'; c.fill();
  },

  text(c, str, x, y, size, col, align) {
    c.font = 'bold ' + size + 'px "Patrick Hand", "Segoe Print", "Comic Sans MS", cursive';
    c.textAlign = align || 'center'; c.textBaseline = 'middle';
    c.fillStyle = col || INK; c.fillText(str, x, y);
  },
};
