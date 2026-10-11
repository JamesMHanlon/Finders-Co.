// ---------------------------------------------------------------
//  Scene — procedural placement, pre-rendering, repainting, picking
// ---------------------------------------------------------------
'use strict';

function lookSimilar(a, b) {
  let s = 0;
  if (a.shirt === b.shirt) s += 2;
  if (a.hat === b.hat && (a.hat === 'none' || a.hatc === b.hatc)) s += 2;
  if (a.hair === b.hair) s += 1;
  if (a.hs === b.hs) s += 1;
  if (!!a.dress === !!b.dress) s += 0.5;
  return s >= 4;
}

function buildScene(level) {
  const W = level.W, H = level.H;
  const r = RNG(level.seed);
  const objs = [], prot = [], fps = [];
  const landmarks = {};
  for (const k in level.landmarks) landmarks[k] = Object.assign({}, level.landmarks[k]);

  // spacing grid
  const GS = 48, grid = new Map();
  const gkey = (i, j) => i * 10007 + j;
  const gridAdd = (x, y, rad) => {
    const k = gkey(Math.floor(x / GS), Math.floor(y / GS));
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push({ x, y, rad });
  };
  const gridFree = (x, y, rad) => {
    const i0 = Math.floor(x / GS), j0 = Math.floor(y / GS);
    for (let j = j0 - 2; j <= j0 + 2; j++) for (let i = i0 - 2; i <= i0 + 2; i++) {
      const cell = grid.get(gkey(i, j)); if (!cell) continue;
      for (const p of cell) {
        const dx = p.x - x, dy = (p.y - y) * 1.6;
        const need = (p.rad + rad) * 0.8;
        if (dx * dx + dy * dy < need * need) return false;
      }
    }
    return true;
  };

  const mk = (o) => {
    o.s = o.s || 1;
    if (!o.seed) o.seed = (r() * 4294967296) >>> 0;
    o.bb = artBBox(o);
    return o;
  };
  const inside = (bb, p) => p.x > bb.x0 && p.x < bb.x1 && p.y > bb.y0 && p.y < bb.y1;
  const coversProt = (o) => { for (const p of prot) if (o.y >= p.dy - 0.5 && inside(o.bb, p)) return true; return false; };
  const covered = (p) => { for (const o of objs) if (o.y >= p.dy - 0.5 && inside(o.bb, p)) return true; return false; };
  const inFoot = (x, y, rad) => { for (const f of fps) if (x + rad > f.x0 && x - rad < f.x1 && y + rad > f.y0 && y - rad < f.y1) return true; return false; };
  const protNear = (x, y, d) => { for (const p of prot) { const dx = p.x - x, dy = p.dy - y; if (dx * dx + dy * dy < d * d) return true; } return false; };
  const inB = (x, y, m) => x > m && x < W - m && y > m + 20 && y < H - m;

  // fixed & landmark objects
  const add = (o, lmName) => {
    mk(o); objs.push(o);
    const a = ART[o.type];
    const fp = a.fp !== undefined ? a.fp : 0.3;
    const bb = o.bb, bw = bb.x1 - bb.x0;
    fps.push({ x0: bb.x0 + bw * 0.06, x1: bb.x1 - bw * 0.06, y0: bb.y1 - (bb.y1 - bb.y0) * fp - 4, y1: bb.y1 });
    gridAdd(o.x, o.y, bw * 0.4);
    if (lmName) landmarks[lmName] = { x: o.x, y: o.y, rad: bw / 2 };
    return o;
  };
  level.fixed(add, r);

  const whereOk = (where, x, y, rad, opt) => {
    if (opt && opt.edge && !(x < 260 || x > W - 260 || y < 260 || y > H - 140)) return false;
    switch (where) {
      case 'water': return level.isWater(x, y) && level.isWater(x - rad, y) && level.isWater(x + rad, y);
      case 'shore': return level.isLand(x, y) && (!level.isLand(x, y - 28) || !level.isLand(x, y + 28) || !level.isLand(x - 28, y) || !level.isLand(x + 28, y));
      case 'dunes': return y > 1500 && level.isLand(x, y);
      case 'offpath': return level.isLand(x, y) && level.isLand(x - rad, y) && level.isLand(x + rad, y) && !level.onPath(x, y, rad + 4);
      case 'ice': return level.isWater(x, y);
      default: return level.isLand(x, y) && level.isLand(x - rad, y) && level.isLand(x + rad, y);
    }
  };

  // ---- case items ----
  const cases = level.cases;
  const caseItems = [];
  cases.forEach((cs, i) => {
    const lm = landmarks[cs.near];
    if (!lm) console.error('missing landmark', cs.near);
    let placed = null;
    for (let t = 0; t < 1500 && !placed; t++) {
      const a = r() * TAU;
      const spread = t > 700 ? 2.2 : t > 300 ? 1.5 : 1;
      const d = lm.rad * 0.4 + 20 + r() * (140 + lm.rad * 0.35) * spread;
      const x = lm.x + Math.cos(a) * d, y = lm.y + Math.sin(a) * d * 0.6 + 12;
      if (!inB(x, y, 60) || !level.isLand(x, y) || inFoot(x, y, 9)) continue;
      const p = { x, y: y - 8, dy: y };
      if (covered(p) || protNear(x, y, 60)) continue;
      placed = mk({ type: 'item', it: cs.item, col: cs.col, x, y, s: cs.item === 'ring' ? 0.95 : 1.05, caseIdx: i });
      objs.push(placed); caseItems.push(placed);
      prot.push(p, { x: x - 6, y: y - 8, dy: y }, { x: x + 6, y: y - 8, dy: y });
      gridAdd(x, y, 9);
    }
    if (!placed) console.warn('could not place item for', cs.name);
  });

  // ---- owners ----
  const owners = [];
  cases.forEach((cs, i) => {
    const s = cs.child ? 0.74 : 1;
    const it = caseItems.find(o => o.caseIdx === i);
    let placed = null;
    for (let t = 0; t < 3000 && !placed; t++) {
      let x, y;
      if (level.ownerNear && it && t < 1500) { const a = r() * TAU, d = r.range(120, 380); x = it.x + Math.cos(a) * d; y = it.y + Math.sin(a) * d * 0.7; }
      else { x = r.range(70, W - 70); y = r.range(120, H - 30); }
      if (!inB(x, y, 50) || !whereOk('land', x, y, 8) || inFoot(x, y, 10)) continue;
      const head = { x, y: y - 40 * s, dy: y }, torso = { x, y: y - 22 * s, dy: y };
      if (covered(head) || covered(torso) || protNear(x, y, 90)) continue;
      const o = mk({ type: 'person', look: cs.look, x, y, s, owner: i, flip: false });
      if (coversProt(o)) continue;
      placed = o; objs.push(o); owners.push(o);
      prot.push(head, torso, { x: x - 5 * s, y: y - 8, dy: y }, { x, y: y - 50 * s, dy: y });
      gridAdd(x, y, 12);
    }
    if (!placed) console.warn('could not place owner', cs.name);
  });

  // ---- bonus cats ----
  const cats = [];
  const catCols = ['#ee8a3a', '#3a3540', '#9aa1b0', '#f5f2ea', '#c98b3a'];
  for (let k = 0; k < 3; k++) {
    for (let t = 0; t < 2000; t++) {
      const x = r.range(80, W - 80), y = r.range(140, H - 40);
      if (!whereOk('land', x, y, 8) || inFoot(x, y, 8)) continue;
      const p = { x, y: y - 9, dy: y };
      if (covered(p) || protNear(x, y, 140)) continue;
      const o = mk({ type: 'cat', x, y, s: 0.95, col: r.pick(catCols), stripe: r.chance(0.5), catIdx: k, flip: r.chance(0.5) });
      if (coversProt(o)) continue;
      objs.push(o); cats.push(o); prot.push(p, { x, y: y - 14, dy: y }); gridAdd(x, y, 8);
      break;
    }
  }

  // ---- decoys ----
  const decoys = [];
  const colNames = Object.keys(COLORS);
  for (let k = 0; k < level.decoys; k++) {
    const src = r.pick(cases);
    let col = r.pick(colNames), guard = 0;
    while (cases.some(c => c.item === src.item && c.col === col) && guard++ < 20) col = r.pick(colNames);
    for (let t = 0; t < 600; t++) {
      const x = r.range(60, W - 60), y = r.range(120, H - 30);
      if (!whereOk('land', x, y, 6) || inFoot(x, y, 8)) continue;
      const p = { x, y: y - 8, dy: y };
      if (covered(p) || protNear(x, y, 45)) continue;
      const o = mk({ type: 'item', it: src.item, col, x, y, s: 1.05, decoy: true });
      objs.push(o); decoys.push(o); prot.push(p); gridAdd(x, y, 8);
      break;
    }
  }

  // ---- clutter ----
  for (const [type, n, opt] of level.clutter) {
    const a = ART[type];
    for (let k = 0; k < n; k++) {
      for (let t = 0; t < 70; t++) {
        const x = r.range(15, W - 15), y = r.range(40, H - 4);
        const s = opt.s ? r.range(opt.s[0], opt.s[1]) : r.range(0.92, 1.08);
        const rad = a.w * s * 0.35;
        if (!whereOk(opt.where, x, y, rad, opt)) continue;
        if (inFoot(x, y, rad * 0.5)) continue;
        if (!opt.tiny && !gridFree(x, y, rad)) continue;
        const o = { type, x, y, s, flip: r.chance(0.5) };
        if (opt.col) o.col = Array.isArray(opt.col) ? r.pick(opt.col) : opt.col;
        if (opt.snow) o.snow = true;
        if (opt.fruitChance && r.chance(opt.fruitChance)) o.fruit = r.pick(['#d9483b', '#f1c83b', '#ee8a3a']);
        if (opt.bloomChance && r.chance(opt.bloomChance)) o.bloom = r.pick(PAL.flower);
        if (opt.goodsChance && r.chance(opt.goodsChance)) o.goods = r.pick(opt.goods);
        if (opt.sailChance && r.chance(opt.sailChance)) o.sail = true;
        if (opt.basketChance && r.chance(opt.basketChance)) o.basket = true;
        if (opt.hat) o.hat = r.pick(opt.hat);
        if (opt.scarf) o.scarf = r.pick(opt.scarf);
        if (type === 'swimmer') o.look = randomLook(r, level.theme);
        if (type === 'dog') o.spot = r.chance(0.4);
        if (type === 'lily') o.bloom = r.chance(0.3);
        mk(o);
        if (coversProt(o)) continue;
        objs.push(o);
        if (!opt.tiny) gridAdd(x, y, rad);
        break;
      }
    }
  }

  // ---- crowd ----
  const people = owners.slice();
  const ownerLooks = cases.map(c => c.look);
  const spawnPerson = (where) => {
    for (let t = 0; t < 90; t++) {
      const x = r.range(40, W - 40), y = r.range(120, H - 10);
      if (!whereOk(where, x, y, 8) || inFoot(x, y, 8) || !gridFree(x, y, 9)) continue;
      const look = randomLook(r, level.theme);
      if (ownerLooks.some(ol => lookSimilar(ol, look))) continue;
      const child = r.chance(0.2);
      const o = mk({ type: 'person', look, x, y, s: child ? r.range(0.7, 0.78) : r.range(0.95, 1.05), flip: r.chance(0.5) });
      if (coversProt(o)) continue;
      objs.push(o); people.push(o); gridAdd(x, y, 10);
      return;
    }
  };
  for (let k = 0; k < level.crowd; k++) spawnPerson('land');
  for (let k = 0; k < (level.crowdOnIce || 0); k++) spawnPerson('ice');

  // owners and statues never flip (keep portraits matching)
  objs.sort((a, b) => (a.y - b.y) || (a.x - b.x));

  // light sources for night levels
  const lights = [];
  for (const o of objs) {
    const a = ART[o.type];
    if (a.light) for (const p of a.light(o)) lights.push({ x: o.x + p[0] * o.s * (o.flip ? -1 : 1), y: o.y + p[1] * o.s, big: o.type === 'ferris' || o.type === 'carousel' });
  }

  return { W, H, objs, caseItems, owners, cats, decoys, people, lights, landmarks, level };
}

async function renderScene(scene, onProgress) {
  const level = scene.level;
  let S = 2, cv = null, c = null;
  for (const tryS of [2, 1.5, 1]) {
    try {
      cv = document.createElement('canvas');
      cv.width = Math.round(scene.W * tryS); cv.height = Math.round(scene.H * tryS);
      c = cv.getContext('2d');
      if (c) { c.fillRect(0, 0, 1, 1); S = tryS; break; }
    } catch (e) { c = null; }
  }
  scene.canvas = cv; scene.ctx = c; scene.S = S;
  c.setTransform(S, 0, 0, S, 0, 0);
  level.ground(c, { x0: 0, y0: 0, x1: scene.W, y1: scene.H });
  const n = scene.objs.length;
  for (let i = 0; i < n; i++) {
    paintObj(c, scene.objs[i]);
    if (i % 160 === 0) { onProgress && onProgress(i / n); await new Promise(res => setTimeout(res, 0)); }
  }
  onProgress && onProgress(1);
}

function repaintRegion(scene, reg) {
  const c = scene.ctx, S = scene.S;
  c.save();
  c.setTransform(S, 0, 0, S, 0, 0);
  c.beginPath(); c.rect(reg.x0, reg.y0, reg.x1 - reg.x0, reg.y1 - reg.y0); c.clip();
  scene.level.ground(c, reg);
  for (const o of scene.objs) {
    if (o.gone) continue;
    const b = o.bb;
    if (b.x1 < reg.x0 || b.x0 > reg.x1 || b.y1 < reg.y0 || b.y0 > reg.y1) continue;
    paintObj(c, o);
  }
  c.restore();
}

function pickAt(scene, wx, wy, tol) {
  let best = null, bd = 1e9;
  const test = (o) => {
    if (o.gone) return;
    const cx = o.x, cy = o.y - 8 * o.s;
    const d = Math.hypot(wx - cx, wy - cy);
    const rad = Math.max(10.5 * o.s, tol);
    if (d < rad && d < bd) { bd = d; best = o; }
  };
  scene.caseItems.forEach(test); scene.cats.forEach(test); scene.decoys.forEach(test);
  if (best) return best;
  let bp = null;
  for (const o of scene.people) {
    const s = o.s;
    if (wx > o.x - 10 * s && wx < o.x + 10 * s && wy > o.y - 50 * s && wy < o.y + 2) {
      if (!bp || o.y > bp.y) bp = o;
    }
  }
  return bp;
}
