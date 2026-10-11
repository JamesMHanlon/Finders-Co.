// ---------------------------------------------------------------
//  Scene art — every painter draws with its FOOT at (0,0), up = -y
// ---------------------------------------------------------------
'use strict';

const PAL = {
  skin: ['#f8dcc4', '#efc3a0', '#dca27a', '#bf8157', '#96603d', '#6a4229'],
  hair: ['#2b2224', '#5a3a22', '#8b5a2b', '#c98b3a', '#ead27f', '#b33a2a', '#dcd8d0', '#6b6f78'],
  shirt: ['#e05a4f', '#f0a04b', '#f4d35e', '#8cc56a', '#4fa3a5', '#5b7fd6', '#9b6fc6', '#e58fb4', '#f2efe6', '#4a4f5c', '#a0663e', '#3f8f5a', '#7fc3e8', '#c4d86a'],
  pants: ['#3d4a6b', '#5a4632', '#2f3036', '#7c8a9e', '#a3825a', '#6b3f4f', '#36594a', '#4f6fa0'],
  hat: ['#d9483b', '#4a78c9', '#f1c83b', '#4f9a5a', '#8e62b8', '#ee8a3a', '#3a3540', '#f5f2ea', '#ec8fb5', '#3aa3a0', '#8a5a34'],
  leaf: ['#7fb35a', '#6aa24f', '#8cc063', '#5d9448', '#97c46a'],
  flower: ['#f06e6e', '#f7c948', '#f5f0ff', '#c58ce8', '#ff9ec4', '#7ec8f2', '#ffb35c'],
};

const ART = {};
function def(type, w, h, draw, extra) { ART[type] = Object.assign({ w, h, draw }, extra || {}); }

// ============================ PEOPLE ============================
function drawHairBack(c, L, r) {
  const hc = L.hair;
  if (L.hs === 'long') D.poly(c, [[-8, -44], [8, -44], [9, -27], [-9, -27]], hc, r, { smooth: true });
  if (L.hs === 'afro') D.ellipse(c, 0, -41, 11, 10, hc, r);
  if (L.hs === 'ponytail') D.ellipse(c, 7.5, -35, 3, 6, hc, r);
  if (L.hs === 'pigtails') { D.ellipse(c, -9, -36, 3, 4, hc, r); D.ellipse(c, 9, -36, 3, 4, hc, r); }
  if (L.hs === 'bun') D.ellipse(c, 0, -47.5, 3.6, 3.2, hc, r);
}
function drawHairFront(c, L, r) {
  const hc = L.hair;
  switch (L.hs) {
    case 'bald':
      D.ellipse(c, -6.8, -38, 1.6, 2.4, hc, r, { lw: 0.7 }); D.ellipse(c, 6.8, -38, 1.6, 2.4, hc, r, { lw: 0.7 });
      break;
    case 'spiky':
      D.poly(c, [[-7.5, -38], [-8, -44], [-5, -43], [-4, -48], [-1, -44.5], [1, -49], [3, -44.5], [6, -47.5], [6, -43], [8.5, -43], [7.5, -38], [4, -42], [-3, -42]], hc, r);
      break;
    default: // short, long, bun, pigtails, ponytail, afro
      D.poly(c, [[-7.6, -37], [-7.2, -42.5], [-3.5, -46.3], [3.5, -46.3], [7.2, -42.5], [7.6, -37], [5, -41.2], [1, -40.5], [-3, -41.5]], hc, r, { smooth: true });
  }
}
function drawHat(c, L, r) {
  const hc = L.hatc || '#d9483b';
  switch (L.hat) {
    case 'cap':
      D.poly(c, [[-7.4, -42], [-6, -47], [0, -48.8], [6, -47], [7.4, -42]], hc, r, { smooth: true });
      D.poly(c, [[-1, -42.5], [11, -42], [11.5, -40.5], [-1, -41]], shade(hc, -0.2), r, { lw: 0.9 });
      break;
    case 'beanie':
      D.poly(c, [[-7.6, -41], [-6.5, -47], [0, -50], [6.5, -47], [7.6, -41]], hc, r, { smooth: true });
      D.rect(c, -8, -42.6, 16, 3.4, shade(hc, -0.2), r, { lw: 0.9 });
      D.ellipse(c, 0, -50.5, 2.4, 2.2, shade(hc, 0.4), r, { lw: 0.8 });
      break;
    case 'tophat':
      D.ellipse(c, 0, -44, 10, 2.4, hc, r);
      D.rect(c, -6, -58, 12, 14, hc, r);
      D.rect(c, -6, -47.5, 12, 2.4, '#b3303a', null, { lw: 0.7 });
      break;
    case 'bowler':
      D.ellipse(c, 0, -43.6, 9.5, 2.2, hc, r);
      D.poly(c, [[-6.5, -44], [-6, -49], [0, -51.5], [6, -49], [6.5, -44]], hc, r, { smooth: true });
      break;
    case 'sunhat':
      D.ellipse(c, 0, -44, 13.5, 3.4, hc, r);
      D.poly(c, [[-6.5, -44.5], [-5.5, -50], [5.5, -50], [6.5, -44.5]], hc, r, { smooth: true });
      D.rect(c, -6.6, -47, 13.2, 2, '#d9483b', null, { lw: 0.6 });
      break;
    case 'beret':
      D.ellipse(c, 1.5, -46, 9.5, 3.4, hc, r);
      D.dot(c, 1.5, -50, 1.2, INK);
      break;
    case 'chef':
      D.rect(c, -6.5, -48, 13, 5, '#fbfbf7', r);
      D.ellipse(c, -3.5, -52, 4.5, 4.5, '#fbfbf7', r); D.ellipse(c, 3.5, -52, 4.5, 4.5, '#fbfbf7', r); D.ellipse(c, 0, -55, 4.5, 4.5, '#fbfbf7', r);
      break;
    case 'captain':
      D.poly(c, [[-8, -44], [-9, -49], [9, -49], [8, -44]], '#fbfbf7', r);
      D.rect(c, -8, -45, 16, 2.6, '#2f3036', r, { lw: 0.8 });
      D.poly(c, [[-7, -42.5], [7, -42.5], [5, -40.5], [-5, -40.5]], '#2f3036', r, { lw: 0.7 });
      D.dot(c, 0, -46.8, 1.3, '#e0b33a');
      break;
    case 'bandana':
      D.poly(c, [[-8, -40], [-6.8, -46.5], [0, -48.5], [6.8, -46.5], [8, -40], [0, -43]], hc, r, { smooth: true });
      D.ellipse(c, 8.5, -38.5, 2, 1.6, hc, r, { lw: 0.8 });
      D.dot(c, -3, -45, 0.8, '#fff'); D.dot(c, 3, -45.5, 0.8, '#fff');
      break;
    case 'earmuffs':
      D.curve(c, [[-7.5, -39], [0, -50], [7.5, -39]], null, { lw: 1.6 });
      D.ellipse(c, -7.8, -38, 3, 3.2, hc, r); D.ellipse(c, 7.8, -38, 3, 3.2, hc, r);
      break;
    case 'party':
      D.poly(c, [[-5, -44.5], [5, -44.5], [0, -58]], hc, r);
      D.dot(c, 0, -58.5, 1.6, '#f1c83b');
      break;
  }
}

function drawPerson(c, L, r) {
  const skin = L.skin;
  D.shadow(c, 0, 0, 10, 3);
  // legs
  if (L.dress) {
    D.rect(c, -4.8, -10, 3.4, 10, skin, r, { lw: 0.9 });
    D.rect(c, 1.4, -10, 3.4, 10, skin, r, { lw: 0.9 });
  } else {
    D.rect(c, -5.2, -17, 4.8, 17, L.pants, r);
    D.rect(c, 0.4, -17, 4.8, 17, L.pants, r);
  }
  D.ellipse(c, -3.2, -0.6, 3.3, 1.7, '#3a2f35', r, { lw: 0.7 });
  D.ellipse(c, 3.2, -0.6, 3.3, 1.7, '#3a2f35', r, { lw: 0.7 });
  // back arm (waving pose raises right arm)
  const wave = L.pose === 'wave';
  // torso
  if (L.dress) D.poly(c, [[-6.2, -32], [6.2, -32], [10.5, -9], [-10.5, -9]], L.shirt, r);
  else D.poly(c, [[-6.6, -32], [6.6, -32], [7.6, -15.5], [-7.6, -15.5]], L.shirt, r);
  if (L.stripes) {
    for (let i = 0; i < 3; i++) D.line(c, -6.8 - i * 0.3, -27 + i * 4.5, 6.8 + i * 0.3, -27 + i * 4.5, null, { lw: 1.3, stroke: shade(L.shirt, -0.3) });
  }
  // arms
  D.limb(c, -6.2, -30, -9.2, -18, L.shirt, 3.4, r);
  D.dot(c, -9.3, -17.2, 1.9, skin);
  if (wave) { D.limb(c, 6.2, -30, 11.5, -42, L.shirt, 3.4, r); D.dot(c, 11.8, -43, 2, skin); }
  else { D.limb(c, 6.2, -30, 9.2, -18, L.shirt, 3.4, r); D.dot(c, 9.3, -17.2, 1.9, skin); }
  // accessories on body
  if (L.acc && L.acc.includes('bag')) {
    D.line(c, -5, -31, 5, -19, null, { lw: 1.2, stroke: '#6b4428' });
    D.rect(c, 4, -21, 6, 5, L.bagc || '#a0663e', r, { lw: 0.9 });
  }
  // neck + head
  drawHairBack(c, L, r);
  D.ellipse(c, 0, -39, 7.1, 7.3, skin, r);
  drawHairFront(c, L, r);
  // face
  D.dot(c, -2.5, -38.4, 0.85); D.dot(c, 2.5, -38.4, 0.85);
  D.ellipse(c, -4.2, -36, 1.3, 0.8, 'rgba(240,120,120,0.35)', null, { stroke: false });
  D.ellipse(c, 4.2, -36, 1.3, 0.8, 'rgba(240,120,120,0.35)', null, { stroke: false });
  const acc = L.acc || [];
  if (acc.includes('beard')) D.poly(c, [[-6.5, -37], [-5, -31], [0, -29], [5, -31], [6.5, -37], [3, -34], [-3, -34]], L.beardc || L.hair, r, { smooth: true, lw: 0.9 });
  if (acc.includes('mustache')) {
    D.poly(c, [[-4, -34.3], [-1, -35.6], [0, -35], [1, -35.6], [4, -34.3], [1, -34], [-1, -34]], L.beardc || L.hair, r, { lw: 0.7, smooth: true });
  } else if (!acc.includes('beard')) {
    c.beginPath(); c.arc(0, -35.8, 1.8, 0.3, Math.PI - 0.3); c.strokeStyle = INK; c.lineWidth = 0.8; c.stroke();
  }
  if (acc.includes('glasses')) {
    D.ellipse(c, -2.6, -38.4, 2.2, 2, null, null, { lw: 0.9 });
    D.ellipse(c, 2.6, -38.4, 2.2, 2, null, null, { lw: 0.9 });
  }
  if (acc.includes('shades')) {
    D.rect(c, -5, -39.8, 4.4, 2.8, '#2b2b36', null, { lw: 0.6 });
    D.rect(c, 0.6, -39.8, 4.4, 2.8, '#2b2b36', null, { lw: 0.6 });
    D.line(c, -0.6, -39, 0.6, -39, null, { lw: 0.7 });
  }
  if (acc.includes('scarf')) {
    D.rect(c, -6.8, -33.5, 13.6, 3.6, L.scarfc || '#d9483b', r, { lw: 0.9 });
    D.rect(c, 2.5, -31, 3.2, 7.5, L.scarfc || '#d9483b', r, { lw: 0.9 });
  }
  if (acc.includes('nose')) D.dot(c, 0, -36.8, 1.7, '#e0483b');
  drawHat(c, L, r);
  if (acc.includes('balloon')) {
    const hx = wave ? -9.3 : 9.3;
    D.line(c, hx, -17.5, hx + 2, -60, r, { lw: 0.6 });
    D.ellipse(c, hx + 2, -66, 5, 6, L.balc || '#d9483b', r);
  }
}

def('person', 22, 50, (c, o, r) => drawPerson(c, o.look, r));

// people looks
function randomLook(r, theme) {
  const L = {
    skin: r.pick(PAL.skin), hair: r.pick(PAL.hair),
    hs: r.pick(['short', 'short', 'long', 'bun', 'bald', 'spiky', 'ponytail', 'afro', 'pigtails', 'long']),
    hat: 'none', hatc: r.pick(PAL.hat), shirt: r.pick(PAL.shirt), pants: r.pick(PAL.pants),
    dress: r.chance(0.2), acc: [], stripes: r.chance(0.15), pose: r.chance(0.08) ? 'wave' : 'idle',
  };
  const hats = {
    park: ['none', 'none', 'none', 'cap', 'sunhat', 'beret', 'bowler', 'beanie'],
    market: ['none', 'none', 'cap', 'beret', 'bowler', 'beanie', 'tophat', 'sunhat'],
    beach: ['none', 'none', 'sunhat', 'sunhat', 'cap', 'cap', 'bandana'],
    winter: ['beanie', 'beanie', 'beanie', 'earmuffs', 'none', 'bowler', 'beret'],
    carnival: ['none', 'none', 'cap', 'party', 'beret', 'bowler', 'beanie', 'tophat'],
  }[theme] || ['none'];
  L.hat = r.pick(hats);
  if (r.chance(0.18)) L.acc.push('glasses');
  if (theme === 'beach' && r.chance(0.3)) L.acc.push('shades');
  if (r.chance(0.08)) L.acc.push('mustache');
  else if (r.chance(0.06)) L.acc.push('beard');
  if (r.chance(theme === 'winter' ? 0.55 : 0.07)) { L.acc.push('scarf'); L.scarfc = r.pick(PAL.hat); }
  if (r.chance(0.15)) { L.acc.push('bag'); L.bagc = r.pick(['#a0663e', '#3a3540', '#d9483b', '#4a78c9']); }
  if (theme === 'carnival' && r.chance(0.12)) { L.acc.push('balloon'); L.balc = r.pick(PAL.hat); }
  if (L.hs === 'bald' && L.dress) L.hs = 'bun';
  return L;
}

// ============================ ANIMALS ===========================
def('dog', 24, 18, (c, o, r) => {
  const col = o.col || '#c98b3a';
  D.shadow(c, 0, 0, 10, 2.5);
  D.line(c, 8, -10, 12, -15, r, { lw: 2.6, stroke: INK }); D.line(c, 8, -10, 12, -15, null, { lw: 1.4, stroke: col });
  D.rect(c, -7, -7, 2.6, 7, col, r, { lw: 0.8 }); D.rect(c, 4, -7, 2.6, 7, col, r, { lw: 0.8 });
  D.ellipse(c, 0, -9, 9, 4.6, col, r);
  D.ellipse(c, -8.5, -14, 4.6, 4.2, col, r);
  D.ellipse(c, -11, -12.2, 2.4, 1.8, shade(col, 0.3), r, { lw: 0.7 });
  D.dot(c, -13, -12.6, 0.9);
  D.ellipse(c, -6.5, -15.5, 1.8, 3.2, shade(col, -0.3), r, { lw: 0.7 });
  D.dot(c, -9.5, -15, 0.7);
  if (o.spot) D.ellipse(c, 2, -10, 3, 2, shade(col, -0.35), null, { stroke: false });
});
def('cat', 16, 16, (c, o, r) => {
  const col = o.col || '#ee8a3a';
  D.shadow(c, 0, 0, 7, 2);
  D.curve(c, [[4, -2], [9, -3], [9, -9], [7, -11]], r, { lw: 2.6 });
  D.curve(c, [[4, -2], [9, -3], [9, -9], [7, -11]], null, { lw: 1.3, stroke: col });
  D.ellipse(c, 0, -5, 6, 5.4, col, r);
  D.poly(c, [[-5, -12], [-5.2, -17], [-2, -13.6]], col, r, { lw: 0.8 });
  D.poly(c, [[5, -12], [5.2, -17], [2, -13.6]], col, r, { lw: 0.8 });
  D.ellipse(c, 0, -11.5, 5.2, 4.4, col, r);
  if (o.stripe) { D.line(c, -1.5, -15.5, -1, -13.8, null, { lw: 0.8 }); D.line(c, 1.5, -15.5, 1, -13.8, null, { lw: 0.8 }); }
  D.ellipse(c, -1.9, -12, 0.7, 1, '#fff6a0', null, { stroke: false });
  D.ellipse(c, 1.9, -12, 0.7, 1, '#fff6a0', null, { stroke: false });
  D.dot(c, -1.9, -12, 0.45); D.dot(c, 1.9, -12, 0.45);
  D.dot(c, 0, -10.4, 0.5, '#e87a8a');
});
def('pigeon', 12, 10, (c, o, r) => {
  D.shadow(c, 0, 0, 5, 1.5);
  D.line(c, -1, -2, -1.5, 0, null, { lw: 0.7, stroke: '#e07a5a' }); D.line(c, 1, -2, 1.5, 0, null, { lw: 0.7, stroke: '#e07a5a' });
  D.ellipse(c, 1, -4.5, 5, 3, o.col || '#9aa1b0', r, { lw: 0.8 });
  D.ellipse(c, -3.5, -7, 2.3, 2.2, shade(o.col || '#9aa1b0', -0.1), r, { lw: 0.8 });
  D.poly(c, [[-5.6, -7], [-7.2, -6.5], [-5.6, -6]], '#e8b04a', null, { lw: 0.5 });
  D.dot(c, -4, -7.4, 0.5);
});
def('duck', 14, 10, (c, o, r) => {
  D.ellipse(c, 1, -3.5, 6, 3.2, o.col || '#f5f2ea', r, { lw: 0.8 });
  D.ellipse(c, -4, -6.5, 2.6, 2.4, o.head || '#3f8f5a', r, { lw: 0.8 });
  D.poly(c, [[-6.2, -6.6], [-8.4, -6], [-6.2, -5.4]], '#f0a04b', null, { lw: 0.5 });
  D.dot(c, -4.4, -7, 0.5);
  D.curve(c, [[-5, -0.4], [0, 0.6], [6, -0.4]], null, { lw: 0.7, stroke: 'rgba(255,255,255,0.7)' });
});
def('gull', 14, 10, (c, o, r) => {
  D.shadow(c, 0, 0, 5, 1.5);
  D.line(c, 0, -2, 0, 0, null, { lw: 0.7, stroke: '#e0a040' });
  D.ellipse(c, 1, -5, 5.5, 3, '#fbfbf7', r, { lw: 0.8 });
  D.ellipse(c, 2.5, -5.6, 3.8, 1.8, '#aab2c0', r, { lw: 0.6 });
  D.ellipse(c, -3.8, -7.5, 2.3, 2.2, '#fbfbf7', r, { lw: 0.8 });
  D.poly(c, [[-5.8, -7.6], [-8, -7], [-5.8, -6.8]], '#f1c83b', null, { lw: 0.5 });
  D.dot(c, -4.3, -8, 0.5);
});
def('robin', 10, 9, (c, o, r) => {
  D.shadow(c, 0, 0, 4, 1.2);
  D.ellipse(c, 0.5, -4, 4.2, 3.2, '#8a5a34', r, { lw: 0.8 });
  D.ellipse(c, -1.8, -3.4, 2, 2, '#e05a4f', null, { stroke: false });
  D.ellipse(c, -3, -6.2, 2, 2, '#8a5a34', r, { lw: 0.7 });
  D.poly(c, [[-4.6, -6.3], [-6.2, -5.9], [-4.6, -5.5]], '#e8b04a', null, { lw: 0.4 });
  D.dot(c, -3.4, -6.6, 0.45);
});
def('crab', 12, 8, (c, o, r) => {
  for (let i = -1; i <= 1; i += 2) {
    D.line(c, i * 3, -2, i * 7, 0, null, { lw: 0.8 });
    D.ellipse(c, i * 6.5, -5.5, 2, 1.6, '#e05a4f', r, { lw: 0.7 });
  }
  D.ellipse(c, 0, -2.8, 4.6, 2.8, '#e05a4f', r, { lw: 0.8 });
  D.dot(c, -1.3, -5.5, 0.6); D.dot(c, 1.3, -5.5, 0.6);
});

// ============================ NATURE ============================
def('tree', 64, 96, (c, o, r) => {
  const g = o.col || '#7fb35a';
  D.shadow(c, 0, 0, 26, 7);
  D.poly(c, [[-5, 0], [-4, -34], [4, -34], [5.5, 0], [8, 1], [-8, 1]], '#8a5a3a', r);
  D.line(c, 0, -28, -8, -40, r, { lw: 2 });
  const blobs = [[-15, -48, 16, 14], [15, -50, 16, 14], [0, -66, 20, 17], [-9, -76, 13, 11], [10, -74, 13, 11], [0, -46, 18, 13]];
  for (const b of blobs) D.ellipse(c, b[0], b[1], b[2], b[3], g, r);
  for (let i = 0; i < 5; i++) D.ellipse(c, r.range(-16, 16), r.range(-76, -46), 4, 3, shade(g, 0.2), null, { stroke: false });
  if (o.fruit) for (let i = 0; i < 6; i++) D.dot(c, r.range(-20, 20), r.range(-74, -44), 1.8, o.fruit);
});
def('pine', 40, 84, (c, o, r) => {
  const g = o.col || '#4f8a55';
  D.shadow(c, 0, 0, 16, 5);
  D.rect(c, -3, -12, 6, 12, '#7a4f33', r);
  const tiers = [[-10, 18, 24], [-30, 15, 22], [-48, 12, 20]];
  for (const t of tiers) {
    D.poly(c, [[-t[1], t[0]], [0, t[0] - t[2] - 6], [t[1], t[0]]], g, r);
    if (o.snow) D.poly(c, [[-t[1] * 0.45, t[0] - t[2] * 0.6], [0, t[0] - t[2] - 6], [t[1] * 0.45, t[0] - t[2] * 0.6], [t[1] * 0.2, t[0] - t[2] * 0.5], [0, t[0] - t[2] * 0.62], [-t[1] * 0.2, t[0] - t[2] * 0.5]], '#fbfdff', r, { lw: 0.8 });
    if (o.snow) D.curve(c, [[-t[1], t[0]], [-t[1] * 0.3, t[0] - 2.5], [t[1] * 0.3, t[0] - 2], [t[1], t[0]]], null, { lw: 2.2, stroke: '#fbfdff' });
  }
});
def('palm', 70, 100, (c, o, r) => {
  D.shadow(c, 4, 0, 18, 5);
  const segs = 8;
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    D.ellipse(c, Math.sin(t * 2) * 12, -t * 76 - 4, 4.8 - t * 1.2, 5, '#b7874f', r, { lw: 0.9 });
  }
  const tx = Math.sin(2) * 12 * 0.95, ty = -80;
  const fronds = [[-34, -4], [-22, 14], [34, -2], [24, 16], [-8, -24], [12, -22]];
  for (const f of fronds) {
    const mx = tx + f[0] * 0.5, my = ty + f[1] * 0.5 - 8;
    D.poly(c, [[tx, ty], [mx, my - 4], [tx + f[0], ty + f[1]], [mx, my + 4]], r.pick(PAL.leaf), r, { smooth: true });
  }
  D.dot(c, tx - 3, ty + 3, 2.6, '#6b4428'); D.dot(c, tx + 2.5, ty + 4, 2.6, '#6b4428');
});
def('bush', 38, 26, (c, o, r) => {
  const g = o.col || '#6aa24f';
  D.shadow(c, 0, 0, 16, 4);
  D.ellipse(c, -9, -8, 10, 8, g, r); D.ellipse(c, 9, -8, 10, 8, g, r); D.ellipse(c, 0, -14, 11, 9, g, r);
  if (o.snow) { D.ellipse(c, 0, -21, 7, 2.6, '#fbfdff', r, { lw: 0.7 }); D.ellipse(c, -9, -15, 5, 2, '#fbfdff', r, { lw: 0.7 }); }
  if (o.bloom) for (let i = 0; i < 6; i++) D.dot(c, r.range(-16, 16), r.range(-20, -4), 1.7, o.bloom);
});
def('flowers', 18, 12, (c, o, r) => {
  for (let i = 0; i < 4; i++) {
    const x = r.range(-7, 7), y = r.range(-9, -3);
    D.line(c, x, y, x + r.range(-1, 1), 0, null, { lw: 0.8, stroke: '#4f8a45' });
    D.dot(c, x, y, 2.1, o.col || r.pick(PAL.flower));
    D.dot(c, x, y, 0.8, '#f7c948');
  }
});
def('tuft', 10, 7, (c, o, r) => {
  const col = o.col || '#5f9a45';
  c.strokeStyle = col; c.lineWidth = 1; c.lineCap = 'round';
  c.beginPath();
  for (let i = 0; i < 4; i++) { const x = r.range(-4, 4); c.moveTo(x, 0); c.lineTo(x + r.range(-2.5, 2.5), -r.range(3, 7)); }
  c.stroke();
});
def('rock', 24, 14, (c, o, r) => {
  const col = o.col || '#a8a4a0';
  D.shadow(c, 0, 0, 11, 3);
  const pts = []; const n = 7;
  for (let i = 0; i < n; i++) { const a = Math.PI + (i / (n - 1)) * Math.PI; pts.push([Math.cos(a) * r.range(9, 12), Math.sin(a) * r.range(7, 12)]); }
  D.poly(c, pts, col, r);
  D.line(c, -3, -6, 2, -8, r, { lw: 0.7, stroke: shade(col, 0.4) });
  if (o.snow) D.ellipse(c, 0, -9, 6, 2.2, '#fbfdff', r, { lw: 0.6 });
});
def('stump', 18, 12, (c, o, r) => {
  D.rect(c, -6, -8, 12, 8, '#8a5a3a', r);
  D.ellipse(c, 0, -8, 6, 2.2, '#d9b27a', r);
  D.ellipse(c, 0, -8, 2.5, 0.9, null, null, { lw: 0.6 });
});
def('mushroom', 10, 10, (c, o, r) => {
  D.rect(c, -1.5, -5, 3, 5, '#f5f0e0', r, { lw: 0.8 });
  D.poly(c, [[-5, -4.5], [-3, -8.5], [3, -8.5], [5, -4.5]], '#d9483b', r, { smooth: true, lw: 0.8 });
  D.dot(c, -1.5, -6.5, 0.8, '#fff'); D.dot(c, 2, -7, 0.7, '#fff');
});
def('reeds', 16, 22, (c, o, r) => {
  for (let i = 0; i < 5; i++) {
    const x = r.range(-6, 6);
    D.line(c, x, 0, x + r.range(-2, 2), -r.range(12, 20), r, { lw: 1, stroke: '#5a7d3a' });
  }
  D.ellipse(c, -1, -16, 1.4, 3.2, '#7a4f33', r, { lw: 0.6 });
  D.ellipse(c, 3, -14, 1.4, 3.2, '#7a4f33', r, { lw: 0.6 });
});
def('lily', 16, 6, (c, o, r) => {
  D.poly(c, [[0, -3], [6, -5], [7, -1], [2, 2], [-5, 1.5], [-7, -2], [-3, -5]], '#6aa24f', r, { smooth: true, lw: 0.8 });
  if (o.bloom) D.dot(c, 1, -2, 1.8, '#ff9ec4');
});
def('dunegrass', 20, 18, (c, o, r) => {
  for (let i = 0; i < 6; i++) {
    const x = r.range(-8, 8);
    D.curve(c, [[x, 0], [x + r.range(-3, 3), -8], [x + r.range(-6, 6), -r.range(12, 17)]], null, { lw: 1, stroke: '#8a9a4a' });
  }
});
def('shell', 8, 6, (c, o, r) => {
  D.poly(c, [[-4, 0], [-3, -4], [0, -5], [3, -4], [4, 0]], o.col || '#f7d6c4', r, { smooth: true, lw: 0.7 });
  D.line(c, 0, -4.5, 0, 0, null, { lw: 0.5 }); D.line(c, -2, -3.5, -1.5, 0, null, { lw: 0.5 }); D.line(c, 2, -3.5, 1.5, 0, null, { lw: 0.5 });
});
def('starfish', 10, 8, (c, o, r) => {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? 2 : 5; pts.push([Math.cos(a) * rr, -3 + Math.sin(a) * rr * 0.7]); }
  D.poly(c, pts, o.col || '#f0a04b', r, { lw: 0.7 });
});
def('snowpile', 30, 12, (c, o, r) => {
  D.poly(c, [[-14, 0], [-10, -6], [-3, -10], [5, -8], [11, -5], [14, 0]], '#fbfdff', r, { smooth: true, stroke: '#aebad0', lw: 0.9 });
  D.curve(c, [[-6, -3], [0, -5], [6, -3]], null, { lw: 0.8, stroke: '#d6deec' });
});

// ============================ PROPS =============================
def('bench', 44, 24, (c, o, r) => {
  const w = o.col || '#a0663e';
  D.shadow(c, 0, 0, 20, 3.5);
  D.rect(c, -18, -8, 2.5, 8, '#4a4f5c', r, { lw: 0.8 }); D.rect(c, 15.5, -8, 2.5, 8, '#4a4f5c', r, { lw: 0.8 });
  D.rect(c, -20, -20, 40, 4, w, r, { lw: 0.9 }); D.rect(c, -20, -15, 40, 3.5, w, r, { lw: 0.9 });
  D.rect(c, -21, -10, 42, 4, shade(w, 0.1), r, { lw: 0.9 });
  if (o.snow) D.rect(c, -21, -12.5, 42, 2.4, '#fbfdff', r, { lw: 0.6 });
});
def('lamp', 14, 74, (c, o, r) => {
  const col = o.col || '#3a3f4c';
  D.shadow(c, 0, 0, 5, 2);
  D.rect(c, -3.5, -6, 7, 6, col, r, { lw: 0.9 });
  D.rect(c, -1.2, -62, 2.4, 57, col, r, { lw: 0.8 });
  D.poly(c, [[-5, -62], [5, -62], [3.5, -70], [-3.5, -70]], '#fff1b0', r, { lw: 0.9 });
  D.poly(c, [[-6, -70], [6, -70], [0, -75]], col, r, { lw: 0.9 });
}, { light: (o) => [[0, -66]] });
def('fence', 40, 16, (c, o, r) => {
  const col = o.col || '#d8c3a0';
  for (const x of [-18, -6, 6, 18]) D.rect(c, x - 1.5, -15, 3, 15, col, r, { lw: 0.8 });
  D.rect(c, -20, -12, 40, 2.5, col, r, { lw: 0.8 }); D.rect(c, -20, -6, 40, 2.5, col, r, { lw: 0.8 });
});
def('crate', 20, 20, (c, o, r) => {
  const col = o.col || '#c4955a';
  D.shadow(c, 0, 0, 10, 2.5);
  D.rect(c, -9, -17, 18, 17, col, r);
  D.line(c, -9, -17, 9, 0, r, { lw: 0.8 }); D.line(c, 9, -17, -9, 0, r, { lw: 0.8 });
  D.rect(c, -9, -17, 18, 3, shade(col, -0.15), r, { lw: 0.7 });
  if (o.goods) for (let i = 0; i < 4; i++) D.ellipse(c, -5 + i * 3.3, -18.5, 2.3, 2.3, o.goods, r, { lw: 0.6 });
});
def('barrel', 18, 22, (c, o, r) => {
  const col = o.col || '#a0663e';
  D.shadow(c, 0, 0, 8, 2.5);
  D.poly(c, [[-7, 0], [-8.5, -10], [-7, -20], [7, -20], [8.5, -10], [7, 0]], col, r, { smooth: true });
  D.line(c, -8.2, -6, 8.2, -6, null, { lw: 1.2, stroke: '#4a4f5c' }); D.line(c, -8.2, -15, 8.2, -15, null, { lw: 1.2, stroke: '#4a4f5c' });
  D.ellipse(c, 0, -20, 7, 1.8, shade(col, 0.2), r, { lw: 0.8 });
});
def('bin', 14, 18, (c, o, r) => {
  D.shadow(c, 0, 0, 6, 2);
  D.poly(c, [[-5.5, -15], [5.5, -15], [4.5, 0], [-4.5, 0]], o.col || '#4f9a5a', r);
  D.rect(c, -6.5, -17, 13, 2.5, shade(o.col || '#4f9a5a', -0.2), r, { lw: 0.8 });
  D.line(c, -2, -12, -1.5, -3, null, { lw: 0.6 }); D.line(c, 2, -12, 1.5, -3, null, { lw: 0.6 });
});
def('mailbox', 12, 28, (c, o, r) => {
  D.shadow(c, 0, 0, 5, 1.8);
  D.rect(c, -5, -24, 10, 24, '#d9483b', r);
  D.ellipse(c, 0, -24, 5, 2.4, '#b3303a', r, { lw: 0.8 });
  D.rect(c, -3, -18, 6, 1.4, INK, null, { stroke: false });
});
def('parasol', 54, 56, (c, o, r) => {
  const col = o.col || '#e05a4f';
  D.shadow(c, 6, 0, 20, 5);
  D.line(c, 0, 0, 2, -44, r, { lw: 1.6 });
  const pts = [];
  for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; pts.push([2 + Math.cos(a) * 25, -42 + Math.sin(a) * 12]); }
  for (let i = 10; i >= 0; i--) { const x = 2 - 25 + i * 5; pts.push([x, -42 + (i % 2 ? -1.5 : 1)]); }
  D.poly(c, pts, col, r, { smooth: false });
  for (let i = 0; i < 5; i += 2) D.poly(c, [[2, -54], [2 - 25 + i * 10, -42], [2 - 25 + (i + 1) * 10, -42]], '#fbfbf7', r, { lw: 0.6 });
});
def('towel', 34, 8, (c, o, r) => {
  const col = o.col || '#4a78c9';
  D.poly(c, [[-16, 0], [-12, -9], [16, -9], [13, 0]], col, r);
  D.line(c, -14, -4.5, 14.5, -4.5, null, { lw: 2, stroke: '#fbfbf7' });
}, { flat: true });
def('blanket', 44, 16, (c, o, r) => {
  const col = o.col || '#e05a4f';
  D.poly(c, [[-22, 0], [-16, -14], [22, -14], [17, 0]], col, r);
  for (let i = -16; i < 20; i += 7) D.line(c, i - 3, -1, i + 2, -13, null, { lw: 1.3, stroke: '#fbfbf7' });
  D.line(c, -19, -7, 19.5, -7, null, { lw: 1.3, stroke: '#fbfbf7' });
  D.rect(c, 4, -14, 9, 7, '#c4955a', r, { lw: 0.8 });
  D.curve(c, [[5, -14], [8.5, -19], [12, -14]], null, { lw: 1 });
}, { flat: true });
def('bucket', 10, 12, (c, o, r) => {
  D.poly(c, [[-4.5, -9], [4.5, -9], [3.5, 0], [-3.5, 0]], o.col || '#f1c83b', r, { lw: 0.8 });
  D.curve(c, [[-4.5, -9], [0, -13], [4.5, -9]], null, { lw: 0.6 });
});
def('minicastle', 22, 18, (c, o, r) => {
  D.rect(c, -9, -8, 18, 8, '#e3c48a', r, { lw: 0.8 });
  D.rect(c, -4, -15, 8, 7, '#e3c48a', r, { lw: 0.8 });
  D.line(c, 0, -15, 0, -20, null, { lw: 0.7 }); D.poly(c, [[0, -20], [4, -18.5], [0, -17]], '#d9483b', null, { lw: 0.5 });
});
def('lifebuoy', 16, 16, (c, o, r) => {
  D.rect(c, -1, -16, 2, 16, '#8a5a34', r, { lw: 0.7 });
  c.beginPath(); c.arc(0, -9, 5, 0, TAU); c.strokeStyle = INK; c.lineWidth = 4.4; c.stroke();
  c.beginPath(); c.arc(0, -9, 5, 0, TAU); c.strokeStyle = '#e05a4f'; c.lineWidth = 2.8; c.stroke();
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, -9, 5, i * Math.PI / 2, i * Math.PI / 2 + 0.6); c.strokeStyle = '#fff'; c.stroke(); }
});
def('boat', 54, 18, (c, o, r) => {
  const col = o.col || '#e05a4f';
  D.poly(c, [[-26, -12], [26, -12], [20, 0], [-20, 0]], col, r);
  D.line(c, -24, -8, 24, -8, null, { lw: 1.4, stroke: '#fbfbf7' });
  if (o.sail) {
    D.line(c, 0, -12, 0, -44, r, { lw: 1.4 });
    D.poly(c, [[1, -42], [18, -14], [1, -14]], '#fbfbf7', r);
  }
  D.curve(c, [[-30, 1], [-15, -1], [0, 1], [15, -1], [30, 1]], null, { lw: 1, stroke: 'rgba(255,255,255,0.8)' });
});
def('swimmer', 20, 12, (c, o, r) => {
  c.beginPath(); c.ellipse(0, -3, 8, 3.4, 0, 0, TAU); c.strokeStyle = INK; c.lineWidth = 4.4; c.stroke();
  c.beginPath(); c.ellipse(0, -3, 8, 3.4, 0, 0, TAU); c.strokeStyle = o.col || '#f1c83b'; c.lineWidth = 2.8; c.stroke();
  D.ellipse(c, 0, -8, 4.6, 4.8, o.look.skin, r);
  D.poly(c, [[-4.8, -9], [-4, -12], [0, -13.4], [4, -12], [4.8, -9]], o.look.hair, r, { smooth: true, lw: 0.8 });
  D.dot(c, -1.6, -8, 0.6); D.dot(c, 1.6, -8, 0.6);
  D.curve(c, [[-12, 0], [-6, -2], [0, 0], [6, -2], [12, 0]], null, { lw: 1, stroke: 'rgba(255,255,255,0.85)' });
});
def('snowman', 26, 44, (c, o, r) => {
  D.shadow(c, 0, 0, 11, 3);
  D.ellipse(c, 0, -10, 11, 10, '#fbfdff', r, { stroke: '#8e9ab3' });
  D.ellipse(c, 0, -26, 8, 7.5, '#fbfdff', r, { stroke: '#8e9ab3' });
  D.ellipse(c, 0, -38, 6, 5.8, '#fbfdff', r, { stroke: '#8e9ab3' });
  D.dot(c, -2, -39, 0.8); D.dot(c, 2, -39, 0.8);
  D.poly(c, [[0, -37.5], [5.5, -36.5], [0, -36]], '#f08a2a', null, { lw: 0.5 });
  D.dot(c, 0, -27, 0.9); D.dot(c, 0, -23.5, 0.9); D.dot(c, 0, -13, 0.9);
  D.line(c, -7, -27, -15, -33, r, { lw: 1.2, stroke: '#6b4428' }); D.line(c, 7, -27, 15, -31, r, { lw: 1.2, stroke: '#6b4428' });
  if (o.hat === 'tophat') { D.rect(c, -4.5, -51, 9, 8, '#3a3540', r); D.ellipse(c, 0, -43.3, 7, 1.6, '#3a3540', r, { lw: 0.8 }); }
  else if (o.hat) D.poly(c, [[-6, -42], [-5, -47], [0, -48.5], [5, -47], [6, -42]], o.hat, r, { smooth: true });
  if (o.scarf) D.rect(c, -6.5, -33, 13, 3, o.scarf, r, { lw: 0.8 });
});
def('sled', 30, 12, (c, o, r) => {
  const col = o.col || '#d9483b';
  D.curve(c, [[-14, 0], [12, 0], [16, -4]], null, { lw: 1.6, stroke: '#6b6f78' });
  D.line(c, -8, 0, -8, -4, null, { lw: 0.8 }); D.line(c, 7, 0, 7, -4, null, { lw: 0.8 });
  D.rect(c, -13, -8, 25, 4, col, r, { lw: 0.9 });
});
def('woodpile', 30, 18, (c, o, r) => {
  D.shadow(c, 0, 0, 14, 3);
  const pos = [[-8, -3.5], [0, -3.5], [8, -3.5], [-4, -10], [4, -10], [0, -16.5]];
  for (const p of pos) {
    D.ellipse(c, p[0], p[1], 3.8, 3.4, '#b07a48', r, { lw: 0.8 });
    D.ellipse(c, p[0], p[1], 1.6, 1.4, '#e0b98a', null, { lw: 0.5 });
  }
  if (o.snow) D.ellipse(c, 0, -20, 5, 1.6, '#fbfdff', r, { lw: 0.6 });
});
def('gift', 14, 14, (c, o, r) => {
  const col = o.col || '#d9483b';
  D.rect(c, -6, -11, 12, 11, col, r, { lw: 0.9 });
  D.rect(c, -1.2, -11, 2.4, 11, o.rib || '#f1c83b', null, { lw: 0.5 });
  D.ellipse(c, -2.5, -12.5, 2.4, 1.5, o.rib || '#f1c83b', r, { lw: 0.6 }); D.ellipse(c, 2.5, -12.5, 2.4, 1.5, o.rib || '#f1c83b', r, { lw: 0.6 });
});
def('table', 44, 26, (c, o, r) => {
  const col = o.col || '#e05a4f';
  D.shadow(c, 0, 0, 20, 4);
  // chairs
  for (const s of [-1, 1]) {
    D.rect(c, s * 15 - 4, -18, 8, 2, '#6b4f3a', r, { lw: 0.7 });
    D.line(c, s * 15 + s * 4, -24, s * 15 + s * 4, 0, null, { lw: 1 });
    D.line(c, s * 15 - s * 4, -16, s * 15 - s * 4, 0, null, { lw: 1 });
  }
  D.line(c, 0, -16, 0, 0, null, { lw: 1.6 });
  D.ellipse(c, 0, -17, 10, 3, '#fbfbf7', r);
  D.ellipse(c, 0, -17.6, 6, 1.6, col, null, { stroke: false });
  if (o.cup) { D.rect(c, -3, -22, 3.6, 3.6, '#fbfbf7', null, { lw: 0.6 }); }
});
def('bike', 36, 22, (c, o, r) => {
  const col = o.col || '#4a78c9';
  D.shadow(c, 0, 0, 16, 2.5);
  c.beginPath(); c.arc(-10, -7, 6.5, 0, TAU); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
  c.beginPath(); c.arc(10, -7, 6.5, 0, TAU); c.stroke();
  D.poly(c, [[-10, -7], [-2, -7], [5, -15], [-5, -15]], null, r, { open: true, stroke: col, lw: 1.8 });
  D.line(c, -2, -7, -6, -17, null, { lw: 1.8, stroke: col });
  D.line(c, 5, -15, 10, -7, null, { lw: 1.8, stroke: col });
  D.line(c, 5, -15, 4, -19, null, { lw: 1.4 });
  D.line(c, 2, -19, 7, -19, null, { lw: 1.4 });
  D.rect(c, -8.5, -18.5, 5, 1.8, INK, null, { stroke: false });
  if (o.basket) D.rect(c, 5, -20, 7, 5, '#c4955a', r, { lw: 0.7 });
});
def('flowerpot', 14, 20, (c, o, r) => {
  D.shadow(c, 0, 0, 6, 2);
  D.poly(c, [[-5, -8], [5, -8], [4, 0], [-4, 0]], '#c9704a', r, { lw: 0.9 });
  D.rect(c, -6, -10, 12, 2.6, '#c9704a', r, { lw: 0.8 });
  D.ellipse(c, 0, -14, 6, 4.5, '#6aa24f', r, { lw: 0.8 });
  for (let i = 0; i < 3; i++) D.dot(c, r.range(-4, 4), r.range(-17, -11), 1.5, o.col || r.pick(PAL.flower));
});
def('planter', 40, 60, (c, o, r) => {
  D.shadow(c, 0, 0, 14, 3.5);
  D.rect(c, -10, -12, 20, 12, '#b9a78c', r);
  D.rect(c, -2.5, -28, 5, 16, '#8a5a3a', r, { lw: 0.8 });
  D.ellipse(c, 0, -38, 14, 13, '#6aa24f', r);
  D.ellipse(c, -6, -44, 8, 7, '#7fb35a', r);
  D.ellipse(c, 6, -42, 8, 7, '#7fb35a', r);
});
def('hydrant', 10, 16, (c, o, r) => {
  D.shadow(c, 0, 0, 5, 1.5);
  D.rect(c, -3.5, -12, 7, 12, '#d9483b', r, { lw: 0.9 });
  D.ellipse(c, 0, -12.5, 3.8, 2.2, '#b3303a', r, { lw: 0.8 });
  D.rect(c, -5.5, -8, 11, 2.4, '#b3303a', r, { lw: 0.7 });
});
def('balloonstand', 30, 70, (c, o, r) => {
  D.shadow(c, 0, 0, 10, 3);
  D.rect(c, -6, -10, 12, 10, '#f5f2ea', r);
  const cols = ['#d9483b', '#4a78c9', '#f1c83b', '#4f9a5a', '#ec8fb5', '#8e62b8'];
  for (let i = 0; i < 6; i++) {
    const bx = -12 + (i % 3) * 12 + r.range(-2, 2), by = -52 - Math.floor(i / 3) * 12 + r.range(-2, 2);
    D.line(c, 0, -10, bx, by + 6, null, { lw: 0.5 });
    D.ellipse(c, bx, by, 5.2, 6.2, cols[i], r);
  }
});

// ============================ BUILDINGS =========================
function building(c, o, r) {
  const w = o.bw, h = o.bh, wall = o.wall || '#f0dcc0', roof = o.roof || '#c9563f';
  D.shadow(c, 0, 0, w * 0.55, 6, 0.18);
  D.rect(c, -w / 2, -h, w, h, wall, r, { lw: 1.3 });
  if (o.logs) for (let y = -h + 8; y < 0; y += 8) D.line(c, -w / 2, y, w / 2, y, r, { lw: 0.8, stroke: shade(wall, -0.35) });
  if (o.stripes) for (let x = -w / 2 + 8; x < w / 2; x += 16) D.rect(c, x, -h, 8, h, o.stripes, null, { stroke: false });
  if (o.stripes) D.rect(c, -w / 2, -h, w, h, null, r, { lw: 1.3 });
  // roof
  const rh = o.roofH || h * 0.45;
  if (o.flat) {
    D.rect(c, -w / 2 - 4, -h - 8, w + 8, 8, roof, r);
  } else {
    D.poly(c, [[-w / 2 - 7, -h + 2], [0, -h - rh], [w / 2 + 7, -h + 2]], roof, r, { lw: 1.3 });
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      D.line(c, -w / 2 - 7 + t * (w / 2 + 7), -h + 2 - t * (rh + 2), w / 2 + 7 - t * (w / 2 + 7), -h + 2 - t * (rh + 2), r, { lw: 0.6, stroke: shade(roof, -0.3) });
    }
    if (o.snow) D.poly(c, [[-w / 2 - 7, -h + 2], [0, -h - rh], [w / 2 + 7, -h + 2], [w / 2, -h + 5], [w / 4, -h - rh * 0.4], [0, -h - rh + 8], [-w / 4, -h - rh * 0.45], [-w / 2, -h + 5]], '#fbfdff', r, { lw: 1 });
    if (o.chimney) D.rect(c, w * 0.18, -h - rh * 0.8, 9, rh * 0.5, '#b0785a', r);
  }
  // windows
  const cols = Math.max(1, Math.floor(w / 34)), rows = Math.max(1, Math.floor((h - 34) / 30));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const wx = -w / 2 + (i + 0.5) * (w / cols) - 7, wy = -h + 12 + j * 30;
    if (Math.abs(wx + 7) < 12 && j === rows - 1 && h < 90) continue;
    D.rect(c, wx, wy, 14, 14, o.lit ? '#ffe9a0' : '#bfe0ef', r);
    D.line(c, wx + 7, wy, wx + 7, wy + 14, null, { lw: 0.7 });
    D.line(c, wx, wy + 7, wx + 14, wy + 7, null, { lw: 0.7 });
    if (o.shutters) { D.rect(c, wx - 4, wy, 3.5, 14, o.shutters, null, { lw: 0.6 }); D.rect(c, wx + 14.5, wy, 3.5, 14, o.shutters, null, { lw: 0.6 }); }
  }
  // door
  D.rect(c, -8, -24, 16, 24, o.door || '#8a5a3a', r, { lw: 1.2 });
  D.dot(c, 4.5, -11, 1.1, '#e0b33a');
  if (o.awning) {
    const aw = w * 0.8, ay = -34;
    for (let i = 0; i < 8; i++) {
      const x0 = -aw / 2 + (i * aw) / 8;
      D.poly(c, [[x0, ay - 8], [x0 + aw / 8, ay - 8], [x0 + aw / 8, ay], [x0 + aw / 16, ay + 3], [x0, ay]], i % 2 ? '#fbfbf7' : o.awning, r, { lw: 0.8 });
    }
  }
  if (o.sign) {
    const sw = Math.min(w - 10, o.sign.length * 8 + 16);
    D.rect(c, -sw / 2, -h + (o.flat ? -2 : 2) - (o.signUp || 0), sw, 14, '#fbf3dc', r, { lw: 1.1 });
    c.save(); c.scale(o.flip ? -1 : 1, 1);
    D.text(c, o.sign, 0, -h + 9 - (o.signUp || 0), 11, INK);
    c.restore();
  }
  if (o.steeple) {
    D.rect(c, -14, -h - rh - 30, 28, 40, wall, r, { lw: 1.2 });
    D.poly(c, [[-18, -h - rh - 30], [0, -h - rh - 80], [18, -h - rh - 30]], roof, r, { lw: 1.2 });
    if (o.snow) D.poly(c, [[-18, -h - rh - 30], [0, -h - rh - 80], [18, -h - rh - 30], [6, -h - rh - 50], [0, -h - rh - 70], [-6, -h - rh - 52]], '#fbfdff', r, { lw: 0.8 });
    D.ellipse(c, 0, -h - rh - 12, 6, 7, '#e0b33a', r);
    D.line(c, 0, -h - rh - 80, 0, -h - rh - 92, null, { lw: 1.4 });
    D.line(c, -4, -h - rh - 87, 4, -h - rh - 87, null, { lw: 1.4 });
  }
}
def('building', 100, 120, building, { dyn: true, fp: 0.25 });

def('stall', 110, 84, (c, o, r) => {
  const aw = o.awning || '#e05a4f';
  D.shadow(c, 0, 0, 55, 6);
  D.rect(c, -50, -62, 3, 62, '#8a5a3a', r, { lw: 0.8 }); D.rect(c, 47, -62, 3, 62, '#8a5a3a', r, { lw: 0.8 });
  D.rect(c, -46, -28, 92, 28, '#c4955a', r);
  for (let x = -40; x < 46; x += 14) D.line(c, x, -26, x, -2, r, { lw: 0.6, stroke: shade('#c4955a', -0.3) });
  D.rect(c, -50, -32, 100, 6, '#e3c48a', r, { lw: 1 });
  // goods
  const g = o.goods || 'fruit';
  const gcols = { fruit: ['#d9483b', '#f1c83b', '#8cc56a', '#ee8a3a', '#8e62b8'], fish: ['#9aa9c0', '#b8c6d8', '#f0a0a0'], flowers: PAL.flower, food: ['#e8b04a', '#c9704a', '#f5e0a0', '#f06e6e'], cups: ['#fbfbf7', '#e05a4f'], toys: ['#d9483b', '#4a78c9', '#f1c83b', '#4f9a5a', '#ec8fb5'], bread: ['#d9a05a', '#c48a45', '#e8c07a'] }[g];
  for (let i = 0; i < 16; i++) {
    const gx = -42 + (i % 8) * 11 + r.range(-1, 1), gy = -36 - Math.floor(i / 8) * 5;
    if (g === 'fish') D.poly(c, [[gx - 5, gy], [gx + 3, gy - 2.5], [gx + 3, gy + 2.5]], r.pick(gcols), r, { lw: 0.7 });
    else if (g === 'bread') D.ellipse(c, gx, gy, 5, 2.8, r.pick(gcols), r, { lw: 0.7 });
    else if (g === 'cups') D.rect(c, gx - 2.5, gy - 3, 5, 6, r.pick(gcols), r, { lw: 0.7 });
    else D.ellipse(c, gx, gy, 3, 3, r.pick(gcols), r, { lw: 0.7 });
  }
  // awning
  for (let i = 0; i < 10; i++) {
    const x0 = -56 + i * 11.2;
    D.poly(c, [[x0, -76], [x0 + 11.2, -76], [x0 + 11.2, -62], [x0 + 5.6, -58], [x0, -62]], i % 2 ? '#fbfbf7' : aw, r, { lw: 0.9 });
  }
  D.poly(c, [[-56, -76], [-46, -86], [46, -86], [56, -76]], aw, r);
  if (o.sign) { c.save(); c.scale(o.flip ? -1 : 1, 1); D.rect(c, -24, -94, 48, 12, '#fbf3dc', r); D.text(c, o.sign, 0, -88, 10); c.restore(); }
}, { light: () => [[0, -60]] });

def('tent', 130, 140, (c, o, r) => {
  const a = o.col || '#8e62b8', b = o.col2 || '#f1c83b';
  D.shadow(c, 0, 0, 62, 8);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const x0 = -60 + (i * 120) / n, x1 = -60 + ((i + 1) * 120) / n;
    D.poly(c, [[x0, 0], [x1, 0], [x1 * 0.4, -80], [0, -118], [x0 * 0.4, -80]], i % 2 ? b : a, r, { lw: 0.9 });
  }
  D.poly(c, [[-62, 0], [-52, -60], [0, -118], [52, -60], [62, 0]], null, r, { lw: 1.4, open: true });
  D.poly(c, [[-14, 0], [0, -42], [14, 0]], '#2b2233', r);
  D.line(c, 0, -118, 0, -136, null, { lw: 1.3 });
  D.poly(c, [[0, -136], [14, -131], [0, -126]], o.flag || '#d9483b', r, { lw: 0.8 });
  if (o.stars) for (let i = 0; i < 6; i++) D.text(c, '★', r.range(-40, 40), r.range(-70, -20), 9, '#f1c83b');
  if (o.sign) { c.save(); c.scale(o.flip ? -1 : 1, 1); D.rect(c, -30, -60, 60, 13, '#fbf3dc', r); D.text(c, o.sign, 0, -53.5, 10); c.restore(); }
}, { light: () => [[0, -30]] });

// ============================ LANDMARKS =========================
def('fountain', 150, 100, (c, o, r) => {
  D.shadow(c, 0, 4, 76, 16, 0.18);
  D.ellipse(c, 0, -14, 72, 26, '#c9c3b8', r, { lw: 1.4 });
  D.ellipse(c, 0, -17, 62, 20, '#8fc7e0', r, { lw: 1.1 });
  D.ellipse(c, 0, -17, 42, 12, '#a8d6ea', null, { stroke: false });
  D.rect(c, -72, -14, 144, 10, '#c9c3b8', null, { stroke: false });
  D.poly(c, [[-72, -14], [-72, -4], [-60, 4], [60, 4], [72, -4], [72, -14]], '#bdb6aa', r, { lw: 1.3 });
  D.rect(c, -6, -58, 12, 42, '#d6d0c5', r);
  D.ellipse(c, 0, -58, 22, 6, '#d6d0c5', r);
  D.ellipse(c, 0, -60, 16, 3.6, '#8fc7e0', r, { lw: 0.8 });
  D.rect(c, -3, -76, 6, 16, '#d6d0c5', r);
  D.ellipse(c, 0, -78, 5, 5, '#d6d0c5', r);
  for (const s of [-1, 1]) {
    D.curve(c, [[s * 4, -80], [s * 20, -88], [s * 30, -64], [s * 34, -52]], null, { lw: 1.6, stroke: '#7fc3e8' });
    D.curve(c, [[s * 18, -58], [s * 32, -56], [s * 42, -38], [s * 46, -24]], null, { lw: 1.6, stroke: '#7fc3e8' });
  }
}, { fp: 0.6 });

def('bandstand', 190, 160, (c, o, r) => {
  const roof = o.col || '#4f9a5a';
  D.shadow(c, 0, 4, 92, 18, 0.18);
  D.poly(c, [[-86, -8], [-70, -26], [70, -26], [86, -8], [70, 6], [-70, 6]], '#e3d5bd', r, { lw: 1.4 });
  D.rect(c, -20, -4, 40, 10, '#d4c4a8', r);
  D.line(c, -20, 0, 20, 0, null, { lw: 0.7 });
  const px = [-72, -40, -12, 12, 40, 72];
  for (const x of px) D.rect(c, x - 2.5, -112, 5, 100 - Math.abs(x) * 0.15, '#f5f2ea', r, { lw: 1 });
  D.curve(c, [[-80, -48], [-40, -44], [0, -48], [40, -44], [80, -48]], null, { lw: 1.2 });
  D.poly(c, [[-92, -108], [0, -160], [92, -108]], roof, r, { lw: 1.4 });
  for (let i = 0; i < 12; i++) {
    const x0 = -92 + i * (184 / 12);
    D.poly(c, [[x0, -108], [x0 + 184 / 12, -108], [x0 + 184 / 24, -100]], i % 2 ? '#fbfbf7' : roof, r, { lw: 0.9 });
  }
  D.line(c, 0, -160, 0, -176, null, { lw: 1.3 });
  D.poly(c, [[0, -176], [14, -171], [0, -166]], '#d9483b', r, { lw: 0.8 });
  // music stands
  D.line(c, -20, -26, -20, -42, null, { lw: 1 }); D.rect(c, -26, -46, 12, 5, '#3a3540', null, { lw: 0.6 });
  D.line(c, 22, -26, 22, -42, null, { lw: 1 }); D.rect(c, 16, -46, 12, 5, '#3a3540', null, { lw: 0.6 });
}, { fp: 0.35 });

def('statue', 50, 110, (c, o, r) => {
  const st = '#b7c2b4';
  D.shadow(c, 0, 0, 24, 5);
  D.rect(c, -20, -34, 40, 34, '#cfc8bb', r, { lw: 1.2 });
  D.rect(c, -23, -38, 46, 6, '#bdb6aa', r);
  D.rect(c, -12, -22, 24, 10, '#e8e0cf', null, { lw: 0.7 });
  D.text(c, o.label || 'SIR PUDDLE', 0, -17, 5.5, INK);
  c.save(); c.translate(0, -38); c.scale(1.2, 1.2);
  drawPerson(c, { skin: st, hair: st, hs: 'short', hat: 'tophat', hatc: st, shirt: st, pants: shade(st, -0.1), acc: ['mustache'], beardc: shade(st, -0.2), pose: 'wave' }, r);
  c.restore();
  D.ellipse(c, 13, -95, 3, 2.2, '#9aa1b0', r, { lw: 0.6 }); // pigeon on hand
});

def('slide', 120, 90, (c, o, r) => {
  const col = o.col || '#ee8a3a';
  D.shadow(c, 0, 0, 58, 8);
  D.rect(c, -46, -62, 4, 62, '#4a78c9', r); D.rect(c, -26, -62, 4, 62, '#4a78c9', r);
  for (let y = -54; y < 0; y += 10) D.line(c, -44, y, -24, y, null, { lw: 1.4 });
  D.rect(c, -50, -66, 32, 6, '#f1c83b', r);
  D.poly(c, [[-20, -66], [-18, -60], [52, -2], [58, -6]], col, r, { lw: 1.2 });
  D.poly(c, [[-18, -60], [-12, -60], [56, 0], [52, -2]], shade(col, -0.2), r, { lw: 1 });
  // swing set
  D.line(c, 20, -70, 30, 0, r, { lw: 2, stroke: '#d9483b' }); D.line(c, 20, -70, 10, 0, r, { lw: 2, stroke: '#d9483b' });
  D.line(c, 60, -70, 70, 0, r, { lw: 2, stroke: '#d9483b' }); D.line(c, 60, -70, 50, 0, r, { lw: 2, stroke: '#d9483b' });
  D.line(c, 20, -70, 60, -70, r, { lw: 2.4 });
  D.line(c, 34, -70, 34, -26, null, { lw: 0.7 }); D.line(c, 44, -70, 44, -26, null, { lw: 0.7 });
  D.rect(c, 32, -27, 14, 3, '#f1c83b', r, { lw: 0.8 });
}, { fp: 0.35 });

def('clocktower', 110, 390, (c, o, r) => {
  D.shadow(c, 0, 0, 60, 10, 0.2);
  D.rect(c, -44, -300, 88, 300, '#e3c9a4', r, { lw: 1.4 });
  for (let y = -290; y < 0; y += 18) for (let x = -44 + ((y / 18) % 2 ? 0 : 11); x < 40; x += 22) D.rect(c, x, y, 20, 8, null, null, { lw: 0.4, stroke: 'rgba(120,80,50,0.35)' });
  D.rect(c, -50, -310, 100, 12, '#c9b08a', r);
  D.poly(c, [[-50, -310], [0, -386], [50, -310]], '#4a78c9', r, { lw: 1.4 });
  D.line(c, 0, -386, 0, -400, null, { lw: 1.4 });
  D.ellipse(c, 0, -250, 30, 30, '#fbf6e8', r, { lw: 1.6 });
  D.ellipse(c, 0, -250, 33, 33, null, r, { lw: 1 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; D.line(c, Math.cos(a) * 24, -250 + Math.sin(a) * 24, Math.cos(a) * 27, -250 + Math.sin(a) * 27, null, { lw: 1.3 }); }
  D.line(c, 0, -250, 0, -270, null, { lw: 2 }); D.line(c, 0, -250, 13, -244, null, { lw: 2 });
  for (const y of [-190, -130]) { D.rect(c, -24, y, 16, 26, '#bfe0ef', r); D.rect(c, 8, y, 16, 26, '#bfe0ef', r); }
  D.poly(c, [[-16, 0], [-16, -40], [0, -54], [16, -40], [16, 0]], '#7a4f33', r, { lw: 1.3 });
}, { fp: 0.12 });

def('busstop', 90, 80, (c, o, r) => {
  D.shadow(c, 0, 0, 44, 6);
  D.rect(c, -40, -64, 3, 64, '#4a4f5c', r, { lw: 0.8 }); D.rect(c, 26, -64, 3, 64, '#4a4f5c', r, { lw: 0.8 });
  D.rect(c, -38, -60, 64, 44, 'rgba(190,225,240,0.55)', r, { lw: 1 });
  D.rect(c, -44, -70, 76, 8, '#4a78c9', r);
  D.rect(c, -32, -18, 50, 4, '#a0663e', r, { lw: 0.8 });
  D.line(c, 38, 0, 38, -78, r, { lw: 2 });
  D.ellipse(c, 38, -82, 9, 9, '#f1c83b', r);
  c.save(); c.scale(o.flip ? -1 : 1, 1); D.text(c, 'BUS', o.flip ? -38 : 38, -82, 7); c.restore();
}, { fp: 0.4 });

def('flowercart', 90, 70, (c, o, r) => {
  D.shadow(c, 0, 0, 44, 6);
  D.line(c, 30, -16, 52, -8, r, { lw: 2.2, stroke: '#6b4428' });
  D.rect(c, -38, -34, 70, 22, '#6aa24f', r);
  for (let i = 0; i < 6; i++) {
    D.rect(c, -34 + i * 11, -44, 9, 10, '#9aa3b1', r, { lw: 0.8 });
    for (let k = 0; k < 4; k++) D.dot(c, -32 + i * 11 + r.range(0, 6), -48 - r.range(0, 7), 2.2, PAL.flower[(i + k) % PAL.flower.length]);
  }
  D.ellipse(c, -22, -10, 10, 10, '#c4955a', r); D.ellipse(c, 16, -10, 10, 10, '#c4955a', r);
  D.dot(c, -22, -10, 2); D.dot(c, 16, -10, 2);
});

def('lighthouse', 90, 320, (c, o, r) => {
  D.shadow(c, 0, 0, 50, 8, 0.2);
  for (let i = 0; i < 6; i++) D.ellipse(c, -40 + i * 16, -6 + (i % 2) * 3, 12, 9, '#9aa1a8', r);
  D.poly(c, [[-30, -10], [-20, -250], [20, -250], [30, -10]], '#fbfbf7', r, { lw: 1.4 });
  for (let k = 0; k < 4; k++) {
    const y0 = -10 - k * 60 - 30, y1 = y0 - 30;
    const w0 = 30 - (y0 + 10) / -240 * 10, w1 = 30 - (y1 + 10) / -240 * 10;
    D.poly(c, [[-w0, y0], [-w1, y1], [w1, y1], [w0, y0]], '#d9483b', r, { lw: 0.8 });
  }
  D.rect(c, -26, -258, 52, 8, '#3a3540', r);
  D.rect(c, -16, -290, 32, 32, '#fff1a0', r, { lw: 1.3 });
  D.line(c, -5, -290, -5, -258, null, { lw: 1 }); D.line(c, 5, -290, 5, -258, null, { lw: 1 });
  D.poly(c, [[-22, -290], [0, -314], [22, -290]], '#d9483b', r);
  D.rect(c, -7, -36, 14, 26, '#6b4428', r);
}, { fp: 0.1 });

def('pier', 100, 380, (c, o, r) => {
  for (let y = -370; y < 0; y += 60) { D.rect(c, -44, y, 6, 16, '#6b4428', r, { lw: 0.8 }); D.rect(c, 38, y, 6, 16, '#6b4428', r, { lw: 0.8 }); }
  D.rect(c, -42, -380, 84, 370, '#c9a06a', r, { lw: 1.4 });
  for (let y = -372; y < -10; y += 9) D.line(c, -42, y, 42, y, r, { lw: 0.6, stroke: '#8a6a44' });
  D.line(c, -42, -380, -42, -10, r, { lw: 2.4, stroke: '#8a5a34' }); D.line(c, 42, -380, 42, -10, r, { lw: 2.4, stroke: '#8a5a34' });
}, { fp: 1, flat: true });

def('lifeguard', 76, 120, (c, o, r) => {
  D.shadow(c, 0, 0, 34, 6);
  D.line(c, -24, 0, -18, -60, r, { lw: 3, stroke: '#fbfbf7' }); D.line(c, -24, 0, -18, -60, null, { lw: 1 });
  D.line(c, 24, 0, 18, -60, r, { lw: 3, stroke: '#fbfbf7' }); D.line(c, 24, 0, 18, -60, null, { lw: 1 });
  for (let y = -10; y > -60; y -= 10) D.line(c, -6, y, 6, y + 6, null, { lw: 1.2 });
  D.rect(c, -26, -64, 52, 6, '#c9a06a', r);
  D.rect(c, -22, -96, 44, 32, '#d9483b', r, { lw: 1.3 });
  D.rect(c, -16, -90, 32, 14, '#bfe0ef', r);
  D.poly(c, [[-28, -96], [0, -112], [28, -96]], '#fbfbf7', r);
  D.line(c, 26, -96, 26, -124, null, { lw: 1.2 });
  D.poly(c, [[26, -124], [42, -119], [26, -114]], '#f1c83b', r, { lw: 0.8 });
  c.save(); c.scale(o.flip ? -1 : 1, 1); D.text(c, '+', 0, -70, 10, '#fff'); c.restore();
});

def('icecream', 76, 80, (c, o, r) => {
  D.shadow(c, 0, 0, 36, 6);
  D.line(c, 0, -34, 0, -64, r, { lw: 1.6 });
  const pts = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; pts.push([Math.cos(a) * 32, -62 + Math.sin(a) * 14]); }
  D.poly(c, pts, '#ec8fb5', r);
  for (let i = 0; i < 8; i += 2) D.poly(c, [[0, -76], [Math.cos(Math.PI + i / 8 * Math.PI) * 32, -62 + Math.sin(Math.PI + i / 8 * Math.PI) * 14], [Math.cos(Math.PI + (i + 1) / 8 * Math.PI) * 32, -62 + Math.sin(Math.PI + (i + 1) / 8 * Math.PI) * 14]], '#fbfbf7', r, { lw: 0.6 });
  D.rect(c, -30, -34, 60, 24, '#bfe6ee', r);
  D.ellipse(c, -20, -8, 7, 7, '#9aa1a8', r); D.ellipse(c, 20, -8, 7, 7, '#9aa1a8', r);
  D.poly(c, [[-6, -28], [0, -14], [6, -28]], '#e3b06a', r, { lw: 0.8 });
  D.ellipse(c, 0, -30, 6, 5, '#f7c6d8', r, { lw: 0.8 });
});

def('sandcastle', 110, 80, (c, o, r) => {
  const s = '#e3c48a';
  D.shadow(c, 0, 0, 54, 7);
  D.rect(c, -46, -30, 92, 30, s, r, { lw: 1.3 });
  for (const x of [-46, -26, 14, 34]) D.rect(c, x, -38, 12, 8, s, r, { lw: 0.9 });
  for (const x of [-48, 30]) { D.rect(c, x, -58, 18, 58, s, r, { lw: 1.1 }); D.poly(c, [[x - 2, -58], [x + 9, -72], [x + 20, -58]], shade(s, -0.1), r); }
  D.rect(c, -12, -64, 24, 34, s, r, { lw: 1.1 });
  D.poly(c, [[-14, -64], [0, -82], [14, -64]], shade(s, -0.1), r);
  D.line(c, 0, -82, 0, -96, null, { lw: 1 }); D.poly(c, [[0, -96], [12, -92], [0, -88]], '#4a78c9', r, { lw: 0.7 });
  D.poly(c, [[-7, 0], [-7, -12], [0, -18], [7, -12], [7, 0]], shade(s, -0.35), r, { lw: 0.9 });
  for (let i = 0; i < 8; i++) D.dot(c, r.range(-44, 44), r.range(-26, -4), 0.8, shade(s, -0.3));
});

def('rockpool', 150, 70, (c, o, r) => {
  D.ellipse(c, 0, -26, 64, 26, '#7fc3dc', r, { lw: 1.2 });
  D.ellipse(c, 6, -24, 40, 14, '#9ad2e6', null, { stroke: false });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    D.ellipse(c, Math.cos(a) * 68, -26 + Math.sin(a) * 30, r.range(8, 14), r.range(6, 10), r.pick(['#9aa1a8', '#8a9097', '#a8adb3']), r);
  }
  D.poly(c, [[-10, -30], [-6, -32], [-4, -28]], '#e05a4f', null, { lw: 0.5 });
}, { fp: 1, flat: true });

def('xmastree', 160, 280, (c, o, r) => {
  D.shadow(c, 0, 0, 72, 12, 0.2);
  D.rect(c, -10, -26, 20, 26, '#7a4f33', r);
  const tiers = [[-20, 76, 80], [-80, 62, 74], [-136, 48, 66], [-186, 34, 60]];
  for (const t of tiers) {
    D.poly(c, [[-t[1], t[0]], [0, t[0] - t[2] - 10], [t[1], t[0]]], '#3f7a4a', r, { lw: 1.4 });
    D.poly(c, [[-t[1] * 0.5, t[0] - t[2] * 0.52], [0, t[0] - t[2] - 10], [t[1] * 0.5, t[0] - t[2] * 0.52], [t[1] * 0.15, t[0] - t[2] * 0.45], [-t[1] * 0.2, t[0] - t[2] * 0.52]], '#fbfdff', r, { lw: 0.9 });
  }
  const oc = ['#d9483b', '#f1c83b', '#4a78c9', '#ec8fb5', '#fbfbf7'];
  for (let i = 0; i < 40; i++) {
    const t = r(); const y = -24 - t * 220; const half = 76 * (1 - t) * 0.85;
    D.ellipse(c, r.range(-half, half), y, 3, 3, r.pick(oc), r, { lw: 0.7 });
  }
  const sp = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? 6 : 14; sp.push([Math.cos(a) * rr, -262 + Math.sin(a) * rr]); }
  D.poly(c, sp, '#f7d13b', r, { lw: 1.2 });
}, { fp: 0.2, light: () => [[0, -262], [-40, -60], [40, -110], [0, -170]] });

def('cocoa', 110, 84, (c, o, r) => ART.stall.draw(c, Object.assign({}, o, { goods: 'cups', awning: '#8a5a34', sign: 'COCOA' }), r), { light: () => [[0, -60]] });

def('ferris', 380, 440, (c, o, r) => {
  D.shadow(c, 0, 0, 120, 14, 0.2);
  const cy = -250, R = 170;
  D.line(c, -90, 0, 0, cy, r, { lw: 5, stroke: '#6b6f78' }); D.line(c, 90, 0, 0, cy, r, { lw: 5, stroke: '#6b6f78' });
  D.line(c, -90, 0, 0, cy, null, { lw: 1 }); D.line(c, 90, 0, 0, cy, null, { lw: 1 });
  c.beginPath(); c.arc(0, cy, R, 0, TAU); c.strokeStyle = INK; c.lineWidth = 5; c.stroke();
  c.beginPath(); c.arc(0, cy, R, 0, TAU); c.strokeStyle = '#e8e2d6'; c.lineWidth = 3; c.stroke();
  c.beginPath(); c.arc(0, cy, R * 0.55, 0, TAU); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  const n = 12, cols = ['#d9483b', '#f1c83b', '#4a78c9', '#4f9a5a', '#ec8fb5', '#8e62b8'];
  for (let i = 0; i < n; i++) { const a = i / n * TAU; D.line(c, 0, cy, Math.cos(a) * R, cy + Math.sin(a) * R, null, { lw: 1.2 }); }
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + 0.1; const gx = Math.cos(a) * R, gy = cy + Math.sin(a) * R;
    D.line(c, gx, gy, gx, gy + 8, null, { lw: 1 });
    D.poly(c, [[gx - 12, gy + 8], [gx + 12, gy + 8], [gx + 10, gy + 26], [gx - 10, gy + 26]], cols[i % cols.length], r, { lw: 1.1 });
    D.rect(c, gx - 8, gy + 11, 16, 6, '#bfe0ef', null, { lw: 0.6 });
  }
  D.ellipse(c, 0, cy, 12, 12, '#e0b33a', r);
  D.rect(c, -50, -20, 100, 20, '#d9483b', r);
  c.save(); c.scale(o.flip ? -1 : 1, 1); D.text(c, 'BIG WHEEL', 0, -10, 12, '#fbf3dc'); c.restore();
}, { fp: 0.08, light: () => { const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pts.push([Math.cos(a) * 170, -250 + Math.sin(a) * 170]); } pts.push([0, -250]); return pts; } });

def('carousel', 230, 210, (c, o, r) => {
  D.shadow(c, 0, 4, 110, 18, 0.2);
  D.ellipse(c, 0, -14, 104, 22, '#c9563f', r, { lw: 1.4 });
  D.ellipse(c, 0, -20, 98, 18, '#e8d3a0', r);
  const hc = ['#fbfbf7', '#f1c83b', '#ec8fb5', '#7fc3e8'];
  for (let i = 0; i < 7; i++) {
    const x = -84 + i * 28, y = -26 + Math.abs(x) * 0.02;
    D.line(c, x, y - 90, x, y + 2, null, { lw: 1.6, stroke: '#e0b33a' });
    const hy = y - 30 - (i % 2) * 10;
    D.ellipse(c, x, hy, 11, 5, hc[i % 4], r, { lw: 1 });
    D.ellipse(c, x - 10, hy - 6, 4, 4, hc[i % 4], r, { lw: 0.9 });
    D.line(c, x - 7, hy + 3, x - 9, hy + 12, null, { lw: 1.2 }); D.line(c, x + 7, hy + 3, x + 9, hy + 12, null, { lw: 1.2 });
  }
  D.rect(c, -10, -140, 20, 120, '#e8b04a', r);
  D.poly(c, [[-112, -120], [0, -196], [112, -120]], '#d9483b', r, { lw: 1.4 });
  for (let i = 0; i < 8; i++) D.poly(c, [[0, -196], [-112 + i * 28, -120], [-112 + i * 28 + 14, -120]], '#fbfbf7', r, { lw: 0.6 });
  for (let i = 0; i < 16; i++) {
    const x0 = -112 + i * 14;
    D.poly(c, [[x0, -122], [x0 + 14, -122], [x0 + 7, -110]], i % 2 ? '#f1c83b' : '#d9483b', r, { lw: 0.8 });
  }
  D.line(c, 0, -196, 0, -212, null, { lw: 1.3 }); D.poly(c, [[0, -212], [14, -207], [0, -202]], '#f1c83b', r, { lw: 0.8 });
}, { fp: 0.2, light: () => { const p = []; for (let i = 0; i < 9; i++) p.push([-104 + i * 26, -116]); return p; } });

def('booth', 80, 110, (c, o, r) => {
  D.shadow(c, 0, 0, 38, 6);
  D.rect(c, -32, -80, 64, 80, '#d9483b', r, { lw: 1.3 });
  for (let x = -24; x < 32; x += 16) D.rect(c, x, -80, 8, 80, '#f1c83b', null, { stroke: false });
  D.rect(c, -32, -80, 64, 80, null, r, { lw: 1.3 });
  D.rect(c, -20, -64, 40, 26, '#ffe9a0', r);
  D.rect(c, -24, -38, 48, 5, '#8a5a34', r, { lw: 0.8 });
  D.poly(c, [[-38, -80], [0, -104], [38, -80]], '#4a78c9', r);
  c.save(); c.scale(o.flip ? -1 : 1, 1); D.rect(c, -30, -98, 60, 12, '#fbf3dc', r); D.text(c, o.sign || 'TICKETS', 0, -92, 9); c.restore();
}, { light: () => [[0, -52]] });

// ============================ LOST ITEM / helpers ===============
def('item', 20, 18, (c, o, r) => {
  c.translate(0, -8);
  ITEMS[o.it](c, COLORS[o.col], r);
});

function artBBox(o) {
  const a = ART[o.type];
  const w = (o.w || a.w) * o.s, h = (o.h || a.h) * o.s;
  let x0 = o.x - w / 2, x1 = o.x + w / 2;
  let y0 = o.y - h, y1 = o.y + 6 * o.s;
  if (o.type === 'building') { y0 = o.y - (o.bh + (o.roofH || o.bh * 0.45) + (o.steeple ? 100 : 0) + 10) * o.s; x0 = o.x - (o.bw / 2 + 10) * o.s; x1 = o.x + (o.bw / 2 + 10) * o.s; }
  if (o.type === 'person' && o.look && (o.look.acc || []).includes('balloon')) y0 = o.y - 74 * o.s;
  return { x0, y0, x1, y1 };
}

function paintObj(c, o) {
  const a = ART[o.type];
  const r = RNG(o.seed);
  c.save();
  c.translate(o.x, o.y);
  c.scale(o.s * (o.flip ? -1 : 1), o.s);
  a.draw(c, o, r);
  c.restore();
}
