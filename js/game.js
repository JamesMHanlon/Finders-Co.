// ---------------------------------------------------------------
//  Finders & Co. — game controller: screens, input, camera, UI
// ---------------------------------------------------------------
'use strict';

const $ = (id) => document.getElementById(id);
const FONT = '"Patrick Hand", "Segoe Print", "Comic Sans MS", cursive';
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// =========================== SAVE ===============================
const Save = {
  key: 'findersco_save_v1',
  data: null,
  defaults() { return { unlocked: 1, levels: {}, music: 60, sfx: 80, vignette: true, tutorialDone: false }; },
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.key) || 'null'); } catch (e) { this.data = null; }
    this.data = Object.assign(this.defaults(), this.data || {});
  },
  write() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { } },
  reset() {
    const keep = { music: this.data.music, sfx: this.data.sfx, vignette: this.data.vignette };
    this.data = Object.assign(this.defaults(), keep); this.write();
  },
  lv(i) { return this.data.levels[i] || { stars: 0, cats: [false, false, false], done: false, bestTime: null }; },
};
Save.load();

// =========================== CANVAS =============================
const cv = $('game'), ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = window.innerWidth; VH = window.innerHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  vignetteCv = null;
  if (G) clampCam();
}
window.addEventListener('resize', resize);

// =========================== STATE ==============================
const state = { screen: 'splash', modal: null, inGame: false, optionsReturn: null };
let G = null;
const cam = { x: 0, y: 0, z: 1 };

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('show', s.id === id));
  state.screen = id;
}
function openModal(id) {
  $('modal-wrap').classList.remove('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.toggle('show', m.id === id));
  state.modal = id;
}
function closeModal() {
  $('modal-wrap').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  state.modal = null;
}
function fadeTo(fn) {
  Sound.play('whoosh');
  $('fade').classList.add('on');
  setTimeout(async () => { await fn(); setTimeout(() => $('fade').classList.remove('on'), 80); }, 430);
}
let toastTimer = 0;
function toast(msg, ms) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms || 2600);
}
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
const fmtTime = (t) => { t = Math.floor(t); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
const itemLabel = (d) => d.col + ' ' + ITEM_NAMES[d.item];

// =========================== PORTRAITS ==========================
function drawPortrait(canvas, look) {
  const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  c.clearRect(0, 0, w, h);
  const tall = look.hat === 'tophat' || look.hat === 'chef' || look.hat === 'party';
  const top = tall ? -62 : -55, bottom = -9;
  const sc = h / (bottom - top);
  c.save(); c.translate(w / 2, -top * sc); c.scale(sc, sc);
  drawPerson(c, look, RNG(hashStr(JSON.stringify(look))));
  c.restore();
}
function drawCatIcon(canvas, col) {
  const c = canvas.getContext('2d'); c.clearRect(0, 0, canvas.width, canvas.height);
  c.save(); c.translate(canvas.width / 2, canvas.height * 0.92); const s = canvas.height / 20; c.scale(s, s);
  ART.cat.draw(c, { col: col || '#ee8a3a', stripe: true }, RNG(5)); c.restore();
}
drawCatIcon($('cat-icon'));

// =========================== TITLE BG ===========================
const titleItems = [];
(() => {
  const types = Object.keys(ITEMS), cols = Object.keys(COLORS);
  for (let i = 0; i < 26; i++) titleItems.push({
    type: types[i % types.length], col: cols[(i * 7) % cols.length], x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.012, vy: -0.006 - Math.random() * 0.01, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.5,
    s: 2.4 + Math.random() * 2.4, seed: i * 97 + 3,
  });
})();
function renderTitle(dt, t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#f3e8cc'; ctx.fillRect(0, 0, VW, VH);
  ctx.strokeStyle = 'rgba(90,140,200,0.14)'; ctx.lineWidth = 1;
  for (let y = 24; y < VH; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(217,72,59,0.25)'; ctx.beginPath(); ctx.moveTo(70, 0); ctx.lineTo(70, VH); ctx.stroke();
  for (const it of titleItems) {
    it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
    if (it.y < -0.1) { it.y = 1.1; it.x = Math.random(); }
    if (it.x < -0.1) it.x = 1.1; if (it.x > 1.1) it.x = -0.1;
    ctx.save();
    ctx.translate(it.x * VW, it.y * VH + Math.sin(t + it.seed) * 8);
    ctx.rotate(Math.sin(it.rot) * 0.5);
    ctx.scale(it.s, it.s);
    ctx.globalAlpha = 0.8;
    ITEMS[it.type](ctx, COLORS[it.col], RNG(it.seed));
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  drawVignette(0.45);
}
let vignetteCv = null;
function drawVignette(a) {
  if (!vignetteCv) {
    vignetteCv = document.createElement('canvas'); vignetteCv.width = 256; vignetteCv.height = 256;
    const c = vignetteCv.getContext('2d'); const g = c.createRadialGradient(128, 128, 60, 128, 128, 182);
    g.addColorStop(0, 'rgba(46,37,53,0)'); g.addColorStop(1, 'rgba(46,37,53,1)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  }
  ctx.save(); ctx.globalAlpha = a; ctx.drawImage(vignetteCv, 0, 0, VW, VH); ctx.restore();
}

// =========================== MENUS ==============================
function refreshTitle() {
  let done = 0, stars = 0, cats = 0;
  LEVELS.forEach((l, i) => { const s = Save.lv(i); if (s.done) done++; stars += s.stars; cats += s.cats.filter(Boolean).length; });
  $('title-progress').textContent = done ? `Shifts completed ${done}/${LEVELS.length} · ★ ${stars}/${LEVELS.length * 3} · Cats ${cats}/${LEVELS.length * 3}` : 'A brand new job awaits!';
  $('btn-play').textContent = done === 0 ? 'Start Shift' : done === LEVELS.length ? 'Play Again' : 'Continue';
}
function nextLevelIdx() {
  for (let i = 0; i < Math.min(Save.data.unlocked, LEVELS.length); i++) if (!Save.lv(i).done) return i;
  return -1;
}

const THUMB = {
  park: { sky: '#cfe8f5', ground: '#a9d07f', lm: 'fountain', extra: [['tree', 50, 0.8], ['bench', 250, 1], ['duck', 285, 1.4]] },
  market: { sky: '#bcd9ea', ground: '#d9cfba', lm: 'clocktower', extra: [['stall', 60, 0.8], ['stall', 262, 0.8], ['pigeon', 150, 1.5]] },
  beach: { sky: '#8fd0ea', ground: '#f2dfae', lm: 'lighthouse', extra: [['parasol', 60, 1.2], ['palm', 260, 1], ['crab', 200, 1.6]] },
  winter: { sky: '#d6e4f2', ground: '#f1f5fb', lm: 'xmastree', extra: [['snowman', 60, 1.4], ['pine', 262, 1.2, { snow: true }], ['sled', 210, 1.3]] },
  carnival: { sky: '#2a2350', ground: '#6f8a5a', lm: 'ferris', extra: [['balloonstand', 60, 1.1], ['lamp', 270, 1.2]] },
};
function drawThumb(canvas, level) {
  const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height, th = THUMB[level.theme];
  c.fillStyle = th.sky; c.fillRect(0, 0, w, h);
  if (level.night) for (let i = 0; i < 30; i++) D.dot(c, (i * 97) % w, (i * 53) % (h * 0.5), 1.2, '#fff8d0');
  c.fillStyle = th.ground; c.fillRect(0, h * 0.62, w, h);
  if (level.theme === 'beach') { c.fillStyle = '#6fbfdc'; c.fillRect(0, h * 0.5, w, h * 0.14); }
  const a = ART[th.lm];
  const s = Math.min((h * 0.8) / a.h, (w * 0.62) / a.w);
  paintObj(c, { type: th.lm, x: w / 2, y: h * 0.92, s, seed: 42 });
  for (const e of th.extra) paintObj(c, Object.assign({ type: e[0], x: e[1] / 320 * w, y: h * 0.95, s: e[2] * w / 320, seed: 9 }, e[3] || {}));
  if (level.night) { c.fillStyle = 'rgba(20,14,50,0.35)'; c.fillRect(0, 0, w, h); }
}
function buildLevelGrid() {
  const grid = $('level-grid'); grid.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const s = Save.lv(i), locked = i >= Save.data.unlocked;
    const el = document.createElement('div');
    el.className = 'lvl paper' + (locked ? ' locked' : '');
    const stars = [0, 1, 2].map(k => k < s.stars ? '<b>★</b>' : '★').join('');
    el.innerHTML = `<div class="lvl-num">Shift ${i + 1}</div><canvas width="320" height="200"></canvas>${locked ? '<div class="lock">🔒</div>' : ''}
      <div class="lvl-name">${lv.name}</div><div class="lvl-stars">${stars}</div>
      <div class="lvl-meta">${lv.cases.length} cases · cats ${s.cats.filter(Boolean).length}/3${s.bestTime ? ' · best ' + fmtTime(s.bestTime) : ''}</div>`;
    drawThumb(el.querySelector('canvas'), lv);
    el.onclick = () => {
      if (locked) { Sound.play('wrong'); toast('Finish the previous shift to unlock this one.'); return; }
      Sound.play('click'); fadeTo(() => startLevel(i));
    };
    grid.appendChild(el);
  });
}

// =========================== OPTIONS ============================
function syncOptions() {
  $('opt-music').value = Save.data.music; $('opt-music-v').textContent = Save.data.music;
  $('opt-sfx').value = Save.data.sfx; $('opt-sfx-v').textContent = Save.data.sfx;
  $('opt-vignette').checked = Save.data.vignette;
  $('opt-reset').classList.remove('armed'); $('opt-reset').textContent = 'Reset Progress';
}
function applyVolumes() { Sound.setVolumes(Save.data.music / 100, Save.data.sfx / 100); }
$('opt-music').addEventListener('input', e => { Save.data.music = +e.target.value; $('opt-music-v').textContent = e.target.value; applyVolumes(); Save.write(); });
$('opt-sfx').addEventListener('input', e => { Save.data.sfx = +e.target.value; $('opt-sfx-v').textContent = e.target.value; applyVolumes(); Save.write(); });
$('opt-sfx').addEventListener('change', () => Sound.play('pickup'));
$('opt-vignette').addEventListener('change', e => { Save.data.vignette = e.target.checked; Save.write(); });
$('opt-fullscreen').onclick = () => {
  try {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  } catch (e) { toast('Fullscreen is not available here.'); }
};
$('opt-reset').onclick = () => {
  const b = $('opt-reset');
  if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Really? Click again'; return; }
  Save.reset(); syncOptions(); refreshTitle(); toast('Progress reset. Fresh start!');
};
$('opt-close').onclick = () => {
  closeModal();
  if (state.optionsReturn === 'pause') openModal('pause');
  state.optionsReturn = null;
};

// =========================== LEVEL FLOW =========================
const TIPS = [
  'Tip: scroll the mouse wheel (or pinch) to zoom in on busy spots.',
  'Tip: click people in the crowd. Some of them have opinions.',
  'Tip: every location hides 3 office cats. Find them all for a star!',
  'Tip: press H for a hint. Use at most one hint to earn a star.',
  'Tip: once you\'ve talked to an owner, their case file can locate them.',
  'Tip: compare hats, shirts and hair with the portrait on each case file.',
  'Tip: items of the wrong colour are decoys. Read the case file carefully!',
];

async function startLevel(idx) {
  closeModal();
  state.inGame = false;
  $('hud').classList.add('hidden');
  $('coach').classList.add('hidden');
  showScreen('loading');
  $('load-bar').style.width = '0%';
  $('load-tip').textContent = pick(TIPS);
  Sound.playAmbience(null);
  await nextFrame(); await nextFrame();
  const level = LEVELS[idx];
  const scene = buildScene(level);
  await renderScene(scene, p => { $('load-bar').style.width = Math.round(p * 100) + '%'; });
  G = {
    idx, level, scene,
    cases: level.cases.map((d, i) => ({ def: d, i, state: 'lost', met: false, el: null, owner: scene.owners.find(o => o.owner === i), item: scene.caseItems.find(o => o.caseIdx === i) })),
    cats: [false, false, false], hintsLeft: 3, hintsUsed: 0, time: 0, running: false, done: false,
    camAnim: null, bubbles: [], parts: [], ripples: [], floaters: [], hint: null, focus: 0, coach: null, amb: [], t: 0,
  };
  const lmStart = level.id === 0 ? scene.landmarks.fountain : null;
  cam.x = lmStart ? lmStart.x : scene.W / 2; cam.y = lmStart ? lmStart.y - 60 : scene.H / 2;
  cam.z = zBounds().zMin * (level.id === 0 ? 1.5 : 1.1);
  clampCam();
  initAmbient();
  buildTray();
  updateHud();
  $('hud-name').textContent = level.name;
  showScreen(null);
  $('hud').classList.remove('hidden');
  state.inGame = true;
  Sound.playMusic(level.music);
  Sound.playAmbience(level.theme);
  // memo
  $('memo-num').textContent = idx + 1;
  $('memo-title').textContent = level.name;
  $('memo-text').textContent = level.memo;
  $('memo-stats').innerHTML = `<span>📁 ${level.cases.length} cases</span><span>🐈 3 hidden cats</span><span>💡 3 hints</span>`;
  openModal('memo');
  Sound.play('paper');
}

function beginShift() {
  closeModal();
  G.running = true;
  if (G.idx === 0 && !Save.data.tutorialDone) coachShow(0);
}

function quitToMenu() {
  state.inGame = false; G = null;
  closeModal();
  $('hud').classList.add('hidden'); $('coach').classList.add('hidden');
  Sound.playAmbience(null); Sound.playMusic('title');
  refreshTitle(); showScreen('title');
}

function levelComplete() {
  const idx = G.idx;
  const cats = G.cats.filter(Boolean).length;
  const stars = 1 + (G.hintsUsed <= 1 ? 1 : 0) + (cats === 3 ? 1 : 0);
  const prev = Save.lv(idx);
  Save.data.levels[idx] = {
    done: true, stars: Math.max(prev.stars, stars),
    bestTime: prev.bestTime ? Math.min(prev.bestTime, G.time) : G.time,
    cats: prev.cats.map((c, k) => c || G.cats[k]),
  };
  Save.data.unlocked = Math.max(Save.data.unlocked, idx + 2);
  Save.write();
  Sound.playMusic(null);
  Sound.play('complete');
  $('complete-title').textContent = G.level.name;
  $('complete-stats').innerHTML = `<span>Time</span><b>${fmtTime(G.time)}</b><span>Items returned</span><b>${G.cases.length}/${G.cases.length}</b><span>Hints used</span><b>${G.hintsUsed}</b><span>Office cats found</span><b>${cats}/3</b>`;
  $('complete-next').textContent = idx === LEVELS.length - 1 ? 'Finish' : 'Next Shift';
  const starEls = $('complete-stars').querySelectorAll('span');
  starEls.forEach(s => s.classList.remove('on'));
  openModal('complete');
  for (let k = 0; k < stars; k++) setTimeout(() => { starEls[k].classList.add('on'); Sound.play('star', k); }, 900 + k * 450);
  setTimeout(() => { if (G && state.modal === 'complete') Sound.playMusic('title'); }, 4200);
}

function showEnding() {
  state.inGame = false; G = null;
  closeModal();
  $('hud').classList.add('hidden'); $('coach').classList.add('hidden');
  Sound.playAmbience(null); Sound.playMusic('ending');
  let stars = 0, cats = 0, time = 0;
  LEVELS.forEach((l, i) => { const s = Save.lv(i); stars += s.stars; cats += s.cats.filter(Boolean).length; time += s.bestTime || 0; });
  $('ending-text').textContent = ENDING_TEXT;
  $('ending-stats').innerHTML = `<span>Stars earned</span><b>★ ${stars}/${LEVELS.length * 3}</b><span>Office cats rescued</span><b>${cats}/${LEVELS.length * 3}</b><span>Total best time</span><b>${fmtTime(time)}</b>`;
  showScreen('ending');
}

// =========================== HUD / TRAY =========================
function updateHud() {
  $('hud-time').textContent = fmtTime(G.time);
  $('hud-cat-count').textContent = G.cats.filter(Boolean).length + '/3';
  $('hint-count').textContent = G.hintsLeft;
  $('btn-hint').disabled = G.hintsLeft <= 0;
}
function buildTray() {
  const tray = $('tray'); tray.innerHTML = '';
  G.cases.forEach((cs, i) => {
    const el = document.createElement('div');
    el.className = 'case';
    el.title = cs.def.name + ': lost ' + itemLabel(cs.def);
    el.innerHTML = `<canvas class="pc" width="104" height="120"></canvas><span class="arrow">➜</span><canvas class="ic" width="104" height="104"></canvas><div class="nm">${cs.def.name}</div>`;
    drawPortrait(el.querySelector('.pc'), cs.def.look);
    drawItemIcon(el.querySelector('.ic'), cs.def.item, cs.def.col);
    el.onclick = () => openCase(i);
    cs.el = el;
    tray.appendChild(el);
  });
}
function updateCaseEl(cs) {
  cs.el.classList.toggle('held', cs.state === 'held');
  cs.el.classList.toggle('done', cs.state === 'done');
}
function flashCase(cs) {
  cs.el.classList.remove('flash'); void cs.el.offsetWidth; cs.el.classList.add('flash');
  cs.el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function openCase(i) {
  if (!G) return;
  const cs = G.cases[i], d = cs.def;
  G.focus = i;
  Sound.play('paper');
  drawPortrait($('card-portrait'), d.look);
  $('card-name').textContent = d.name;
  $('card-item-name').textContent = itemLabel(d);
  drawItemIcon($('card-item'), d.item, d.col);
  $('card-clue').textContent = d.clue;
  const st = $('card-status');
  if (cs.state === 'lost') st.innerHTML = `Status: <b>still missing.</b>${cs.met ? ` You've already met ${d.name}.` : ''}`;
  else if (cs.state === 'held') st.innerHTML = `<b>It's in your bag!</b> Now find ${d.name} (match the portrait) and click them to hand it back.`;
  else st.innerHTML = `Returned! ${d.name} says: “${d.thanks}”`;
  $('card-locate').style.display = cs.met && cs.state !== 'done' ? '' : 'none';
  $('casecard').classList.toggle('done', cs.state === 'done');
  openModal('casecard');
  coachEvent('card');
}
$('card-close').onclick = $('card-ok').onclick = () => { Sound.play('back'); closeModal(); };
$('card-locate').onclick = () => {
  const cs = G.cases[G.focus]; closeModal();
  if (cs.owner) { panTo(cs.owner.x, cs.owner.y - 30, Math.max(cam.z, 1.4)); G.ripples.push({ x: cs.owner.x, y: cs.owner.y - 25, t: 0, big: true }); }
};

// =========================== CAMERA =============================
function zBounds() {
  const zMin = Math.max(VW / G.scene.W, VH / G.scene.H);
  return { zMin, zMax: Math.max(zMin * 1.5, 2.6) };
}
function clampCam() {
  if (!G) return;
  const { zMin, zMax } = zBounds();
  cam.z = clamp(cam.z, zMin, zMax);
  const vw = VW / cam.z, vh = VH / cam.z;
  const padT = 70 / cam.z, padB = 125 / cam.z;
  cam.x = clamp(cam.x, vw / 2, G.scene.W - vw / 2);
  cam.y = clamp(cam.y, vh / 2 - padT, G.scene.H - vh / 2 + padB);
}
const s2w = (sx, sy) => ({ x: cam.x + (sx - VW / 2) / cam.z, y: cam.y + (sy - VH / 2) / cam.z });
const w2s = (wx, wy) => ({ x: (wx - cam.x) * cam.z + VW / 2, y: (wy - cam.y) * cam.z + VH / 2 });
function zoomAt(sx, sy, f) {
  const w = s2w(sx, sy);
  cam.z *= f; const { zMin, zMax } = zBounds(); cam.z = clamp(cam.z, zMin, zMax);
  cam.x = w.x - (sx - VW / 2) / cam.z; cam.y = w.y - (sy - VH / 2) / cam.z;
  clampCam();
  G.camAnim = null;
}
function panTo(x, y, z) {
  G.camAnim = { fx: cam.x, fy: cam.y, fz: cam.z, tx: x, ty: y, tz: z || cam.z, t: 0, dur: 0.9 };
}

// =========================== INPUT ==============================
const ptrs = new Map();
let drag = null, pinch = null;
const mouse = { x: -9999, y: -9999, has: false };
const inPlay = () => G && state.inGame && !state.modal;

cv.addEventListener('pointerdown', (e) => {
  if (!inPlay()) return;
  try { cv.setPointerCapture(e.pointerId); } catch (er) { }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false };
  else if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: cam.z };
    if (drag) drag.moved = true;
  }
});
cv.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' || ptrs.has(e.pointerId)) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; }
  if (!ptrs.has(e.pointerId) || !G) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const target = pinch.z * d / pinch.d;
    zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, target / cam.z);
  } else if (drag) {
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; cv.classList.add('dragging'); G.camAnim = null; }
    if (drag.moved) {
      cam.x = drag.cx - dx / cam.z; cam.y = drag.cy - dy / cam.z; clampCam();
      if (Math.hypot(dx, dy) > 140) coachEvent('drag');
    }
  }
});
function endPointer(e) {
  if (!ptrs.has(e.pointerId)) return;
  const wasDrag = drag;
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (ptrs.size === 0) {
    cv.classList.remove('dragging');
    if (wasDrag && !wasDrag.moved && e.type === 'pointerup') worldClick(e.clientX, e.clientY);
    drag = null;
  } else if (ptrs.size === 1) {
    const p = [...ptrs.values()][0];
    drag = { sx: p.x, sy: p.y, cx: cam.x, cy: cam.y, moved: true };
  }
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', endPointer);
cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') mouse.has = false; });
cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (!inPlay()) return;
  let dy = e.deltaY; if (e.deltaMode === 1) dy *= 30;
  zoomAt(e.clientX, e.clientY, Math.exp(-clamp(dy, -120, 120) * 0.0018));
}, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());

const keys = new Set();
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'escape') {
    if (state.modal === 'casecard') { closeModal(); return; }
    if (state.modal === 'options') { $('opt-close').click(); return; }
    if (state.modal === 'pause') { closeModal(); Sound.play('back'); return; }
    if (inPlay()) { openPause(); return; }
    if (['levels', 'credits'].includes(state.screen) && !state.modal) { showScreen('title'); Sound.play('back'); }
    return;
  }
  if (state.screen === 'splash') { startFromSplash(); return; }
  if (!inPlay()) return;
  keys.add(k);
  if (k === 'h') useHint();
  if (k === '+' || k === '=') zoomAt(VW / 2, VH / 2, 1.25);
  if (k === '-' || k === '_') zoomAt(VW / 2, VH / 2, 0.8);
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden && inPlay() && G.running) openPause(); });

// =========================== WORLD INTERACTION ==================
const QUIPS = {
  all: ['Lovely day, isn\'t it?', 'Oh! You startled me.', 'Finders & Co.? My hero!', 'I\'m just people-watching.', 'Is it lunchtime yet?', 'I lost my marbles once. Never found them.', 'Nice magnifying glass!', 'Hello there!', 'I think I left the oven on...', 'You look like you\'re on a mission.', 'Have we met before?', 'Hmm? No, I\'ve lost nothing. Except my train of thought.'],
  park: ['The ducks here are VERY bold.', 'I love the bandstand music!', 'Beautiful fountain, isn\'t it?', 'I\'m training for a marathon. Starting tomorrow.', 'Mind the pigeons.'],
  market: ['Three apples for a pound!', 'The bakery smells amazing.', 'Has anyone seen the pigeon king?', 'I only came for milk.', 'Is the clock tower ever right?'],
  beach: ['Sand. Everywhere. Always.', 'Watch out for the crabs!', 'Did you put on sunscreen?', 'I saw a dolphin! Probably.', 'Ice cream for breakfast? Why not.'],
  winter: ['Brrr!', 'Hot cocoa is the best.', 'My nose is frozen solid.', 'Have you tried the sled hill?', 'I can\'t feel my toes. Is that normal?'],
  carnival: ['Wheee!', 'I won a goldfish!', 'The Ferris wheel is SO high!', 'Candy floss for dinner!', 'Madame Zora says I\'ll meet a tall stranger. Is it you?'],
};
const NOT_MINE = ['That\'s not mine, sorry!', 'Nope, never seen it before.', 'Not mine! Try someone else.', 'Ooh, shiny. But not mine.', 'Wrong person, I\'m afraid!'];

function say(o, text, voice) {
  const wy = o.type === 'person' ? o.y - 54 * o.s : o.y - 20;
  G.bubbles = G.bubbles.filter(b => b.o !== o);
  G.bubbles.push({ o, wx: o.x, wy, text, t: 0, dur: 2.2 + text.length * 0.035 });
  if (G.bubbles.length > 3) G.bubbles.shift();
  if (voice !== false) Sound.play('talk', voice || (o.s < 0.85 ? 560 : 170 + (o.seed % 260)));
}

function worldClick(sx, sy) {
  if (!inPlay() || !G.running) return;
  const w = s2w(sx, sy);
  const o = pickAt(G.scene, w.x, w.y, 13 / cam.z);
  G.ripples.push({ x: w.x, y: w.y, t: 0 });
  if (!o) return;
  if (o.type === 'item' && o.caseIdx !== undefined) return pickup(o);
  if (o.type === 'item') {
    Sound.play('decoy');
    const name = ITEM_NAMES[o.it];
    const lines = [`Hmm, a ${o.col} ${name}... not quite what we're after.`, `This ${name} is ${o.col}. Nobody's reported that one.`, `A ${o.col} ${name}! Close, but no.`];
    say(o, pick(lines), false);
    return;
  }
  if (o.type === 'cat') return catClick(o);
  if (o.type === 'person') return personClick(o);
}

function pickup(o) {
  const cs = G.cases[o.caseIdx];
  o.gone = true;
  const b = o.bb;
  repaintRegion(G.scene, { x0: b.x0 - 4, y0: b.y0 - 4, x1: b.x1 + 4, y1: b.y1 + 4 });
  cs.state = 'held';
  Sound.play('pickup');
  burst(o.x, o.y - 8, 'spark', 16);
  flyToCard(o, cs);
  toast(`Found the ${itemLabel(cs.def)}! Now find ${cs.def.name}.`);
  coachEvent('pickup');
}

function flyToCard(o, cs) {
  const p = w2s(o.x, o.y - 8);
  const fc = document.createElement('canvas'); fc.width = 128; fc.height = 128; fc.className = 'flyer';
  drawItemIcon(fc, cs.def.item, cs.def.col, 4.4);
  fc.style.left = (p.x - 32) + 'px'; fc.style.top = (p.y - 32) + 'px';
  document.body.appendChild(fc);
  cs.el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const r = cs.el.getBoundingClientRect();
    fc.style.transform = `translate(${r.left + r.width / 2 - p.x}px, ${r.top + r.height / 2 - p.y}px) scale(0.6) rotate(360deg)`;
    fc.style.opacity = '0.3';
  }));
  setTimeout(() => { fc.remove(); updateCaseEl(cs); flashCase(cs); Sound.play('pop'); }, 720);
}

function personClick(o) {
  if (o.owner !== undefined) {
    const cs = G.cases[o.owner], d = cs.def;
    if (cs.state === 'held') return returnItem(cs, o);
    if (cs.state === 'done') { say(o, pick(['Thanks again!', 'You\'re a star!', d.thanks]), d.voice); return; }
    const first = !cs.met;
    cs.met = true;
    const lines = [`Oh! Are you from Finders & Co.? I've lost my ${itemLabel(d)}!`, `Have you seen my ${itemLabel(d)}? I had it near the ${d.near}...`, `Any luck finding my ${itemLabel(d)}?`];
    say(o, first ? lines[0] : pick(lines.slice(1)), d.voice);
    flashCase(cs);
    return;
  }
  const held = G.cases.some(c => c.state === 'held');
  say(o, held ? pick(NOT_MINE) : pick(QUIPS.all.concat(QUIPS[G.level.theme], QUIPS[G.level.theme])));
}

function returnItem(cs, o) {
  cs.state = 'done';
  updateCaseEl(cs);
  Sound.play('returned');
  burst(o.x, o.y - 44 * o.s, 'confetti', 40);
  burst(o.x, o.y - 50 * o.s, 'heart', 6);
  say(o, cs.def.thanks, cs.def.voice);
  G.floaters.push({ x: o.x, y: o.y - 70 * o.s, text: 'Case closed!', t: 0, col: '#4f9a5a' });
  coachEvent('return');
  if (G.cases.every(c => c.state === 'done')) {
    G.done = true;
    setTimeout(() => { if (G && G.done && state.inGame) { $('coach').classList.add('hidden'); levelComplete(); } }, 2400);
  } else toast(`Case closed: ${cs.def.name}! ${G.cases.filter(c => c.state !== 'done').length} to go.`);
}

function catClick(o) {
  if (!G.cats[o.catIdx]) {
    G.cats[o.catIdx] = true;
    Sound.play('meow');
    burst(o.x, o.y - 14, 'heart', 8);
    G.floaters.push({ x: o.x, y: o.y - 30, text: '+1 office cat!', t: 0, col: '#e0703a' });
    const n = G.cats.filter(Boolean).length;
    toast(n === 3 ? 'All 3 office cats found! ★' : `Office cat found! (${n}/3)`);
    const pill = $('hud-cats'); pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump');
    updateHud();
  } else { Sound.play('meow'); say(o, pick(['Mrrrow.', 'Purrrr...', 'Mew?', '*slow blink*']), false); }
}

function useHint() {
  if (!inPlay() || !G.running || G.done) return;
  if (G.hintsLeft <= 0) { Sound.play('wrong'); toast('No hints left for this location.'); return; }
  let cs = G.cases[G.focus];
  if (!cs || cs.state === 'done') cs = G.cases.find(c => c.state === 'held') || G.cases.find(c => c.state === 'lost');
  if (!cs) return;
  const target = cs.state === 'held' ? cs.owner : cs.item;
  if (!target) return;
  G.hintsLeft--; G.hintsUsed++;
  updateHud();
  Sound.play('hint');
  const a = Math.random() * TAU, d = Math.random() * 45;
  const hx = target.x + Math.cos(a) * d, hy = target.y - (target.type === 'person' ? 25 : 8) + Math.sin(a) * d;
  G.hint = { x: hx, y: hy, t: 0, dur: 8 };
  panTo(hx, hy, Math.max(cam.z, 1.2));
  toast(cs.state === 'held' ? `${cs.def.name} is somewhere in the circle!` : `The ${itemLabel(cs.def)} is somewhere in the circle!`, 3400);
}

// =========================== TUTORIAL ===========================
const COACH = [
  { text: 'Welcome to your first shift! Drag to look around the park. Scroll or pinch to zoom.', btn: 'Got it', wait: 'drag' },
  { text: 'These are your case files. Click one to see who lost what.', wait: 'card', tray: true },
  { text: 'Read the clue, then search the park for that exact item. Click it to pick it up!', wait: 'pickup' },
  { text: 'Now find the owner. Match them to the portrait on the case file, then click them to hand it back.', wait: 'return' },
  { text: 'Case closed! Solve the rest the same way. Stuck? The lightbulb gives a hint. Psst... 3 office cats hide in every location.', btn: 'Let\'s go!' },
];
const COACH_EV = { drag: 0, card: 1, pickup: 2, return: 3 };
function coachShow(i) {
  if (!G) return;
  G.coach = i;
  $('tray').classList.remove('pulse');
  if (i >= COACH.length) {
    $('coach').classList.add('hidden'); G.coach = null;
    Save.data.tutorialDone = true; Save.write(); return;
  }
  const s = COACH[i];
  if (i === COACH.length - 1) { Save.data.tutorialDone = true; Save.write(); }
  $('coach-text').textContent = s.text;
  $('coach-btn').style.display = s.btn ? '' : 'none';
  $('coach-btn').textContent = s.btn || '';
  $('coach').classList.remove('hidden');
  if (s.tray) $('tray').classList.add('pulse');
  Sound.play('pop');
}
function coachEvent(ev) {
  if (!G || G.coach === null || G.coach === undefined) return;
  const k = COACH_EV[ev];
  if (k !== undefined && G.coach <= k) coachShow(k + 1);
}
$('coach-btn').onclick = () => { Sound.play('click'); coachShow(G.coach + 1); };

// =========================== PARTICLES ==========================
const CONF = ['#d9483b', '#f1c83b', '#4a78c9', '#4f9a5a', '#ec8fb5', '#8e62b8', '#ee8a3a'];
function burst(x, y, kind, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = kind === 'heart' ? 30 + Math.random() * 30 : 60 + Math.random() * 140;
    G.parts.push({
      kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === 'confetti' ? 120 : kind === 'heart' ? 50 : 30),
      life: 0, max: kind === 'confetti' ? 1.6 : kind === 'heart' ? 1.4 : 0.7, col: pick(CONF), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, size: 2 + Math.random() * 2.5,
    });
  }
}
function heartPath(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * 0.35);
  c.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.5, y - s * 1.1, x, y - s * 0.5);
  c.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s, y - s * 0.4, x, y + s * 0.35);
}

function initAmbient() {
  G.amb = [];
  const kind = G.level.particles;
  const n = kind === 'snow' ? 130 : kind === 'fireflies' ? 45 : kind === 'sparkle' ? 26 : 30;
  for (let i = 0; i < n; i++) G.amb.push(newAmb(kind, true));
}
function newAmb(kind, anywhere) {
  const p = { kind, x: Math.random() * VW, y: anywhere ? Math.random() * VH : -20, ph: Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 2, life: 0 };
  if (kind === 'snow') { p.vy = 25 + Math.random() * 45; p.vx = -10 + Math.random() * 20; p.size = 1.2 + Math.random() * 2.6; }
  else if (kind === 'leaves' || kind === 'petals') {
    p.vy = 18 + Math.random() * 25; p.vx = 10 + Math.random() * 25; p.size = 3 + Math.random() * 3;
    p.col = kind === 'leaves' ? pick(['#e8a23a', '#d9683b', '#9cc05a', '#f1c83b']) : pick(['#ffc6dc', '#fbfbf7', '#ffb0c8']);
  } else if (kind === 'fireflies') { p.vx = 0; p.vy = 0; p.size = 1.5 + Math.random() * 1.5; }
  else { p.vx = 0; p.vy = 0; p.life = Math.random() * 3; p.size = 2 + Math.random() * 3; }
  return p;
}
function updateAmbient(dt) {
  for (let i = 0; i < G.amb.length; i++) {
    const p = G.amb[i];
    p.ph += dt; p.rot += p.vr * dt; p.life += dt;
    if (p.kind === 'fireflies') { p.x += Math.cos(p.ph * 0.7 + i) * 20 * dt; p.y += Math.sin(p.ph * 0.9 + i * 2) * 16 * dt; }
    else if (p.kind === 'sparkle') { if (p.life > 3) { G.amb[i] = newAmb('sparkle', true); } continue; }
    else { p.x += (p.vx + Math.sin(p.ph * 1.3) * 18) * dt; p.y += p.vy * dt; }
    if (p.y > VH + 20 || p.x > VW + 30 || p.x < -30) { G.amb[i] = newAmb(p.kind, false); G.amb[i].x = Math.random() * (VW + 200) - 200; }
  }
}
function drawAmbient() {
  for (const p of G.amb) {
    if (p.kind === 'snow') { ctx.globalAlpha = 0.9; D.dot(ctx, p.x, p.y, p.size, '#ffffff'); }
    else if (p.kind === 'leaves' || p.kind === 'petals') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, TAU); ctx.fillStyle = p.col; ctx.fill();
      if (p.kind === 'leaves') { ctx.strokeStyle = 'rgba(46,37,53,0.5)'; ctx.lineWidth = 0.8; ctx.stroke(); }
      ctx.restore();
    } else if (p.kind === 'fireflies') {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(p.ph * 2 + p.x));
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
      g.addColorStop(0, `rgba(255,240,140,${a})`); g.addColorStop(1, 'rgba(255,240,140,0)');
      ctx.fillStyle = g; ctx.fillRect(p.x - p.size * 6, p.y - p.size * 6, p.size * 12, p.size * 12);
      ctx.globalCompositeOperation = 'source-over';
    } else if (p.kind === 'sparkle') {
      const a = Math.sin((p.life / 3) * Math.PI);
      ctx.globalAlpha = a * 0.9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x - p.size * 2, p.y); ctx.lineTo(p.x + p.size * 2, p.y); ctx.moveTo(p.x, p.y - p.size * 2); ctx.lineTo(p.x, p.y + p.size * 2); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// =========================== NIGHT ==============================
let darkCv = null, darkCtx = null;
function drawNight(t) {
  const hw = Math.ceil(VW / 2), hh = Math.ceil(VH / 2);
  if (!darkCv || darkCv.width !== hw || darkCv.height !== hh) { darkCv = document.createElement('canvas'); darkCv.width = hw; darkCv.height = hh; darkCtx = darkCv.getContext('2d'); }
  const d = darkCtx;
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, hw, hh);
  d.fillStyle = 'rgba(14,10,44,0.8)'; d.fillRect(0, 0, hw, hh);
  d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, rad, str) => {
    if (x + rad < 0 || y + rad < 0 || x - rad > hw || y - rad > hh) return;
    const g = d.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(0,0,0,${str})`); g.addColorStop(0.55, `rgba(0,0,0,${str * 0.7})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g; d.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };
  const z = cam.z;
  for (const l of G.scene.lights) {
    const p = w2s(l.x, l.y);
    const fl = 1 + Math.sin(t * 7 + l.x) * 0.04;
    hole(p.x / 2, p.y / 2, (l.big ? 55 : 95) * z * fl / 2 * 1.4, l.big ? 0.55 : 0.8);
  }
  const lx = mouse.has ? mouse.x : VW / 2, ly = mouse.has ? mouse.y : VH / 2;
  hole(lx / 2, ly / 2, 105, 1);
  if (G.hint) { const p = w2s(G.hint.x, G.hint.y); hole(p.x / 2, p.y / 2, 110 * z / 2 * 1.6, 0.9); }
  ctx.drawImage(darkCv, 0, 0, VW, VH);
  ctx.globalCompositeOperation = 'lighter';
  for (const l of G.scene.lights) {
    const p = w2s(l.x, l.y); const rad = (l.big ? 14 : 30) * z;
    if (p.x < -rad || p.y < -rad || p.x > VW + rad || p.y > VH + rad) continue;
    const a = 0.35 + Math.sin(t * 5 + l.y) * 0.08;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
    g.addColorStop(0, `rgba(255,210,130,${a})`); g.addColorStop(1, 'rgba(255,210,130,0)');
    ctx.fillStyle = g; ctx.fillRect(p.x - rad, p.y - rad, rad * 2, rad * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  // lantern ring
  ctx.strokeStyle = 'rgba(255,230,160,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(lx, ly, 150, 0, TAU); ctx.stroke();
}

// =========================== RENDER GAME ========================
function drawBubble(b) {
  const p = w2s(b.wx, b.wy);
  const a = Math.min(1, b.t / 0.12) * Math.min(1, (b.dur - b.t) / 0.35);
  if (a <= 0) return;
  ctx.font = '19px ' + FONT;
  const words = b.text.split(' '), lines = []; let line = '';
  for (const w of words) { const tl = line ? line + ' ' + w : w; if (ctx.measureText(tl).width > 230 && line) { lines.push(line); line = w; } else line = tl; }
  lines.push(line);
  const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 26, bh = lines.length * 22 + 14;
  let bx = clamp(p.x - bw / 2, 8, VW - bw - 8);
  let by = p.y - bh - 16, below = false;
  if (by < 70) { by = p.y + 70 * cam.z * 0.8; below = true; }
  const sc = 0.85 + 0.15 * Math.min(1, b.t / 0.12);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(p.x, p.y); ctx.scale(sc, sc); ctx.translate(-p.x, -p.y);
  ctx.fillStyle = '#fffdf6'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 12); else ctx.rect(bx, by, bw, bh);
  ctx.fill(); ctx.stroke();
  const tx = clamp(p.x, bx + 16, bx + bw - 16);
  ctx.beginPath();
  if (!below) { ctx.moveTo(tx - 8, by + bh - 1.5); ctx.lineTo(p.x, p.y - 4); ctx.lineTo(tx + 8, by + bh - 1.5); }
  else { ctx.moveTo(tx - 8, by + 1.5); ctx.lineTo(p.x, p.y + 4); ctx.lineTo(tx + 8, by + 1.5); }
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 18 + i * 22));
  ctx.restore();
}

function renderGame(dt, t) {
  const sc = G.scene, z = cam.z;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#2e2535'; ctx.fillRect(0, 0, VW, VH);
  ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (VW / 2 - cam.x * z), DPR * (VH / 2 - cam.y * z));
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sc.canvas, 0, 0, sc.W, sc.H);
  ctx.strokeStyle = INK; ctx.lineWidth = 4 / z; ctx.strokeRect(0, 0, sc.W, sc.H);

  // returned owners: check badge
  for (const cs of G.cases) {
    if (cs.state !== 'done' || !cs.owner) continue;
    const o = cs.owner, bx = o.x, by = o.y - (o.look.hat === 'tophat' || o.look.hat === 'chef' ? 72 : 62) * o.s + Math.sin(t * 3 + o.x) * 2;
    ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fillStyle = '#4f9a5a'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 3.5, by); ctx.lineTo(bx - 1, by + 3); ctx.lineTo(bx + 4, by - 3); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }
  // found cats: tiny heart
  for (const c of sc.cats) if (G.cats[c.catIdx]) {
    heartPath(ctx, c.x, c.y - 24 + Math.sin(t * 3 + c.x) * 1.5, 4.5); ctx.fillStyle = '#ec5a7a'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke();
  }
  // hint
  if (G.hint) {
    const h = G.hint; h.t += dt;
    const k = Math.min(1, h.t / 0.8);
    const rad = lerp(320, 110, ease(k)) + Math.sin(h.t * 4) * 5;
    const a = h.t > h.dur - 1 ? Math.max(0, h.dur - h.t) : 1;
    ctx.save(); ctx.globalAlpha = a;
    ctx.setLineDash([14 / z * 0.8, 10 / z * 0.8]); ctx.lineDashOffset = -h.t * 30;
    ctx.beginPath(); ctx.arc(h.x, h.y, rad, 0, TAU);
    ctx.lineWidth = 6 / Math.sqrt(z); ctx.strokeStyle = 'rgba(46,37,53,0.8)'; ctx.stroke();
    ctx.lineWidth = 3.5 / Math.sqrt(z); ctx.strokeStyle = '#f7d13b'; ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(247,209,59,0.08)'; ctx.fill();
    ctx.restore();
    if (h.t > h.dur) G.hint = null;
  }
  // ripples
  for (const r of G.ripples) {
    const k = r.t / (r.big ? 1.2 : 0.45);
    ctx.beginPath(); ctx.arc(r.x, r.y, ((r.big ? 20 : 4) + k * (r.big ? 60 : 22)) / (r.big ? 1 : z), 0, TAU);
    ctx.strokeStyle = r.big ? `rgba(58,163,160,${1 - k})` : `rgba(46,37,53,${0.6 * (1 - k)})`; ctx.lineWidth = (r.big ? 4 : 2) / z; ctx.stroke();
  }
  // particles
  for (const p of G.parts) {
    const a = 1 - p.life / p.max;
    ctx.globalAlpha = Math.min(1, a * 1.5);
    if (p.kind === 'confetti') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size); ctx.restore();
    } else if (p.kind === 'heart') {
      heartPath(ctx, p.x, p.y, 5 + p.size); ctx.fillStyle = '#ec5a7a'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke();
    } else {
      ctx.strokeStyle = '#f7d13b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x - p.size * 1.5, p.y); ctx.lineTo(p.x + p.size * 1.5, p.y); ctx.moveTo(p.x, p.y - p.size * 1.5); ctx.lineTo(p.x, p.y + p.size * 1.5); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // ---- screen space ----
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (G.level.night) drawNight(t);
  drawAmbient();
  for (const b of G.bubbles) drawBubble(b);
  for (const f of G.floaters) {
    const p = w2s(f.x, f.y); const a = 1 - f.t / 1.6;
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = 'bold 24px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = '#fffdf6'; ctx.strokeText(f.text, p.x, p.y - f.t * 40);
    ctx.fillStyle = f.col; ctx.fillText(f.text, p.x, p.y - f.t * 40);
  }
  ctx.globalAlpha = 1;
  if (Save.data.vignette) drawVignette(G.level.night ? 0.5 : 0.3);
}

let hudTimer = 0;
function updateGame(dt) {
  G.t += dt;
  if (G.running && !state.modal && !G.done) {
    G.time += dt; hudTimer += dt;
    if (hudTimer > 0.25) { hudTimer = 0; $('hud-time').textContent = fmtTime(G.time); }
  }
  if (!state.modal) {
    let kx = 0, ky = 0;
    if (keys.has('arrowleft') || keys.has('a')) kx -= 1;
    if (keys.has('arrowright') || keys.has('d')) kx += 1;
    if (keys.has('arrowup') || keys.has('w')) ky -= 1;
    if (keys.has('arrowdown') || keys.has('s')) ky += 1;
    if (kx || ky) { cam.x += kx * 750 * dt / cam.z; cam.y += ky * 750 * dt / cam.z; G.camAnim = null; clampCam(); coachEvent('drag'); }
  }
  if (G.camAnim) {
    const a = G.camAnim; a.t += dt; const k = ease(Math.min(1, a.t / a.dur));
    cam.x = lerp(a.fx, a.tx, k); cam.y = lerp(a.fy, a.ty, k); cam.z = lerp(a.fz, a.tz, k);
    clampCam();
    if (a.t >= a.dur) G.camAnim = null;
  }
  G.bubbles.forEach(b => b.t += dt); G.bubbles = G.bubbles.filter(b => b.t < b.dur);
  G.ripples.forEach(r => r.t += dt); G.ripples = G.ripples.filter(r => r.t < (r.big ? 1.2 : 0.45));
  G.floaters.forEach(f => f.t += dt); G.floaters = G.floaters.filter(f => f.t < 1.6);
  for (const p of G.parts) {
    p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.kind === 'confetti') { p.vy += 260 * dt; p.vx *= 0.98; }
    else if (p.kind === 'heart') { p.vy -= 20 * dt; p.vx *= 0.95; }
    else { p.vx *= 0.9; p.vy *= 0.9; }
  }
  G.parts = G.parts.filter(p => p.life < p.max);
  updateAmbient(dt);
}

// =========================== MAIN LOOP ==========================
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  try {
    if (G && state.inGame) { updateGame(dt); renderGame(dt, now / 1000); }
    else renderTitle(dt, now / 1000);
  } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}

// =========================== WIRING =============================
function openPause() { if (!inPlay()) return; Sound.play('paper'); openModal('pause'); }
function startFromSplash() {
  if (state.screen !== 'splash') return;
  Sound.init(); applyVolumes();
  Sound.playMusic('title');
  Sound.play('whoosh');
  refreshTitle();
  showScreen('title');
}
$('splash').addEventListener('click', startFromSplash);

$('btn-play').onclick = () => {
  const i = nextLevelIdx();
  if (i < 0) { buildLevelGrid(); showScreen('levels'); return; }
  fadeTo(() => startLevel(i));
};
$('btn-levels').onclick = () => { buildLevelGrid(); showScreen('levels'); };
$('btn-options').onclick = () => { syncOptions(); state.optionsReturn = null; openModal('options'); };
$('btn-credits').onclick = () => showScreen('credits');
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { Sound.play('back'); refreshTitle(); showScreen('title'); }));

$('memo-go').onclick = () => { Sound.play('stamp'); beginShift(); };
$('btn-pause').onclick = openPause;
$('btn-hint').onclick = useHint;
$('btn-zoomin').onclick = () => { if (inPlay()) zoomAt(VW / 2, VH / 2, 1.3); };
$('btn-zoomout').onclick = () => { if (inPlay()) zoomAt(VW / 2, VH / 2, 1 / 1.3); };
$('pause-resume').onclick = () => { Sound.play('back'); closeModal(); };
$('pause-options').onclick = () => { syncOptions(); state.optionsReturn = 'pause'; openModal('options'); };
$('pause-restart').onclick = () => { const i = G.idx; fadeTo(() => startLevel(i)); };
$('pause-quit').onclick = () => fadeTo(quitToMenu);
$('complete-menu').onclick = () => fadeTo(quitToMenu);
$('complete-replay').onclick = () => { const i = G.idx; fadeTo(() => startLevel(i)); };
$('complete-next').onclick = () => {
  const i = G.idx;
  if (i >= LEVELS.length - 1) fadeTo(showEnding);
  else fadeTo(() => startLevel(i + 1));
};
$('ending-menu').onclick = () => fadeTo(() => { Sound.playMusic('title'); refreshTitle(); showScreen('title'); });

// generic UI sounds
let lastHover = null;
document.addEventListener('mouseover', (e) => {
  const b = e.target.closest && e.target.closest('.btn, .icon-btn, .case, .lvl');
  if (b && b !== lastHover) Sound.play('hover');
  lastHover = b;
});
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('.btn, .icon-btn');
  if (b && !b.hasAttribute('data-back') && !['card-ok', 'card-close', 'pause-resume', 'memo-go', 'coach-btn'].includes(b.id)) Sound.play('click');
});

resize();
refreshTitle();
requestAnimationFrame(loop);
setTimeout(() => $('fade').classList.remove('on'), 150);
