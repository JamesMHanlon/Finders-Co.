// ---------------------------------------------------------------
//  Lost items — each painter draws centred on (0,0), radius ~9
// ---------------------------------------------------------------
'use strict';

const COLORS = {
  red: '#d9483b', blue: '#4a78c9', green: '#4f9a5a', yellow: '#f1c83b', pink: '#ec8fb5',
  purple: '#8e62b8', orange: '#ee8a3a', teal: '#3aa3a0', brown: '#8a5a34', black: '#3a3540',
  white: '#f5f2ea', gold: '#e0b33a', silver: '#b9bec8',
};

const ITEM_NAMES = {
  umbrella: 'umbrella', teddy: 'teddy bear', key: 'keys', glasses: 'glasses', book: 'book',
  balloon: 'balloon', wallet: 'wallet', phone: 'phone', ring: 'ring', watch: 'pocket watch',
  scarf: 'scarf', kite: 'kite', camera: 'camera', toycar: 'toy car', duck: 'rubber duck',
  sock: 'sock', handbag: 'handbag', lollipop: 'lollipop', mitten: 'mitten', trumpet: 'trumpet',
  mug: 'mug', letter: 'letter', ball: 'ball', crown: 'toy crown', ticket: 'ticket',
  compass: 'compass', skate: 'ice skate', snowglobe: 'snow globe', headphones: 'headphones',
  orb: 'crystal ball',
};

const ITEMS = {
  umbrella(c, col, r) {
    c.save(); c.rotate(-0.7);
    D.line(c, 0, 3, 0, 8.5, r, { lw: 1.6 });
    D.curve(c, [[0, 8.5], [0, 10.5], [-2.8, 10.5], [-3, 8.5]], r, { lw: 1.6, stroke: '#6b4428' });
    D.poly(c, [[0, -9.5], [3.8, 2.5], [1.2, 4.2], [-1.2, 4.2], [-3.8, 2.5]], col, r, { smooth: false });
    D.line(c, 0, -8.5, 0.6, 3.5, r, { lw: 0.7 });
    D.line(c, 0, -8.5, -1.8, 3, r, { lw: 0.6 });
    D.rect(c, -1.4, 3.8, 2.8, 1.4, shade(col, -0.3), r, { lw: 0.7 });
    c.restore();
  },
  teddy(c, col, r) {
    const lt = shade(col, 0.35);
    D.ellipse(c, -3.6, -7, 2, 2, col, r); D.ellipse(c, 3.6, -7, 2, 2, col, r);
    D.ellipse(c, -4.6, 5.6, 2.3, 1.8, col, r); D.ellipse(c, 4.6, 5.6, 2.3, 1.8, col, r);
    D.ellipse(c, 0, 2.8, 5, 5.2, col, r);
    D.ellipse(c, 0, 3.5, 2.6, 2.8, lt, r, { stroke: false });
    D.ellipse(c, -5.3, 1.3, 1.7, 2.4, col, r); D.ellipse(c, 5.3, 1.3, 1.7, 2.4, col, r);
    D.ellipse(c, 0, -3.8, 4.6, 4.1, col, r);
    D.ellipse(c, 0, -2.6, 1.9, 1.4, lt, r, { lw: 0.6 });
    D.dot(c, -1.6, -4.8, 0.6); D.dot(c, 1.6, -4.8, 0.6); D.dot(c, 0, -3, 0.6);
  },
  key(c, col, r) {
    c.save(); c.rotate(0.35);
    c.beginPath(); c.arc(-4.5, 0, 3.3, 0, TAU); c.strokeStyle = INK; c.lineWidth = 3.3; c.stroke();
    c.beginPath(); c.arc(-4.5, 0, 3.3, 0, TAU); c.strokeStyle = col; c.lineWidth = 1.7; c.stroke();
    D.rect(c, -1.5, -1.1, 9.5, 2.2, col, r, { lw: 0.8 });
    D.rect(c, 4.5, 0.8, 1.6, 2.4, col, r, { lw: 0.7 });
    D.rect(c, 6.6, 0.8, 1.4, 1.7, col, r, { lw: 0.7 });
    c.restore();
    c.save(); c.rotate(-0.5);
    c.beginPath(); c.arc(-1, 3, 2.6, 0, TAU); c.strokeStyle = INK; c.lineWidth = 2.6; c.stroke();
    c.beginPath(); c.arc(-1, 3, 2.6, 0, TAU); c.strokeStyle = shade(col, -0.15); c.lineWidth = 1.2; c.stroke();
    D.rect(c, 1.2, 2.2, 7, 1.8, shade(col, -0.15), r, { lw: 0.7 });
    c.restore();
  },
  glasses(c, col, r) {
    const lens = col === COLORS.black ? '#3b3b48' : 'rgba(190,225,240,0.75)';
    D.line(c, -7.5, -1.5, -9, -4, r, { lw: 1.4, stroke: col });
    D.line(c, 7.5, -1.5, 9, -4, r, { lw: 1.4, stroke: col });
    D.ellipse(c, -4, 0, 3.6, 3.1, lens, r, { lw: 2.4 });
    D.ellipse(c, 4, 0, 3.6, 3.1, lens, r, { lw: 2.4 });
    D.ellipse(c, -4, 0, 3.6, 3.1, null, null, { lw: 1.2, stroke: col });
    D.ellipse(c, 4, 0, 3.6, 3.1, null, null, { lw: 1.2, stroke: col });
    D.curve(c, [[-0.8, -0.8], [0, -1.8], [0.8, -0.8]], r, { lw: 1.4 });
  },
  book(c, col, r) {
    c.save(); c.rotate(0.25);
    D.rect(c, -5.2, -6.5, 11.5, 13, '#f7f1df', r, { lw: 0.9 });
    D.rect(c, -6.2, -7.3, 11.5, 13.2, col, r);
    D.rect(c, -6.2, -7.3, 2.4, 13.2, shade(col, -0.3), r, { lw: 0.8 });
    D.rect(c, -1.8, -4.8, 5.5, 3, shade(col, 0.5), r, { lw: 0.6 });
    c.restore();
  },
  balloon(c, col, r) {
    D.curve(c, [[0, 3], [1.6, 5.5], [-1, 7.5], [0.8, 9.5]], r, { lw: 0.8 });
    D.poly(c, [[0, 2.4], [1.4, 4], [-1.4, 4]], col, r, { lw: 0.8 });
    D.ellipse(c, 0, -3.5, 5.5, 6.5, col, r);
    D.ellipse(c, -2, -6, 1.1, 2, 'rgba(255,255,255,0.7)', null, { stroke: false });
  },
  wallet(c, col, r) {
    c.save(); c.rotate(-0.15);
    D.rect(c, -7.5, -4.8, 15, 9.6, col, r);
    D.poly(c, [[-7.5, -4.8], [7.5, -4.8], [7.5, 0.5], [-7.5, 0.5]], shade(col, -0.15), r, { lw: 0.9 });
    D.dot(c, 5.2, -1.4, 1.1, '#e7c65c');
    D.line(c, -6, 3, 6, 3, null, { lw: 0.5, stroke: shade(col, 0.3) });
    c.restore();
  },
  phone(c, col, r) {
    c.save(); c.rotate(0.3);
    D.rect(c, -4.5, -8, 9, 16, col, r, { lw: 1.1 });
    D.rect(c, -3.3, -6.3, 6.6, 11, '#34405e', r, { lw: 0.6 });
    D.line(c, -2, -5, 1.5, -1.5, null, { lw: 0.8, stroke: 'rgba(255,255,255,0.45)' });
    D.dot(c, 0, 6.2, 0.8, shade(col, -0.4));
    c.restore();
  },
  ring(c, col, r) {
    c.beginPath(); c.ellipse(0, 2, 5, 4.2, 0, 0, TAU); c.strokeStyle = INK; c.lineWidth = 3.4; c.stroke();
    c.beginPath(); c.ellipse(0, 2, 5, 4.2, 0, 0, TAU); c.strokeStyle = col; c.lineWidth = 1.8; c.stroke();
    D.poly(c, [[-2.6, -2.2], [2.6, -2.2], [3.2, -3.8], [0, -6.8], [-3.2, -3.8]], '#a8e4f5', r, { lw: 0.9 });
    D.dot(c, -0.8, -4.2, 0.6, '#fff');
  },
  watch(c, col, r) {
    D.curve(c, [[3, -5], [7, -7], [9, -3], [8, 1]], r, { lw: 1.4, stroke: col });
    D.rect(c, -1.3, -8.4, 2.6, 2.2, col, r, { lw: 0.8 });
    D.ellipse(c, 0, 0, 6.3, 6.3, col, r, { lw: 1.2 });
    D.ellipse(c, 0, 0, 4.6, 4.6, '#fbf6e8', r, { lw: 0.7 });
    D.line(c, 0, 0, 0, -3.3, null, { lw: 0.8 });
    D.line(c, 0, 0, 2.3, 0.6, null, { lw: 0.8 });
  },
  scarf(c, col, r) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const x = -9 + i * 2.25; pts.push([x, -2.6 + Math.sin(i * 0.9) * 2]); }
    for (let i = 8; i >= 0; i--) { const x = -9 + i * 2.25; pts.push([x, 2.6 + Math.sin(i * 0.9) * 2]); }
    D.poly(c, pts, col, r, { smooth: true });
    for (let i = 1; i < 8; i += 2) {
      const x = -9 + i * 2.25;
      D.line(c, x, -2.4 + Math.sin(i * 0.9) * 2, x, 2.4 + Math.sin(i * 0.9) * 2, null, { lw: 1.4, stroke: shade(col, 0.45) });
    }
    for (let k = 0; k < 3; k++) {
      D.line(c, -9, -1.6 + k * 1.6, -11, -1.6 + k * 1.9, r, { lw: 0.7 });
      D.line(c, 9, -0.3 + k * 1.6, 11, -0.3 + k * 1.9, r, { lw: 0.7 });
    }
  },
  kite(c, col, r) {
    D.curve(c, [[0, 7], [3, 9], [0, 11], [4, 12]], r, { lw: 0.8 });
    D.poly(c, [[3, 9.6], [4.8, 8.6], [4.8, 10.6]], '#f1c83b', r, { lw: 0.5 });
    D.poly(c, [[0, -9.5], [6.5, -1.5], [0, 7], [-6.5, -1.5]], col, r);
    D.poly(c, [[0, -9.5], [6.5, -1.5], [0, -1.5]], shade(col, 0.35), r, { lw: 0.6 });
    D.poly(c, [[0, 7], [-6.5, -1.5], [0, -1.5]], shade(col, 0.35), r, { lw: 0.6 });
  },
  camera(c, col, r) {
    D.rect(c, -3.5, -7, 4.6, 2.6, shade(col, -0.2), r, { lw: 0.8 });
    D.rect(c, -7.5, -4.8, 15, 10, col, r);
    D.rect(c, -7.5, -2.5, 15, 3.5, shade(col, -0.25), null, { stroke: false });
    D.ellipse(c, 0.5, 0.2, 3.8, 3.8, '#9ba3ad', r);
    D.ellipse(c, 0.5, 0.2, 2.2, 2.2, '#2d3a56', r, { lw: 0.6 });
    D.dot(c, -0.2, -0.6, 0.6, '#fff');
    D.rect(c, 4.2, -3.8, 2, 1.4, '#fff8c8', null, { lw: 0.5 });
  },
  toycar(c, col, r) {
    D.poly(c, [[-9, 2], [-8.5, -2], [-4.5, -3], [-2.5, -6.5], [4, -6.5], [6, -3], [9, -2], [9, 2]], col, r);
    D.poly(c, [[-1.8, -5.5], [1, -5.5], [1, -3], [-3.2, -3]], '#bfe3f2', r, { lw: 0.6 });
    D.poly(c, [[2, -5.5], [3.6, -5.5], [5, -3], [2, -3]], '#bfe3f2', r, { lw: 0.6 });
    D.ellipse(c, -5, 2.6, 2.5, 2.5, '#333', r); D.ellipse(c, 5, 2.6, 2.5, 2.5, '#333', r);
    D.dot(c, -5, 2.6, 0.9, '#ccc'); D.dot(c, 5, 2.6, 0.9, '#ccc');
    D.dot(c, 8, -0.8, 0.8, '#fff6a8');
  },
  duck(c, col, r) {
    D.ellipse(c, 1.5, 2.5, 6.8, 4.4, col, r);
    D.curve(c, [[-0.5, 1.5], [2.5, 3.5], [5, 1.5]], r, { lw: 0.8 });
    D.poly(c, [[-7.8, -3.2], [-4.8, -4.2], [-4.8, -2]], '#f08a2a', r, { lw: 0.8 });
    D.ellipse(c, -2.5, -3.8, 3.4, 3.3, col, r);
    D.dot(c, -3.4, -4.6, 0.6);
  },
  sock(c, col, r) {
    c.save(); c.rotate(-0.2);
    D.poly(c, [[-3, -8], [3.5, -8], [3.5, 2], [7, 4], [6.5, 7.5], [-1, 7], [-3.5, 4]], col, r, { smooth: false });
    D.rect(c, -3.2, -8.6, 6.9, 3, '#f5f2ea', r, { lw: 0.8 });
    D.line(c, -3.3, -1, 3.5, -1, null, { lw: 1.4, stroke: shade(col, 0.5) });
    D.line(c, -3.3, 1.5, 3.5, 1.5, null, { lw: 1.4, stroke: shade(col, 0.5) });
    c.restore();
  },
  handbag(c, col, r) {
    D.curve(c, [[-4, -3], [-4, -8.5], [4, -8.5], [4, -3]], r, { lw: 1.5, stroke: shade(col, -0.35) });
    D.poly(c, [[-6, -3.5], [6, -3.5], [8, 6.5], [-8, 6.5]], col, r);
    D.line(c, -6.3, -0.5, 6.7, -0.5, null, { lw: 0.7 });
    D.dot(c, 0, -0.4, 1.1, '#e7c65c');
  },
  lollipop(c, col, r) {
    D.line(c, 0.5, 2, 1.5, 10, r, { lw: 2.6 });
    D.line(c, 0.5, 2, 1.5, 10, null, { lw: 1.4, stroke: '#fff' });
    D.ellipse(c, 0, -3, 5.8, 5.8, col, r);
    c.beginPath();
    for (let a = 0; a < 9; a += 0.3) { const rr = a * 0.55; c.lineTo(Math.cos(a) * rr, -3 + Math.sin(a) * rr); }
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.2; c.stroke();
  },
  mitten(c, col, r) {
    c.save(); c.rotate(0.3);
    D.poly(c, [[-4.5, 4], [-5, -3], [-3.5, -7.5], [2, -7.5], [3.5, -3], [3.5, -1], [6, -3], [7, -1], [4, 3], [3.5, 4]], col, r, { smooth: true });
    D.rect(c, -5, 3.5, 9, 3.5, '#f5f2ea', r, { lw: 0.8 });
    D.line(c, -2, -3, 1.5, -3, null, { lw: 1, stroke: shade(col, 0.5) });
    c.restore();
  },
  trumpet(c, col, r) {
    c.save(); c.rotate(-0.2);
    D.rect(c, -8, -1.1, 11, 2.2, col, r, { lw: 0.9 });
    D.poly(c, [[3, -1.5], [9.5, -5.5], [9.5, 5.5], [3, 1.5]], col, r);
    D.ellipse(c, 9.5, 0, 1.4, 5.5, shade(col, -0.25), r, { lw: 0.8 });
    D.rect(c, -4, -4.5, 5.5, 3.2, col, r, { lw: 0.8 });
    D.line(c, -3, -4.5, -3, -6.5, null, { lw: 1 }); D.line(c, -1.2, -4.5, -1.2, -6.5, null, { lw: 1 }); D.line(c, 0.6, -4.5, 0.6, -6.5, null, { lw: 1 });
    D.rect(c, -9.5, -1.6, 2, 3.2, shade(col, -0.2), r, { lw: 0.7 });
    c.restore();
  },
  mug(c, col, r) {
    c.beginPath(); c.arc(6, 0, 3.2, -1.3, 1.3); c.strokeStyle = INK; c.lineWidth = 3.4; c.stroke();
    c.beginPath(); c.arc(6, 0, 3.2, -1.3, 1.3); c.strokeStyle = col; c.lineWidth = 1.6; c.stroke();
    D.rect(c, -5.5, -6, 11.5, 12.5, col, r);
    D.ellipse(c, 0.3, -6, 5.7, 1.6, '#6b4428', r, { lw: 0.8 });
    D.ellipse(c, 0.3, 1, 2.2, 2, shade(col, 0.5), null, { stroke: false });
  },
  letter(c, col, r) {
    c.save(); c.rotate(-0.12);
    D.rect(c, -8, -5.5, 16, 11, col, r);
    D.poly(c, [[-8, -5.5], [0, 1], [8, -5.5]], null, r, { open: true, lw: 0.9 });
    D.rect(c, 4, -4.5, 3, 3.4, col === COLORS.red ? '#f1c83b' : '#d9483b', null, { lw: 0.6 });
    c.restore();
  },
  ball(c, col, r) {
    D.ellipse(c, 0, 0, 6.2, 6.2, col, r);
    D.curve(c, [[-5.8, -1.5], [0, 1.5], [5.8, -1.5]], null, { lw: 1.6, stroke: '#fff' });
    D.curve(c, [[-1.5, -5.8], [1.5, 0], [-1.5, 5.8]], null, { lw: 1.6, stroke: '#fff' });
    D.ellipse(c, 0, 0, 6.2, 6.2, null, null, { lw: 1.1 });
  },
  crown(c, col, r) {
    D.poly(c, [[-7.5, 5], [-8, -5], [-4, -1], [0, -7], [4, -1], [8, -5], [7.5, 5]], col, r);
    D.rect(c, -7.5, 2, 15, 3.2, shade(col, -0.2), r, { lw: 0.8 });
    D.dot(c, -3.5, 3.6, 1, '#d9483b'); D.dot(c, 0, 3.6, 1, '#4a78c9'); D.dot(c, 3.5, 3.6, 1, '#4f9a5a');
    D.dot(c, 0, -7, 1.2, '#ec8fb5');
  },
  ticket(c, col, r) {
    c.save(); c.rotate(0.2);
    D.poly(c, [[-8, -4.5], [8, -4.5], [8, -1.5], [6.8, 0], [8, 1.5], [8, 4.5], [-8, 4.5], [-8, 1.5], [-6.8, 0], [-8, -1.5]], col, r);
    c.setLineDash([1.2, 1.2]); D.line(c, 3.6, -4, 3.6, 4, null, { lw: 0.6 }); c.setLineDash([]);
    D.line(c, -5, -1.6, 1.8, -1.6, null, { lw: 1 }); D.line(c, -5, 1.2, 0.5, 1.2, null, { lw: 0.8 });
    D.dot(c, 5.8, 0, 1, shade(col, -0.35));
    c.restore();
  },
  compass(c, col, r) {
    D.rect(c, -1.3, -8.8, 2.6, 2.2, col, r, { lw: 0.8 });
    D.ellipse(c, 0, 0, 6.8, 6.8, col, r, { lw: 1.2 });
    D.ellipse(c, 0, 0, 5, 5, '#fbf6e8', r, { lw: 0.7 });
    D.poly(c, [[0, -4.2], [1.3, 0], [-1.3, 0]], '#d9483b', null, { lw: 0.5 });
    D.poly(c, [[0, 4.2], [1.3, 0], [-1.3, 0]], '#4a78c9', null, { lw: 0.5 });
  },
  skate(c, col, r) {
    D.line(c, -8, 7, 8, 7, r, { lw: 1.5, stroke: '#9aa3b1' });
    D.line(c, -8, 7, 8, 7, null, { lw: 0.5 });
    D.line(c, -5, 7, -5, 4.5, null, { lw: 1 }); D.line(c, 4, 7, 4, 4.5, null, { lw: 1 });
    D.poly(c, [[-6, 4.5], [-6.5, -8], [-0.5, -8], [0, -1.5], [7, 0], [7.5, 4.5]], col, r, { smooth: false });
    D.line(c, -5, -5, -1, -5, null, { lw: 0.6 }); D.line(c, -5, -2.5, -0.5, -2.5, null, { lw: 0.6 });
  },
  snowglobe(c, col, r) {
    D.poly(c, [[-6.5, 7.5], [-5, 3], [5, 3], [6.5, 7.5]], col, r);
    D.ellipse(c, 0, -2.5, 6.6, 6.6, 'rgba(200,232,250,0.8)', r);
    D.poly(c, [[0, -7], [3, -0.5], [-3, -0.5]], '#4f9a5a', null, { lw: 0.6 });
    D.dot(c, -3, -4, 0.6, '#fff'); D.dot(c, 3.3, -5.5, 0.5, '#fff'); D.dot(c, 2, -2, 0.5, '#fff'); D.dot(c, -2, -7, 0.5, '#fff');
    D.ellipse(c, 0, 2, 5, 1.3, '#fff', null, { stroke: false });
  },
  headphones(c, col, r) {
    c.beginPath(); c.arc(0, 1, 7, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = INK; c.lineWidth = 3.4; c.stroke();
    c.beginPath(); c.arc(0, 1, 7, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = col; c.lineWidth = 1.8; c.stroke();
    D.ellipse(c, -6.8, 2.2, 2.6, 3.8, col, r); D.ellipse(c, 6.8, 2.2, 2.6, 3.8, col, r);
    D.ellipse(c, -6.2, 2.2, 1.2, 2.4, shade(col, -0.35), null, { stroke: false });
    D.ellipse(c, 6.2, 2.2, 1.2, 2.4, shade(col, -0.35), null, { stroke: false });
  },
  orb(c, col, r) {
    D.poly(c, [[-5.5, 8], [-3.5, 3.5], [3.5, 3.5], [5.5, 8]], '#e0b33a', r);
    D.ellipse(c, 0, -2.2, 6.5, 6.5, col, r);
    D.ellipse(c, 0.8, -1.4, 4.2, 4.2, shade(col, 0.3), null, { stroke: false });
    D.ellipse(c, -2.2, -4.6, 1.5, 1.9, 'rgba(255,255,255,0.85)', null, { stroke: false });
  },
};

function drawItemIcon(canvas, type, colName, zoom) {
  const c = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  c.clearRect(0, 0, w, h);
  c.save();
  c.translate(w / 2, h / 2);
  const s = zoom || Math.min(w, h) / 26;
  c.scale(s, s);
  ITEMS[type](c, COLORS[colName], RNG(hashStr(type + colName)));
  c.restore();
}
