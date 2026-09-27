// ---------------------------------------------------------------
//  Levels — the five districts of Puddlewick
// ---------------------------------------------------------------
'use strict';

function Look(o) {
  return Object.assign({ skin: '#efc3a0', hair: '#5a3a22', hs: 'short', hat: 'none', hatc: '#d9483b', shirt: '#5b7fd6', pants: '#3d4a6b', dress: false, acc: [], pose: 'idle' }, o);
}

// ---------- shared ground helpers ----------
function fillReg(c, reg, col) { c.fillStyle = col; c.fillRect(reg.x0 - 1, reg.y0 - 1, reg.x1 - reg.x0 + 2, reg.y1 - reg.y0 + 2); }
function eachCell(reg, size, seed, fn) {
  const i0 = Math.floor(reg.x0 / size) - 1, i1 = Math.floor(reg.x1 / size) + 1;
  const j0 = Math.floor(reg.y0 / size) - 1, j1 = Math.floor(reg.y1 / size) + 1;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(i, j, RNG(hash2(i, j, seed)));
}
function drawPaths(c, paths, col) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const p of paths) { D.path(c, p.pts, true, false); c.strokeStyle = INK; c.lineWidth = p.w + 3; c.stroke(); }
  for (const p of paths) { D.path(c, p.pts, true, false); c.strokeStyle = p.col || col; c.lineWidth = p.w; c.stroke(); }
}
function blob(c, e, fill, edge, seed, lw) {
  D.ellipse(c, e.x, e.y, e.rx, e.ry, fill, RNG(seed || 7), { n: 26, j: Math.min(e.rx, e.ry) * 0.05, lw: lw || 2, stroke: edge === undefined ? INK : edge });
}
const inEll = (x, y, e, m) => { const dx = (x - e.x) / (e.rx + m), dy = (y - e.y) / (e.ry + m); return dx * dx + dy * dy < 1; };
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = clamp(t, 0, 1);
  const ex = ax + dx * t - px, ey = ay + dy * t - py; return Math.sqrt(ex * ex + ey * ey);
}
function nearPath(paths, x, y, m) {
  for (const p of paths) for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i], b = p.pts[i + 1];
    if (distSeg(x, y, a[0], a[1], b[0], b[1]) < p.w / 2 + m) return true;
  }
  return false;
}
function grassTexture(c, reg, base, seed) {
  eachCell(reg, 70, seed, (i, j, r) => {
    for (let k = 0; k < 3; k++) {
      c.fillStyle = r.chance(0.5) ? shade(base, 0.07) : shade(base, -0.05);
      c.beginPath(); c.ellipse(i * 70 + r() * 70, j * 70 + r() * 70, r.range(10, 26), r.range(5, 12), 0, 0, TAU); c.fill();
    }
    if (r.chance(0.5)) {
      c.strokeStyle = shade(base, -0.2); c.lineWidth = 0.9; c.beginPath();
      const x = i * 70 + r() * 70, y = j * 70 + r() * 70;
      c.moveTo(x, y); c.lineTo(x - 2, y - 5); c.moveTo(x + 2, y); c.lineTo(x + 3, y - 5); c.stroke();
    }
  });
}

// ================================================================
const LEVELS = [];

// ------------------------- 1. PARK ------------------------------
(() => {
  const pond = { x: 1860, y: 1180, rx: 300, ry: 165 };
  const paths = [
    { w: 56, pts: [[-40, 850], [400, 820], [800, 810], [1200, 850], [1600, 830], [2000, 790], [2440, 800]] },
    { w: 46, pts: [[1210, -40], [1190, 300], [1200, 650], [1200, 850], [1230, 1200], [1190, 1640]] },
    { w: 34, pts: [[560, 620], [820, 730], [1200, 850]] },
    { w: 34, pts: [[480, 1340], [800, 1080], [1200, 850]] },
    { w: 34, pts: [[1860, 520], [1720, 680], [1600, 830]] },
  ];
  LEVELS.push({
    id: 0, key: 'park', name: 'Puddlewick Park', theme: 'park', music: 'park', seed: 1001, W: 2400, H: 1600,
    particles: 'leaves', ownerNear: true,
    memo: 'Welcome to Finders & Co., the finest (and only) lost property office in Puddlewick!\n\nYour first shift is at the park. Five folks have lost something precious. Find each item, then find its owner and hand it back.\n\nKeep an eye out for our office cats, too. They wander off constantly.',
    ground(c, reg) {
      fillReg(c, reg, '#a9d07f');
      grassTexture(c, reg, '#a9d07f', 11);
      blob(c, { x: 1880, y: 470, rx: 190, ry: 95 }, '#ead8a6', INK, 3, 1.4);
      blob(c, { x: 1200, y: 840, rx: 200, ry: 110 }, '#e3d2a5', INK, 4, 1.4);
      drawPaths(c, paths, '#e6d3a3');
      blob(c, { x: 1200, y: 840, rx: 186, ry: 100 }, '#e3d2a5', false, 4);
      eachCell(reg, 50, 5, (i, j, r) => { // path pebbles
        const x = i * 50 + r() * 50, y = j * 50 + r() * 50;
        if (nearPath(paths, x, y, -8)) D.dot(c, x, y, 1.2, '#cdb886');
      });
      blob(c, { x: pond.x, y: pond.y, rx: pond.rx + 14, ry: pond.ry + 12 }, '#d8c79a', INK, 21, 1.4);
      blob(c, pond, '#86c3d8', INK, 22, 1.8);
      blob(c, { x: pond.x + 20, y: pond.y + 10, rx: pond.rx * 0.7, ry: pond.ry * 0.6 }, '#98cfe0', false, 23);
      eachCell(reg, 60, 6, (i, j, r) => {
        const x = i * 60 + r() * 60, y = j * 60 + r() * 60;
        if (inEll(x, y, pond, -30)) { D.curve(c, [[x - 8, y], [x, y - 2], [x + 8, y]], null, { lw: 1, stroke: 'rgba(255,255,255,0.6)' }); }
      });
    },
    isLand: (x, y) => !inEll(x, y, pond, 16),
    isWater: (x, y) => inEll(x, y, pond, -28),
    onPath: (x, y, m) => nearPath(paths, x, y, m) || inEll(x, y, { x: 1200, y: 840, rx: 200, ry: 110 }, m),
    fixed(add) {
      add({ type: 'fountain', x: 1200, y: 870 }, 'fountain');
      add({ type: 'bandstand', x: 560, y: 610, col: '#4f9a5a' }, 'bandstand');
      add({ type: 'tree', x: 380, y: 1340, s: 2.5, col: '#6f9f4c' }, 'oak');
      add({ type: 'slide', x: 1860, y: 500 }, 'playground');
      add({ type: 'statue', x: 860, y: 1240, label: 'SIR PUDDLE' });
      for (let x = 1690; x < 2060; x += 40) add({ type: 'fence', x, y: 395 });
      for (const [x, y] of [[1100, 780], [1300, 780], [1080, 930], [1320, 930]]) add({ type: 'bench', x, y, flip: x > 1200 });
    },
    landmarks: { pond: { x: pond.x, y: pond.y, rad: 320 } },
    clutter: [
      ['tree', 60, { where: 'offpath', s: [0.9, 1.25], col: PAL.leaf, fruitChance: 0.2 }],
      ['pine', 10, { where: 'offpath', s: [0.9, 1.2] }],
      ['bush', 90, { where: 'offpath', s: [0.8, 1.2], col: PAL.leaf, bloomChance: 0.4 }],
      ['flowers', 120, { where: 'offpath', s: [0.9, 1.3] }],
      ['rock', 20, { where: 'offpath', s: [0.7, 1.3] }],
      ['stump', 6, { where: 'offpath' }], ['mushroom', 12, { where: 'offpath' }],
      ['bench', 10, { where: 'land' }], ['lamp', 14, { where: 'land' }], ['bin', 6, { where: 'land' }],
      ['blanket', 6, { where: 'offpath', col: ['#e05a4f', '#4a78c9', '#f4d35e', '#8e62b8'] }],
      ['bike', 4, { where: 'land', col: ['#4a78c9', '#d9483b', '#4f9a5a'] }],
      ['reeds', 14, { where: 'shore' }],
      ['lily', 14, { where: 'water' }], ['duck', 12, { where: 'water' }],
      ['dog', 8, { where: 'land', col: ['#c98b3a', '#f5f2ea', '#3a3540', '#8a5a34'] }],
      ['pigeon', 30, { where: 'land' }],
      ['tuft', 480, { where: 'offpath', tiny: true }],
    ],
    crowd: 120, decoys: 12,
    cases: [
      {
        name: 'Grandma Mabel', look: Look({ skin: '#f8dcc4', hair: '#dcd8d0', hs: 'bun', shirt: '#9b6fc6', dress: true, acc: ['glasses'] }), voice: 360,
        item: 'scarf', col: 'pink', near: 'bandstand',
        clue: 'My pink scarf flew right off while I was dancing near the bandstand. Please don\'t tell anyone I was dancing.',
        thanks: 'Oh, bless you, dear! Toasty again.',
      },
      {
        name: 'Little Tommy', child: true, look: Look({ skin: '#bf8157', hair: '#2b2224', hs: 'short', hat: 'cap', hatc: '#d9483b', shirt: '#f4d35e', pants: '#4f6fa0' }), voice: 520,
        item: 'toycar', col: 'blue', near: 'playground',
        clue: 'My blue racecar went down the big slide REALLY fast and never came back!!',
        thanks: 'VROOOOM! You\'re the best!',
      },
      {
        name: 'Mr. Pemberton', look: Look({ skin: '#efc3a0', hair: '#6b6f78', hs: 'short', hat: 'tophat', hatc: '#3a3540', shirt: '#4a4f5c', pants: '#2f3036', acc: ['mustache'] }), voice: 200,
        item: 'watch', col: 'gold', near: 'fountain',
        clue: 'I set my gold pocket watch down by the fountain to wash my hands. Now I haven\'t the foggiest what time it is.',
        thanks: 'Splendid! And only four minutes late for tea.',
      },
      {
        name: 'Priya', look: Look({ skin: '#96603d', hair: '#2b2224', hs: 'long', shirt: '#4fa3a5', pants: '#5a4632', acc: ['bag'], bagc: '#d9483b' }), voice: 400,
        item: 'book', col: 'green', near: 'oak',
        clue: 'I dozed off reading under the big old oak tree and my green book wandered off. Books don\'t have legs... right?',
        thanks: 'Chapter twelve, here I come. Thank you!',
      },
      {
        name: 'Coach Dan', look: Look({ skin: '#dca27a', hair: '#8b5a2b', hs: 'short', hat: 'cap', hatc: '#4f9a5a', shirt: '#f0a04b', pants: '#3d4a6b', acc: ['beard'] }), voice: 240,
        item: 'key', col: 'silver', near: 'pond',
        clue: 'Dropped my silver keys while feeding the ducks at the pond. One of them looked VERY guilty.',
        thanks: 'Keys! Knew those ducks were innocent. Mostly.',
      },
    ],
  });
})();

// ------------------------- 2. MARKET ----------------------------
(() => {
  const walls = ['#f0dcc0', '#e8c9b0', '#d9e4d0', '#f2e6b8', '#e4d4ec', '#cfe0ea', '#f3d1c4'];
  const roofs = ['#c9563f', '#4a78c9', '#6b7f9e', '#8a5a34', '#3f8f5a', '#b3303a'];
  LEVELS.push({
    id: 1, key: 'market', name: 'Market Street', theme: 'market', music: 'market', seed: 2002, W: 2400, H: 1600,
    particles: 'petals',
    memo: 'Saturday market day! Stalls, crowds, and at least one very confused pigeon.\n\nSeven shoppers are missing their bits and bobs. The market is busy, so compare every face against the case files.',
    ground(c, reg) {
      fillReg(c, reg, '#d9cfba');
      const cw = 24, chh = 14;
      const j0 = Math.floor(reg.y0 / chh) - 1, j1 = Math.floor(reg.y1 / chh) + 1;
      for (let j = j0; j <= j1; j++) {
        const off = (j % 2) * cw / 2;
        const i0 = Math.floor((reg.x0 - off) / cw) - 1, i1 = Math.floor((reg.x1 - off) / cw) + 1;
        for (let i = i0; i <= i1; i++) {
          const r = RNG(hash2(i, j, 31));
          const x = i * cw + off, y = j * chh;
          c.fillStyle = r.chance(0.5) ? '#d2c6ae' : '#ddd3bf';
          c.strokeStyle = '#b5a88e'; c.lineWidth = 1;
          c.beginPath(); c.rect(x + 1.5, y + 1.5, cw - 3, chh - 3); c.fill(); c.stroke();
        }
      }
      // sidewalk in front of buildings
      c.fillStyle = '#e9e1d0'; c.fillRect(-10, 380, 2420, 90);
      c.strokeStyle = '#c9bea8'; c.lineWidth = 1;
      for (let x = 0; x < 2400; x += 48) { c.beginPath(); c.moveTo(x, 380); c.lineTo(x, 470); c.stroke(); }
      D.line(c, -10, 470, 2410, 470, null, { lw: 2 });
      c.fillStyle = '#bcd9ea'; c.fillRect(-10, -10, 2420, 390);
      c.fillStyle = 'rgba(255,255,255,0.7)';
      for (const [x, y] of [[180, 90], [700, 60], [1500, 80], [2100, 50]]) { c.beginPath(); c.ellipse(x, y, 70, 18, 0, 0, TAU); c.ellipse(x + 40, y - 12, 40, 16, 0, 0, TAU); c.fill(); }
      // plaza circle at clock tower
      blob(c, { x: 1200, y: 560, rx: 230, ry: 90 }, '#e7dcc4', INK, 9, 1.4);
      blob(c, { x: 1200, y: 560, rx: 150, ry: 55 }, '#dccfb2', '#b5a88e', 10, 1);
    },
    isLand: (x, y) => y > 470,
    isWater: () => false,
    onPath: () => false,
    fixed(add, r) {
      const row = [[90, 150], [255, 150], [450, 190, 'cafe'], [640, 150], [805, 150], [970, 150], [1400, 160], [1570, 150], [1740, 150], [1925, 190, 'bakery'], [2110, 150], [2290, 150]];
      for (const b of row) {
        const o = { type: 'building', x: b[0], y: 440, bw: b[1] - 12, bh: r.int(110, 150), wall: r.pick(walls), roof: r.pick(roofs), shutters: r.chance(0.5) ? r.pick(['#4f9a5a', '#4a78c9', '#b3303a']) : null, chimney: r.chance(0.5) };
        if (b[2] === 'cafe') Object.assign(o, { awning: '#d9483b', sign: 'CAFE', bh: 120 });
        if (b[2] === 'bakery') Object.assign(o, { awning: '#f1c83b', sign: 'BAKERY', bh: 125, wall: '#f5e3c8' });
        if (!b[2] && r.chance(0.5)) o.awning = r.pick(['#4a78c9', '#4f9a5a', '#8e62b8', '#ee8a3a']);
        add(o, b[2]);
      }
      add({ type: 'clocktower', x: 1200, y: 480 }, 'clocktower');
      for (const [x, y] of [[360, 540], [470, 580], [580, 530], [400, 640], [540, 660]]) add({ type: 'table', x, y, col: r.pick(['#e05a4f', '#4a78c9', '#f1c83b']), cup: r.chance(0.5) });
      add({ type: 'stall', x: 820, y: 920, goods: 'fruit', awning: '#e05a4f', sign: 'FRUIT' }, 'fruit stalls');
      add({ type: 'stall', x: 990, y: 940, goods: 'bread', awning: '#f0a04b' });
      add({ type: 'stall', x: 1160, y: 920, goods: 'fruit', awning: '#4f9a5a' });
      add({ type: 'stall', x: 1500, y: 960, goods: 'toys', awning: '#4a78c9', sign: 'TOYS' });
      add({ type: 'stall', x: 430, y: 1200, goods: 'fish', awning: '#4a78c9', sign: 'FISH' }, 'fish stall');
      add({ type: 'stall', x: 1750, y: 1400, goods: 'flowers', awning: '#ec8fb5' });
      add({ type: 'stall', x: 700, y: 1480, goods: 'food', awning: '#8e62b8' });
      add({ type: 'flowercart', x: 1930, y: 1120 }, 'flower cart');
      add({ type: 'busstop', x: 1270, y: 1470 }, 'bus stop');
      for (let x = 120; x < 2400; x += 270) if (Math.abs(x - 1200) > 120) add({ type: 'lamp', x, y: 490 });
    },
    landmarks: {},
    clutter: [
      ['planter', 12, { where: 'land', s: [0.9, 1.1] }],
      ['crate', 50, { where: 'land', s: [0.9, 1.2], goodsChance: 0.5, goods: ['#d9483b', '#f1c83b', '#8cc56a', '#ee8a3a'] }],
      ['barrel', 18, { where: 'land' }],
      ['flowerpot', 40, { where: 'land' }],
      ['lamp', 8, { where: 'land' }], ['bench', 8, { where: 'land' }],
      ['bike', 7, { where: 'land', col: ['#4a78c9', '#d9483b', '#4f9a5a', '#f1c83b'], basketChance: 0.5 }],
      ['bin', 8, { where: 'land' }], ['mailbox', 3, { where: 'land' }], ['hydrant', 4, { where: 'land' }],
      ['dog', 6, { where: 'land', col: ['#c98b3a', '#f5f2ea', '#3a3540', '#8a5a34'] }],
      ['pigeon', 40, { where: 'land' }],
    ],
    crowd: 160, decoys: 16,
    cases: [
      {
        name: 'Chef Gaston', look: Look({ skin: '#f8dcc4', hair: '#2b2224', hat: 'chef', shirt: '#f2efe6', pants: '#2f3036', acc: ['mustache'] }), voice: 230,
        item: 'book', col: 'red', near: 'bakery',
        clue: 'Sacré bleu! My red recipe book! I had it outside the bakery. Without it, my croissants are merely... bread.',
        thanks: 'Magnifique! Free croissants for life. Well, for a week.',
      },
      {
        name: 'Rosa the Florist', look: Look({ skin: '#dca27a', hair: '#5a3a22', hs: 'long', hat: 'sunhat', hatc: '#f1c83b', shirt: '#e58fb4', dress: true }), voice: 420,
        item: 'glasses', col: 'purple', near: 'flower cart',
        clue: 'My purple reading glasses are hiding somewhere near my flower cart. I\'d look myself, but... well. Glasses.',
        thanks: 'Oh! Everything is so SHARP now. Thank you, sweetheart.',
      },
      {
        name: 'Mr. Okafor', look: Look({ skin: '#6a4229', hair: '#2b2224', hs: 'short', hat: 'beret', hatc: '#4a78c9', shirt: '#3f8f5a', pants: '#7c8a9e', acc: ['glasses'] }), voice: 210,
        item: 'umbrella', col: 'black', near: 'bus stop',
        clue: 'It\'s going to rain any minute, and my black umbrella has vanished from the bus stop. Typical.',
        thanks: 'Now it can rain all it likes. Cheers!',
      },
      {
        name: 'Lily', child: true, look: Look({ skin: '#f8dcc4', hair: '#b33a2a', hs: 'pigtails', shirt: '#e58fb4', dress: true }), voice: 560,
        item: 'balloon', col: 'red', near: 'fruit stalls',
        clue: 'I let go of my red balloon by the fruit stalls! It got stuck somewhere low. Balloons are silly.',
        thanks: 'I\'m going to tie it to my WRIST this time!',
      },
      {
        name: 'Mayor Higgins', look: Look({ skin: '#efc3a0', hair: '#dcd8d0', hs: 'bald', hat: 'bowler', hatc: '#8a5a34', shirt: '#9b6fc6', pants: '#2f3036', acc: ['glasses', 'mustache'] }), voice: 180,
        item: 'key', col: 'gold', near: 'clocktower',
        clue: 'The golden key to the clock tower! If I don\'t wind that clock by noon, the whole town will be late for everything.',
        thanks: 'Puddlewick thanks you. I may name a bench after you.',
      },
      {
        name: 'Wendy', look: Look({ skin: '#bf8157', hair: '#ead27f', hs: 'ponytail', hat: 'beanie', hatc: '#3aa3a0', shirt: '#f4d35e', pants: '#4f6fa0', acc: ['bag'] }), voice: 450,
        item: 'phone', col: 'teal', near: 'cafe',
        clue: 'I left my phone somewhere around the café tables. It\'s teal. Like my hat! I matched them on purpose.',
        thanks: 'Forty-two messages?! Thanks a million!',
      },
      {
        name: 'Fisherman Mo', look: Look({ skin: '#dca27a', hair: '#dcd8d0', hs: 'short', hat: 'cap', hatc: '#3a3540', shirt: '#7fc3e8', pants: '#5a4632', acc: ['beard'], beardc: '#dcd8d0' }), voice: 170,
        item: 'mug', col: 'white', near: 'fish stall',
        clue: 'My lucky white mug went missing near my fish stall. Forty years I\'ve drunk tea from that mug.',
        thanks: 'Ahh. Tea tastes right again. Much obliged.',
      },
    ],
  });
})();

// ------------------------- 3. BEACH -----------------------------
(() => {
  const shore = (x) => 430 + 26 * Math.sin(x / 170) + 14 * Math.sin(x / 67 + 1);
  LEVELS.push({
    id: 2, key: 'beach', name: 'Sunnyside Beach', theme: 'beach', music: 'beach', seed: 3003, W: 2400, H: 1600,
    particles: 'sparkle',
    memo: 'Sun, sand and an astonishing amount of misplaced stuff.\n\nSeven beachgoers need your help. Things get buried, borrowed by crabs and blown about, so search carefully!',
    ground(c, reg) {
      fillReg(c, reg, '#f2dfae');
      // sea
      c.beginPath(); c.moveTo(-20, -20);
      for (let x = -20; x <= 2420; x += 20) c.lineTo(x, shore(x));
      c.lineTo(2420, -20); c.closePath();
      c.fillStyle = '#6fbfdc'; c.fill();
      const g = c.createLinearGradient(0, 0, 0, 440); g.addColorStop(0, 'rgba(40,110,170,0.45)'); g.addColorStop(1, 'rgba(40,110,170,0)');
      c.fillStyle = g; c.fill();
      // wet sand + foam
      c.beginPath(); for (let x = -20; x <= 2420; x += 20) c.lineTo(x, shore(x) + 22); c.lineWidth = 36; c.strokeStyle = '#e4c98f'; c.stroke();
      c.beginPath(); for (let x = -20; x <= 2420; x += 20) c.lineTo(x, shore(x)); c.lineWidth = 9; c.strokeStyle = INK; c.stroke();
      c.beginPath(); for (let x = -20; x <= 2420; x += 20) c.lineTo(x, shore(x)); c.lineWidth = 6; c.strokeStyle = '#f6fbff'; c.stroke();
      eachCell(reg, 55, 41, (i, j, r) => {
        const x = i * 55 + r() * 55, y = j * 55 + r() * 55;
        if (y < shore(x) - 20) D.curve(c, [[x - 9, y + 2], [x - 3, y - 2], [x + 3, y + 2], [x + 9, y - 1]], null, { lw: 1.2, stroke: 'rgba(255,255,255,0.55)' });
        else if (y > shore(x) + 10) { D.dot(c, x, y, 1, '#d7bf8a'); D.dot(c, x + r.range(-15, 15), y + r.range(-15, 15), 0.8, '#fff5d8'); }
      });
      // dunes
      c.fillStyle = '#ead29a';
      c.beginPath(); c.moveTo(-20, 1620);
      for (let x = -20; x <= 2420; x += 40) c.lineTo(x, 1480 + 30 * Math.sin(x / 120));
      c.lineTo(2420, 1620); c.fill();
    },
    isLand: (x, y) => y > shore(x) + 18,
    isWater: (x, y) => y < shore(x) - 26 && y > 40,
    onPath: () => false,
    fixed(add) {
      add({ type: 'lighthouse', x: 230, y: 600 }, 'lighthouse');
      add({ type: 'pier', x: 1500, y: shore(1500) + 36 }, 'pier');
      add({ type: 'lifeguard', x: 1000, y: 740 }, 'lifeguard tower');
      add({ type: 'icecream', x: 1790, y: 930 }, 'ice cream cart');
      add({ type: 'sandcastle', x: 620, y: 1070 }, 'sandcastle');
      add({ type: 'rockpool', x: 2180, y: 760 }, 'rock pool');
      const hutCols = ['#e05a4f', '#4a78c9', '#f1c83b', '#4f9a5a', '#ec8fb5', '#8e62b8', '#3aa3a0', '#ee8a3a', '#5b7fd6', '#e05a4f'];
      for (let i = 0; i < 10; i++) add({ type: 'building', x: 1180 + i * 115, y: 1590, bw: 84, bh: 88, wall: '#fbfbf7', stripes: hutCols[i], roof: hutCols[(i + 3) % hutCols.length], roofH: 30 });
    },
    landmarks: { 'beach huts': { x: 1700, y: 1500, rad: 380 } },
    clutter: [
      ['palm', 11, { where: 'land', s: [0.9, 1.2] }],
      ['parasol', 42, { where: 'land', col: ['#e05a4f', '#4a78c9', '#f1c83b', '#4f9a5a', '#ec8fb5', '#8e62b8'] }],
      ['towel', 60, { where: 'land', col: ['#e05a4f', '#4a78c9', '#f1c83b', '#4f9a5a', '#ec8fb5', '#8e62b8', '#3aa3a0'] }],
      ['bucket', 20, { where: 'land', col: ['#e05a4f', '#4a78c9', '#f1c83b', '#4f9a5a'] }],
      ['minicastle', 10, { where: 'land' }],
      ['shell', 70, { where: 'land', col: ['#f7d6c4', '#f5f2ea', '#f0c0a0', '#e8d0f0'] }],
      ['starfish', 20, { where: 'land', col: ['#f0a04b', '#e05a4f', '#ec8fb5'] }],
      ['crab', 12, { where: 'land' }],
      ['rock', 18, { where: 'land', s: [0.8, 1.4] }],
      ['lifebuoy', 4, { where: 'land' }],
      ['crate', 8, { where: 'land', col: ['#7fc3e8', '#f5f2ea', '#e05a4f'] }],
      ['dunegrass', 60, { where: 'dunes' }],
      ['boat', 8, { where: 'water', col: ['#e05a4f', '#4a78c9', '#f1c83b', '#f5f2ea'], sailChance: 0.5 }],
      ['swimmer', 18, { where: 'water', col: ['#f1c83b', '#e05a4f', '#ec8fb5', '#4f9a5a'] }],
      ['gull', 26, { where: 'land' }],
      ['dog', 5, { where: 'land', col: ['#c98b3a', '#f5f2ea', '#3a3540'] }],
    ],
    crowd: 130, decoys: 16,
    cases: [
      {
        name: 'Captain Barnacle', look: Look({ skin: '#efc3a0', hair: '#dcd8d0', hs: 'short', hat: 'captain', shirt: '#3d4a6b', pants: '#f2efe6', acc: ['beard'], beardc: '#dcd8d0' }), voice: 160,
        item: 'compass', col: 'gold', near: 'pier',
        clue: 'Arr, me golden compass! Dropped it comin\' off the pier. Can\'t find north without it. Or south. Or me boat.',
        thanks: 'Ye\'ve a sharp eye, matey! North be... that way!',
      },
      {
        name: 'Sunny', child: true, look: Look({ skin: '#dca27a', hair: '#ead27f', hs: 'short', hat: 'sunhat', hatc: '#ec8fb5', shirt: '#f0a04b', stripes: true, pants: '#4f6fa0' }), voice: 580,
        item: 'duck', col: 'yellow', near: 'sandcastle',
        clue: 'Mr. Quackers was guarding the big sandcastle and now he\'s gone! He\'s yellow and he squeaks.',
        thanks: 'MR. QUACKERS! *squeak squeak*',
      },
      {
        name: 'Lifeguard Lola', look: Look({ skin: '#96603d', hair: '#2b2224', hs: 'ponytail', shirt: '#e05a4f', pants: '#a3825a', acc: ['shades'] }), voice: 380,
        item: 'headphones', col: 'teal', near: 'lifeguard tower',
        clue: 'My teal headphones fell off the lifeguard tower. Don\'t worry, I only listen to them on my break!',
        thanks: 'Break time just got a soundtrack. Thanks!',
      },
      {
        name: 'Grandpa Joe', look: Look({ skin: '#f8dcc4', hair: '#dcd8d0', hs: 'bald', hat: 'sunhat', hatc: '#ead27f', shirt: '#4fa3a5', stripes: true, pants: '#a3825a', acc: ['glasses'] }), voice: 190,
        item: 'book', col: 'orange', near: 'beach huts',
        clue: 'My orange crossword book is somewhere around the beach huts. Seven letters, "misplaced"... L-O-S-T-...',
        thanks: 'Found! That\'s five letters, but I\'ll allow it.',
      },
      {
        name: 'Mia', look: Look({ skin: '#efc3a0', hair: '#ec8fb5', hs: 'long', shirt: '#9b6fc6', dress: true, acc: ['shades'] }), voice: 470,
        item: 'phone', col: 'pink', near: 'ice cream cart',
        clue: 'I put my pink phone down to eat my ice cream near the cart, and then the ice cream won my full attention.',
        thanks: 'Yay! Selfie with my rescuer?',
      },
      {
        name: 'Kai', look: Look({ skin: '#bf8157', hair: '#2b2224', hs: 'spiky', shirt: '#8cc56a', pants: '#4f6fa0' }), voice: 330,
        item: 'kite', col: 'orange', near: 'lighthouse',
        clue: 'A gust took my orange kite toward the lighthouse. It crash-landed somewhere down there.',
        thanks: 'Wind, you are on notice. Thanks!',
      },
      {
        name: 'Mrs. Fitzgerald', look: Look({ skin: '#f8dcc4', hair: '#c98b3a', hs: 'bun', hat: 'sunhat', hatc: '#ec8fb5', shirt: '#f2efe6', dress: true, acc: ['bag'], bagc: '#ec8fb5' }), voice: 400,
        item: 'ring', col: 'gold', near: 'rock pool',
        clue: 'My wedding ring slipped off while I was peering into the rock pool! It\'s gold, with a little diamond. Please, please find it.',
        thanks: 'Oh, you wonderful person. Forty years we\'ve been married!',
      },
    ],
  });
})();

// ------------------------- 4. WINTER ----------------------------
(() => {
  const lake = { x: 1480, y: 980, rx: 330, ry: 170 };
  const hill = { x: 2100, y: 1300, rx: 260, ry: 150 };
  const paths = [
    { w: 50, pts: [[-40, 760], [500, 740], [1000, 720], [1300, 700], [1800, 690], [2440, 720]] },
    { w: 40, pts: [[700, 1640], [720, 1300], [700, 1090], [800, 900], [1000, 720]] },
    { w: 36, pts: [[420, 520], [520, 640], [700, 740]] },
  ];
  LEVELS.push({
    id: 3, key: 'winter', name: 'Frostmere Village', theme: 'winter', music: 'winter', seed: 4004, W: 2400, H: 1600,
    particles: 'snow',
    memo: 'Brrr! The winter festival in Frostmere is in full swing, and mittens are going missing faster than cocoa.\n\nEight villagers need you. Everyone is bundled up in hats and scarves, so check those faces closely.',
    ground(c, reg) {
      fillReg(c, reg, '#f1f5fb');
      eachCell(reg, 80, 51, (i, j, r) => {
        c.fillStyle = r.chance(0.5) ? 'rgba(170,190,225,0.18)' : 'rgba(255,255,255,0.8)';
        c.beginPath(); c.ellipse(i * 80 + r() * 80, j * 80 + r() * 80, r.range(18, 40), r.range(6, 14), 0, 0, TAU); c.fill();
        D.dot(c, i * 80 + r() * 80, j * 80 + r() * 80, 1, '#c7d3ea');
      });
      drawPaths(c, paths, '#dde3ee');
      eachCell(reg, 40, 52, (i, j, r) => { // footprints
        const x = i * 40 + r() * 40, y = j * 40 + r() * 40;
        if (nearPath(paths, x, y, -10)) { D.ellipse(c, x, y, 2, 1.2, '#c4cde0', null, { stroke: false }); D.ellipse(c, x + 5, y + 3, 2, 1.2, '#c4cde0', null, { stroke: false }); }
      });
      // sled hill
      blob(c, hill, '#fbfdff', '#9fb0cc', 61, 1.6);
      blob(c, { x: hill.x + 40, y: hill.y + 40, rx: hill.rx * 0.8, ry: hill.ry * 0.5 }, 'rgba(160,180,220,0.25)', false, 62);
      c.strokeStyle = '#c4cde0'; c.lineWidth = 2;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(hill.x - 120 + k * 50, hill.y - 110); c.quadraticCurveTo(hill.x - 90 + k * 60, hill.y, hill.x - 160 + k * 70, hill.y + 130); c.stroke(); }
      // frozen lake
      blob(c, { x: lake.x, y: lake.y, rx: lake.rx + 12, ry: lake.ry + 10 }, '#e6edf7', INK, 71, 1.4);
      blob(c, lake, '#c9e3f2', INK, 72, 1.8);
      blob(c, { x: lake.x - 60, y: lake.y - 30, rx: lake.rx * 0.5, ry: lake.ry * 0.35 }, 'rgba(255,255,255,0.45)', false, 73);
      const rr = RNG(74);
      c.strokeStyle = 'rgba(110,150,190,0.55)'; c.lineWidth = 1;
      for (let k = 0; k < 14; k++) {
        let x = lake.x + rr.range(-250, 250), y = lake.y + rr.range(-110, 110);
        c.beginPath(); c.moveTo(x, y);
        for (let s = 0; s < 4; s++) { x += rr.range(-25, 25); y += rr.range(-12, 12); if (inEll(x, y, lake, -10)) c.lineTo(x, y); }
        c.stroke();
      }
      for (let k = 0; k < 8; k++) { // skate marks
        const a = rr() * TAU; c.beginPath(); c.ellipse(lake.x + rr.range(-120, 120), lake.y + rr.range(-50, 50), rr.range(40, 110), rr.range(15, 40), a * 0.1, 0, rr.range(2, 5));
        c.strokeStyle = 'rgba(255,255,255,0.8)'; c.stroke();
      }
    },
    isLand: (x, y) => !inEll(x, y, lake, 14),
    isWater: (x, y) => inEll(x, y, lake, -30),
    onPath: (x, y, m) => nearPath(paths, x, y, m) || inEll(x, y, hill, m - 40),
    fixed(add, r) {
      add({ type: 'building', x: 420, y: 480, bw: 170, bh: 150, wall: '#ece6da', roof: '#6b7f9e', snow: true, steeple: true, lit: true, roofH: 60 }, 'chapel');
      add({ type: 'xmastree', x: 1100, y: 620 }, 'christmas tree');
      add({ type: 'snowman', x: 1900, y: 520, s: 3, hat: 'tophat', scarf: '#d9483b' }, 'giant snowman');
      add({ type: 'cocoa', x: 700, y: 1060 }, 'cocoa stand');
      for (const [x, bw] of [[160, 150], [380, 140], [600, 150], [830, 150]]) add({ type: 'building', x, y: 1580, bw, bh: 90, wall: '#a0663e', logs: true, roof: '#7a4f33', snow: true, chimney: true, lit: true });
      for (const [x, bw] of [[760, 150], [1420, 160], [1600, 150], [2220, 170], [2040, 140]]) add({ type: 'building', x, y: 260, bw, bh: r.int(100, 130), wall: r.pick(['#ece6da', '#e4d4c4', '#d8e2ee', '#f0e2c8']), roof: r.pick(['#6b7f9e', '#b3303a', '#3f8f5a', '#7a4f33']), snow: true, chimney: true, lit: true });
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; add({ type: 'gift', x: 1100 + Math.cos(a) * 95, y: 640 + Math.sin(a) * 26, col: r.pick(['#d9483b', '#4a78c9', '#4f9a5a', '#8e62b8', '#f1c83b']), rib: r.pick(['#f1c83b', '#fbfbf7', '#d9483b']) }); }
    },
    landmarks: { 'frozen lake': { x: lake.x, y: lake.y, rad: 350 }, 'sled hill': { x: hill.x, y: hill.y, rad: 200 }, 'cabins': { x: 500, y: 1500, rad: 320 } },
    clutter: [
      ['pine', 95, { where: 'offpath', s: [0.9, 1.35], snow: true, col: ['#4f8a55', '#3f7a4a', '#5a9460'] }],
      ['bush', 20, { where: 'offpath', snow: true, col: ['#5a8a55', '#6a9460'] }],
      ['snowman', 12, { where: 'land', hat: ['#d9483b', '#4a78c9', '#3a3540', '#4f9a5a'], scarf: ['#d9483b', '#f1c83b', '#4a78c9', '#8e62b8'] }],
      ['sled', 12, { where: 'land', col: ['#d9483b', '#4a78c9', '#4f9a5a', '#a0663e'] }],
      ['bench', 8, { where: 'land', snow: true }], ['lamp', 16, { where: 'land' }],
      ['woodpile', 8, { where: 'offpath', snow: true }],
      ['rock', 14, { where: 'offpath', snow: true, col: ['#9aa1a8'] }],
      ['snowpile', 70, { where: 'offpath', tiny: true }],
      ['gift', 10, { where: 'land', col: ['#d9483b', '#4a78c9', '#4f9a5a', '#8e62b8'] }],
      ['dog', 6, { where: 'land', col: ['#c98b3a', '#f5f2ea', '#3a3540', '#8a5a34'] }],
      ['robin', 16, { where: 'land' }],
    ],
    crowd: 135, crowdOnIce: 22, decoys: 18,
    cases: [
      {
        name: 'Old Nils', look: Look({ skin: '#efc3a0', hair: '#dcd8d0', hs: 'short', hat: 'beanie', hatc: '#d9483b', shirt: '#3f8f5a', pants: '#5a4632', acc: ['beard'], beardc: '#dcd8d0' }), voice: 170,
        item: 'mitten', col: 'red', near: 'cocoa stand',
        clue: 'Took off my red mitten to hold my cocoa at the stand, and now my left hand is an icicle.',
        thanks: 'Ahh, sweet warmth. Have a marshmallow.',
      },
      {
        name: 'Freya', child: true, look: Look({ skin: '#f8dcc4', hair: '#ead27f', hs: 'pigtails', hat: 'earmuffs', hatc: '#ec8fb5', shirt: '#5b7fd6', pants: '#7c8a9e' }), voice: 560,
        item: 'skate', col: 'white', near: 'frozen lake',
        clue: 'I only have ONE white ice skate! The other one is somewhere by the frozen lake. I can\'t skate in circles forever!',
        thanks: 'Two skates! Watch me do a spin!',
      },
      {
        name: 'Pastor Bram', look: Look({ skin: '#96603d', hair: '#2b2224', hs: 'bald', shirt: '#4a4f5c', pants: '#2f3036', acc: ['glasses'] }), voice: 200,
        item: 'book', col: 'purple', near: 'chapel',
        clue: 'My purple hymn book has wandered from the chapel. I suspect the choir. They\'ve been humming suspiciously.',
        thanks: 'Hallelujah! Carols are back on.',
      },
      {
        name: 'Olga', look: Look({ skin: '#efc3a0', hair: '#8b5a2b', hs: 'bun', hat: 'beret', hatc: '#8e62b8', shirt: '#c4d86a', dress: true, acc: ['scarf'], scarfc: '#f1c83b' }), voice: 390,
        item: 'snowglobe', col: 'blue', near: 'christmas tree',
        clue: 'I brought my blue snow globe to show the big Christmas tree its tiny cousin. Now it\'s lost among the presents!',
        thanks: 'Look, they\'re reunited! Thank you!',
      },
      {
        name: 'Sven', look: Look({ skin: '#f8dcc4', hair: '#ead27f', hs: 'short', hat: 'beanie', hatc: '#f1c83b', shirt: '#4fa3a5', pants: '#3d4a6b', acc: ['scarf'], scarfc: '#4a78c9' }), voice: 260,
        item: 'camera', col: 'black', near: 'giant snowman',
        clue: 'I was taking photos of the giant snowman and set my black camera down. The snowman saw everything, but he won\'t talk.',
        thanks: 'Say "cheese"! ...Snowman, you too.',
      },
      {
        name: 'Ada', child: true, look: Look({ skin: '#6a4229', hair: '#2b2224', hs: 'afro', shirt: '#f0a04b', pants: '#6b3f4f', acc: ['scarf'], scarfc: '#4f9a5a' }), voice: 540,
        item: 'teddy', col: 'brown', near: 'sled hill',
        clue: 'Barnaby fell off my sled on the big sled hill! He\'s brown and fuzzy and probably very cold.',
        thanks: 'Barnaby! Let\'s get you some cocoa.',
      },
      {
        name: 'Mr. Frost', look: Look({ skin: '#efc3a0', hair: '#6b6f78', hs: 'short', hat: 'bowler', hatc: '#3a3540', shirt: '#f2efe6', pants: '#2f3036', acc: ['mustache'] }), voice: 190,
        item: 'key', col: 'silver', near: 'cabins',
        clue: 'Locked myself out of my log cabin. The silver key must have dropped in the snow by the cabins.',
        thanks: 'Home, sweet warm home. Thank you!',
      },
      {
        name: 'Gerda', look: Look({ skin: '#dca27a', hair: '#dcd8d0', hs: 'long', shirt: '#e58fb4', dress: true, acc: ['glasses', 'scarf'], scarfc: '#d9483b' }), voice: 330,
        item: 'letter', col: 'red', near: 'frozen lake',
        clue: 'I was writing a letter to my sister by the frozen lake, in a red envelope, and the wind stole it!',
        thanks: 'Now it can go to her instead of the ducks. Thank you!',
      },
    ],
  });
})();

// ------------------------- 5. CARNIVAL --------------------------
(() => {
  const paths = [
    { w: 70, pts: [[-40, 1320], [400, 1300], [800, 1260], [1250, 1250], [1700, 1260], [2440, 1300]] },
    { w: 60, pts: [[700, 700], [900, 900], [1250, 1250]] },
    { w: 60, pts: [[1850, 700], [1600, 900], [1250, 1250]] },
    { w: 50, pts: [[1250, 300], [1250, 700], [1250, 1250]] },
  ];
  LEVELS.push({
    id: 4, key: 'carnival', name: 'Midnight Carnival', theme: 'carnival', music: 'carnival', seed: 5005, W: 2400, H: 1600,
    particles: 'fireflies', night: true,
    memo: 'The famous Midnight Carnival is in town! It\'s dark out, so we\'ve lent you the office lantern. Its light follows your pointer.\n\nEight cases. This is your final shift before your promotion to Senior Finder. Make it count!',
    ground(c, reg) {
      fillReg(c, reg, '#8fb070');
      grassTexture(c, reg, '#8fb070', 81);
      blob(c, { x: 1250, y: 1040, rx: 300, ry: 120 }, '#dcb98a', INK, 82, 1.4);
      drawPaths(c, paths, '#d5b27f');
      blob(c, { x: 700, y: 640, rx: 150, ry: 60 }, '#dcb98a', INK, 83, 1.2);
      eachCell(reg, 45, 84, (i, j, r) => {
        const x = i * 45 + r() * 45, y = j * 45 + r() * 45;
        if (nearPath(paths, x, y, -6)) { D.dot(c, x, y, 1.1, '#b8925e'); if (r.chance(0.3)) D.rect(c, x, y, 3, 2, r.pick(['#d9483b', '#f1c83b', '#4a78c9', '#4f9a5a']), null, { stroke: false }); }
      });
    },
    isLand: () => true,
    isWater: () => false,
    onPath: (x, y, m) => nearPath(paths, x, y, m),
    fixed(add) {
      add({ type: 'ferris', x: 1850, y: 660 }, 'ferris wheel');
      add({ type: 'carousel', x: 700, y: 660 }, 'carousel');
      add({ type: 'tent', x: 1250, y: 1090, s: 2.3, col: '#d9483b', col2: '#fbfbf7', sign: 'CIRCUS' }, 'big top');
      add({ type: 'booth', x: 300, y: 1360 }, 'ticket booth');
      add({ type: 'tent', x: 2080, y: 1330, s: 1.05, col: '#8e62b8', col2: '#2f2a5a', stars: true, flag: '#f1c83b', sign: 'ZORA' }, 'fortune teller');
      add({ type: 'stall', x: 820, y: 1520, goods: 'food', awning: '#d9483b', sign: 'POPCORN' });
      add({ type: 'stall', x: 1060, y: 1540, goods: 'cups', awning: '#4a78c9', sign: 'SODA' });
      add({ type: 'stall', x: 1450, y: 1540, goods: 'toys', awning: '#4f9a5a', sign: 'PRIZES' });
      add({ type: 'stall', x: 1690, y: 1520, goods: 'food', awning: '#f0a04b', sign: 'CANDY' });
      add({ type: 'booth', x: 1250, y: 330, sign: 'GAMES' });
    },
    landmarks: { 'food stalls': { x: 1250, y: 1470, rad: 380 } },
    clutter: [
      ['tree', 18, { where: 'offpath', edge: true, s: [0.9, 1.2], col: ['#5d8a48', '#4f7d40'] }],
      ['bush', 40, { where: 'offpath', col: ['#5d8a48', '#6a9a50'] }],
      ['lamp', 40, { where: 'land', col: ['#6b3f4f', '#3a3f4c'] }],
      ['balloonstand', 6, { where: 'offpath' }],
      ['crate', 30, { where: 'land' }], ['barrel', 14, { where: 'land', col: ['#d9483b', '#a0663e'] }],
      ['bench', 12, { where: 'land' }], ['bin', 10, { where: 'land' }],
      ['flowers', 50, { where: 'offpath' }],
      ['dog', 4, { where: 'land', col: ['#c98b3a', '#f5f2ea', '#3a3540'] }],
      ['tuft', 260, { where: 'offpath', tiny: true, col: '#6f8f55' }],
    ],
    crowd: 155, decoys: 18,
    cases: [
      {
        name: 'Ringmaster Rollo', look: Look({ skin: '#efc3a0', hair: '#2b2224', hs: 'short', hat: 'tophat', hatc: '#d9483b', shirt: '#e05a4f', pants: '#2f3036', acc: ['mustache'] }), voice: 200,
        item: 'trumpet', col: 'gold', near: 'big top',
        clue: 'LADIES AND GENTLEMEN! ...My golden trumpet is lost somewhere around the big top, and the show cannot start without a fanfare!',
        thanks: 'TA-DAAAA! The show goes on!',
      },
      {
        name: 'Madame Zora', look: Look({ skin: '#96603d', hair: '#2b2224', hs: 'long', hat: 'bandana', hatc: '#8e62b8', shirt: '#4fa3a5', dress: true }), voice: 300,
        item: 'orb', col: 'purple', near: 'fortune teller',
        clue: 'I foresaw you would come. I did NOT foresee losing my purple crystal ball outside my own tent. Embarrassing.',
        thanks: 'I see... a promotion in your future!',
      },
      {
        name: 'Benny', child: true, look: Look({ skin: '#f8dcc4', hair: '#c98b3a', hs: 'spiky', hat: 'party', hatc: '#4a78c9', shirt: '#f4d35e', pants: '#3d4a6b' }), voice: 600,
        item: 'lollipop', col: 'pink', near: 'carousel',
        clue: 'I dropped my giant pink lollipop when I got on the carousel horse! It was the biggest one they had!!',
        thanks: 'Mmm! Only a *little* bit of grass on it!',
      },
      {
        name: 'Popcorn Pete', look: Look({ skin: '#dca27a', hair: '#5a3a22', hs: 'short', hat: 'cap', hatc: '#f5f2ea', shirt: '#e05a4f', stripes: true, pants: '#2f3036', acc: ['mustache'] }), voice: 250,
        item: 'wallet', col: 'brown', near: 'food stalls',
        clue: 'All my change is in my brown wallet, and I dropped it somewhere by the food stalls. Popcorn doesn\'t pay for itself!',
        thanks: 'Free popcorn for you, pal! Extra butter!',
      },
      {
        name: 'Juniper', look: Look({ skin: '#f8dcc4', hair: '#e0702a', hs: 'bun', shirt: '#3f8f5a', pants: '#a3825a', acc: ['glasses'] }), voice: 440,
        item: 'ticket', col: 'yellow', near: 'ticket booth',
        clue: 'I bought a golden VIP ticket at the ticket booth, and it fluttered right out of my hand. Yellow, with a star!',
        thanks: 'VIP! Very Important Juniper! Thank you!',
      },
      {
        name: 'Mr. Grimsby', look: Look({ skin: '#efc3a0', hair: '#6b6f78', hs: 'short', hat: 'bowler', hatc: '#6b6f78', shirt: '#9b6fc6', pants: '#2f3036', acc: ['beard'], beardc: '#6b6f78' }), voice: 150,
        item: 'umbrella', col: 'purple', near: 'ferris wheel',
        clue: 'I refused to ride the Ferris wheel, and while I was refusing, somebody moved my purple umbrella. Hmph.',
        thanks: 'Hmph. ...Thank you. Very kind.',
      },
      {
        name: 'Clara', look: Look({ skin: '#bf8157', hair: '#2b2224', hs: 'short', hat: 'beret', hatc: '#d9483b', shirt: '#4a4f5c', pants: '#6b3f4f' }), voice: 410,
        item: 'camera', col: 'red', near: 'ferris wheel',
        clue: 'I got the most amazing night photos of the Ferris wheel lights on my red camera... and then I lost it.',
        thanks: 'My photos! Here, you\'re in this one!',
      },
      {
        name: 'Bobo the Clown', look: Look({ skin: '#f8dcc4', hair: '#e05a4f', hs: 'afro', shirt: '#f4d35e', stripes: true, pants: '#4f6fa0', acc: ['nose'] }), voice: 480,
        item: 'ball', col: 'blue', near: 'big top',
        clue: 'I can juggle two balls, but I\'m famous for THREE. My blue one bounced away from the big top. HONK.',
        thanks: 'HONK HONK! Three again! Watch this!',
      },
    ],
  });
})();

const ENDING_TEXT = 'Every item returned. Every owner smiling. Every cat (hopefully) accounted for.\n\nThe folks of Puddlewick have voted you Senior Finder of the Year, and there\'s a brand new brass nameplate on your desk.\n\nThanks for playing Finders & Co.!';
