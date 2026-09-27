// ---------------------------------------------------------------
//  Audio — all sound is synthesised live with WebAudio (no files)
// ---------------------------------------------------------------
'use strict';

const Sound = (() => {
  let ac = null, master, musicBus, sfxBus, ambBus, revIn, noiseBuf;
  let vol = { music: 0.6, sfx: 0.8 };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    master = ac.createGain(); master.gain.value = 0.9;
    master.connect(comp); comp.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    ambBus = ac.createGain(); ambBus.connect(sfxBus);
    ambBus.gain.value = 0.9;
    // reverb
    const len = ac.sampleRate * 2.4, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const conv = ac.createConvolver(); conv.buffer = ir;
    revIn = ac.createGain(); revIn.gain.value = 0.35;
    revIn.connect(conv); conv.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    setVolumes(vol.music, vol.sfx);
    setInterval(tick, 25);
  }

  function setVolumes(m, s) {
    vol.music = m; vol.sfx = s;
    if (!ac) return;
    musicBus.gain.setTargetAtTime(m * 0.55, ac.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(s, ac.currentTime, 0.05);
  }

  // ---------------- voice helpers ----------------
  function voice(o) {
    // o: {type, f, t, dur, vol, a, dest, glide, lp, q, rev, detune, rel}
    const t = o.t !== undefined ? o.t : ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + (o.gt || o.dur));
    if (o.detune) osc.detune.value = o.detune;
    const g = ac.createGain();
    const a = o.a || 0.005, v = o.vol || 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    if (o.sus) {
      g.gain.setValueAtTime(v, t + o.dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur + (o.rel || 0.15));
    } else g.gain.exponentialRampToValueAtTime(0.0001, t + a + o.dur);
    let node = osc;
    if (o.lp) {
      const f = ac.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || 0.7;
      if (o.lpEnv) { f.frequency.setValueAtTime(o.lpEnv, t); f.frequency.exponentialRampToValueAtTime(o.lp, t + (o.lpT || 0.2)); }
      osc.connect(f); node = f;
    }
    node.connect(g);
    g.connect(o.dest || sfxBus);
    if (o.rev) { const rg = ac.createGain(); rg.gain.value = o.rev; g.connect(rg); rg.connect(revIn); }
    if (o.vib) {
      const l = ac.createOscillator(), lg = ac.createGain();
      l.frequency.value = o.vib; lg.gain.value = o.vibD || 4; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + o.dur + 1);
    }
    osc.start(t);
    osc.stop(t + a + o.dur + (o.rel || 0.15) + 0.05);
    return osc;
  }

  function noise(o) {
    const t = o.t !== undefined ? o.t : ac.currentTime;
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = o.rate || 1;
    const f = ac.createBiquadFilter(); f.type = o.ft || 'bandpass'; f.frequency.value = o.f || 1000; f.Q.value = o.q || 1;
    if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + o.dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol || 0.2, t + (o.a || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.a || 0.003) + o.dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    if (o.rev) { const rg = ac.createGain(); rg.gain.value = o.rev; g.connect(rg); rg.connect(revIn); }
    src.start(t, Math.random() * 1.5);
    src.stop(t + o.dur + 0.1);
  }

  // ---------------- sound effects ----------------
  const sfx = {
    click() { voice({ f: 880, glide: 620, dur: 0.07, vol: 0.12, type: 'sine' }); },
    hover() { voice({ f: 1500, dur: 0.03, vol: 0.025, type: 'sine' }); },
    back() { voice({ f: 520, glide: 360, dur: 0.09, vol: 0.12, type: 'triangle' }); },
    paper() {
      noise({ f: 2200, q: 0.6, dur: 0.1, vol: 0.18 });
      noise({ f: 1400, q: 0.8, dur: 0.14, vol: 0.12, t: ac.currentTime + 0.06 });
    },
    pickup() {
      const t = ac.currentTime;
      [72, 76, 79, 84].forEach((m, i) => voice({ f: mtof(m), t: t + i * 0.055, dur: 0.18, vol: 0.13, type: 'triangle', rev: 0.3 }));
      voice({ f: mtof(96), t: t + 0.22, dur: 0.3, vol: 0.05, rev: 0.5 });
    },
    returned() {
      const t = ac.currentTime;
      noise({ f: 180, ft: 'lowpass', dur: 0.12, vol: 0.5, t });
      voice({ f: 160, glide: 60, dur: 0.12, vol: 0.35, t });
      [72, 76, 79, 83, 88].forEach((m, i) => {
        voice({ f: mtof(m), t: t + 0.12 + i * 0.08, dur: 1.1, vol: 0.1, rev: 0.5 });
        voice({ f: mtof(m) * 2.76, t: t + 0.12 + i * 0.08, dur: 0.35, vol: 0.025, rev: 0.4 });
      });
    },
    wrong() {
      const t = ac.currentTime;
      voice({ f: 240, glide: 170, dur: 0.12, vol: 0.06, type: 'square', lp: 900, t });
      voice({ f: 190, glide: 130, dur: 0.16, vol: 0.06, type: 'square', lp: 800, t: t + 0.11 });
    },
    decoy() {
      const t = ac.currentTime;
      voice({ f: 440, dur: 0.12, vol: 0.1, type: 'triangle', t });
      voice({ f: 370, dur: 0.2, vol: 0.1, type: 'triangle', t: t + 0.13 });
    },
    talk(pitch) {
      const t = ac.currentTime, n = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) voice({ f: (pitch || 300) * (0.85 + Math.random() * 0.4), t: t + i * 0.07, dur: 0.05, vol: 0.045, type: 'square', lp: 1800 });
    },
    meow() {
      const t = ac.currentTime;
      const o = voice({ f: 620, dur: 0.5, vol: 0.12, type: 'sawtooth', lp: 1300, q: 4, t, a: 0.04 });
      o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(900, t + 0.15); o.frequency.linearRampToValueAtTime(560, t + 0.5);
      [88, 91, 96].forEach((m, i) => voice({ f: mtof(m), t: t + 0.3 + i * 0.07, dur: 0.4, vol: 0.05, rev: 0.6 }));
    },
    hint() {
      const t = ac.currentTime;
      for (let i = 0; i < 8; i++) voice({ f: mtof(79 + i * 2), t: t + i * 0.035, dur: 0.25, vol: 0.05, rev: 0.6 });
    },
    whoosh() { noise({ f: 400, fTo: 2400, q: 1.2, dur: 0.35, vol: 0.12, a: 0.12 }); },
    pop() { voice({ f: 500, glide: 1200, dur: 0.06, vol: 0.12, gt: 0.05 }); },
    star(i) {
      const t = ac.currentTime;
      voice({ f: mtof(76 + i * 4), dur: 0.5, vol: 0.12, rev: 0.5, t });
      voice({ f: mtof(88 + i * 4), dur: 0.3, vol: 0.04, rev: 0.5, t });
    },
    complete() {
      const t = ac.currentTime;
      const mel = [[67, 0], [72, 0.14], [76, 0.28], [79, 0.42], [76, 0.62], [79, 0.76], [84, 0.9]];
      mel.forEach(([m, d], i) => voice({ f: mtof(m), t: t + d, dur: i === mel.length - 1 ? 1.2 : 0.18, vol: 0.13, type: 'triangle', rev: 0.4 }));
      [[60, 64, 67], [65, 69, 72], [67, 71, 74, 77], [72, 76, 79, 84]].forEach((ch, i) => ch.forEach(m => voice({ f: mtof(m - 12), t: t + i * 0.3, dur: i === 3 ? 1.4 : 0.28, vol: 0.05, type: 'sine', rev: 0.3 })));
      noise({ f: 6000, ft: 'highpass', dur: 0.8, vol: 0.05, t: t + 0.9, a: 0.02 });
    },
    stamp() {
      noise({ f: 150, ft: 'lowpass', dur: 0.1, vol: 0.5 });
      voice({ f: 120, glide: 50, dur: 0.1, vol: 0.3 });
    },
  };

  // ---------------- music ----------------
  const MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10], MIXO = [0, 2, 4, 5, 7, 9, 10], DORIAN = [0, 2, 3, 5, 7, 9, 10];
  const TRACKS = {
    title: { bpm: 82, root: 53, scale: MAJOR, prog: [0, 5, 1, 4], progB: [3, 2, 1, 4], lead: 'epiano', comp: 'pad', bass: 'soft', drums: 'shaker', spb: 16, swing: 0.12, seed: 11 },
    park: { bpm: 100, root: 60, scale: MAJOR, prog: [0, 3, 5, 4], progB: [3, 4, 2, 5], lead: 'marimba', comp: 'epiano', bass: 'pizz', drums: 'light', spb: 16, swing: 0.1, seed: 21 },
    market: { bpm: 112, root: 55, scale: MIXO, prog: [0, 6, 3, 0], progB: [3, 0, 4, 6], lead: 'accordion', comp: 'pluck', bass: 'pizz', drums: 'swing', spb: 16, swing: 0.22, seed: 31 },
    beach: { bpm: 90, root: 62, scale: MAJOR, prog: [0, 1, 4, 0], progB: [3, 2, 1, 4], lead: 'uke', comp: 'epiano', bass: 'soft', drums: 'bossa', spb: 16, swing: 0.06, seed: 41 },
    winter: { bpm: 76, root: 57, scale: MINOR, prog: [0, 5, 2, 6], progB: [3, 0, 5, 4], lead: 'bell', comp: 'pad', bass: 'soft', drums: 'none', spb: 16, swing: 0, seed: 51 },
    carnival: { bpm: 138, root: 58, scale: MAJOR, prog: [0, 0, 4, 4, 1, 4, 0, 0], progB: [3, 3, 0, 0, 1, 4, 0, 4], lead: 'organ', comp: 'organchord', bass: 'tuba', drums: 'waltz', spb: 12, swing: 0, seed: 61 },
    ending: { bpm: 70, root: 53, scale: MAJOR, prog: [0, 2, 3, 4], progB: [5, 3, 1, 4], lead: 'bell', comp: 'pad', bass: 'soft', drums: 'none', spb: 16, swing: 0, seed: 71 },
  };

  function chordNotes(tr, deg, oct) {
    const sc = tr.scale, out = [];
    for (let k = 0; k < 4; k++) {
      const d = deg + k * 2;
      out.push(tr.root + sc[d % 7] + 12 * Math.floor(d / 7) + (oct || 0));
    }
    return out;
  }

  function buildSong(tr) {
    const r = RNG(tr.seed);
    const spb = tr.spb;
    const plen = tr.prog.length;
    const sections = [tr.prog, tr.prog, tr.progB, tr.prog];
    const chords = [].concat(...sections);
    const bars = chords.length;
    const rhythms16 = [
      [0, 3, 6, 8, 10, 12], [0, 4, 6, 10, 12], [0, 2, 4, 7, 10, 14], [0, 6, 8, 11, 12], [2, 4, 6, 8, 12], [0, 3, 6, 10, 12, 14], [0, 8, 12],
    ];
    const rhythms12 = [[0, 4, 8], [0, 2, 4, 8], [0, 4, 6, 8, 10], [0, 8]];
    const mel = [];
    const motifs = [];
    for (let i = 0; i < 4; i++) motifs.push(r.pick(spb === 12 ? rhythms12 : rhythms16));
    let prev = 7; // scale index relative to root octave +1
    const genBar = (deg, rh, isEnd) => {
      const notes = {};
      rh.forEach((st, idx) => {
        const strong = st % 4 === 0;
        let target;
        if (strong || r.chance(0.4)) {
          const ct = [deg, deg + 2, deg + 4].map(d => d + 7);
          ct.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev));
          target = r.chance(0.7) ? ct[0] : ct[1];
        } else {
          target = prev + (r.chance(0.5) ? 1 : -1) * (r.chance(0.8) ? 1 : 2);
        }
        target = clamp(target, 4, 15);
        prev = target;
        const next = idx < rh.length - 1 ? rh[idx + 1] : spb;
        notes[st] = { d: target, len: next - st };
      });
      if (isEnd) { const d0 = deg + 7; return { 0: { d: d0, len: spb } }; }
      return notes;
    };
    for (let b = 0; b < bars; b++) {
      const sec = Math.floor(b / plen), inSec = b % plen;
      const isEnd = inSec === plen - 1 && (sec === 1 || sec === 3);
      if (sec === 1 || sec === 3) {
        // repeat of section A with varied ending
        if (!isEnd && mel[inSec]) { mel.push(mel[inSec]); continue; }
      }
      const rh = motifs[(inSec + (sec === 2 ? 2 : 0)) % motifs.length];
      mel.push(genBar(chords[b], rh, isEnd));
    }
    return { chords, mel, bars };
  }

  const seq = { track: null, name: null, song: null, step: 0, next: 0, gain: null };

  function playMusic(name) {
    if (!ac) return;
    if (seq.name === name) return;
    const old = seq.gain;
    if (old) { old.gain.setTargetAtTime(0.0001, ac.currentTime, 0.4); setTimeout(() => old.disconnect(), 3000); }
    seq.name = name;
    if (!name) { seq.track = null; return; }
    seq.track = TRACKS[name];
    seq.song = buildSong(seq.track);
    seq.step = 0;
    seq.next = ac.currentTime + 0.3;
    seq.gain = ac.createGain();
    seq.gain.gain.setValueAtTime(0.0001, ac.currentTime);
    seq.gain.gain.linearRampToValueAtTime(1, ac.currentTime + 1.5);
    seq.gain.connect(musicBus);
  }

  function inst(kind, m, t, dur, v) {
    const dest = seq.gain, f = mtof(m);
    switch (kind) {
      case 'epiano':
        voice({ f, t, dur: dur + 0.3, vol: 0.09 * v, dest, rev: 0.25, lp: 2600 });
        voice({ f: f * 2, t, dur: 0.25, vol: 0.025 * v, dest, rev: 0.2 });
        break;
      case 'marimba':
        voice({ f, t, dur: 0.45, vol: 0.13 * v, dest, rev: 0.25 });
        voice({ f: f * 4, t, dur: 0.05, vol: 0.03 * v, dest });
        break;
      case 'bell':
        voice({ f, t, dur: 1.4, vol: 0.08 * v, dest, rev: 0.6 });
        voice({ f: f * 2.76, t, dur: 0.5, vol: 0.02 * v, dest, rev: 0.6 });
        voice({ f: f * 5.4, t, dur: 0.15, vol: 0.01 * v, dest });
        break;
      case 'accordion':
        voice({ f, t, dur, vol: 0.035 * v, type: 'sawtooth', lp: 1700, dest, a: 0.03, sus: true, rel: 0.08, vib: 5.5, vibD: 3, rev: 0.15 });
        voice({ f, t, dur, vol: 0.03 * v, type: 'sawtooth', detune: 12, lp: 1700, dest, a: 0.03, sus: true, rel: 0.08, rev: 0.15 });
        break;
      case 'uke':
        voice({ f, t, dur: 0.5, vol: 0.11 * v, type: 'triangle', lp: 700, lpEnv: 4000, lpT: 0.15, dest, rev: 0.25 });
        break;
      case 'pluck':
        voice({ f, t, dur: 0.3, vol: 0.06 * v, type: 'triangle', lp: 600, lpEnv: 3000, lpT: 0.1, dest, rev: 0.2 });
        break;
      case 'organ':
        voice({ f, t, dur, vol: 0.05 * v, dest, sus: true, rel: 0.06, vib: 6, vibD: 2.5, rev: 0.2 });
        voice({ f: f * 2, t, dur, vol: 0.03 * v, dest, sus: true, rel: 0.06, rev: 0.2 });
        voice({ f: f * 3, t, dur, vol: 0.015 * v, dest, sus: true, rel: 0.06 });
        break;
      case 'organchord':
        voice({ f, t, dur, vol: 0.022 * v, type: 'square', lp: 1200, dest, sus: true, rel: 0.05 });
        break;
      case 'pad':
        voice({ f, t, dur, vol: 0.022 * v, type: 'sawtooth', lp: 900, dest, a: 0.4, sus: true, rel: 0.8, rev: 0.4 });
        voice({ f, t, dur, vol: 0.02 * v, type: 'sawtooth', detune: 9, lp: 900, dest, a: 0.4, sus: true, rel: 0.8 });
        break;
      case 'bass':
        voice({ f, t, dur, vol: 0.16 * v, type: 'triangle', lp: 700, dest });
        voice({ f: f / 2, t, dur, vol: 0.08 * v, type: 'sine', dest });
        break;
      case 'tuba':
        voice({ f, t, dur: dur * 0.8, vol: 0.09 * v, type: 'sawtooth', lp: 420, dest, a: 0.02 });
        break;
    }
  }

  function drum(kind, t, v) {
    const dest = seq.gain;
    if (kind === 'kick') { voice({ f: 130, glide: 45, gt: 0.12, dur: 0.22, vol: 0.28 * v, t, dest }); }
    if (kind === 'hat') noise({ f: 8000, ft: 'highpass', dur: 0.03, vol: 0.05 * v, t, dest });
    if (kind === 'shaker') noise({ f: 6500, q: 1.5, dur: 0.06, vol: 0.05 * v, a: 0.02, t, dest });
    if (kind === 'rim') { noise({ f: 2400, q: 3, dur: 0.05, vol: 0.13 * v, t, dest }); voice({ f: 420, dur: 0.03, vol: 0.05 * v, t, dest }); }
    if (kind === 'snare') noise({ f: 1800, q: 0.8, dur: 0.12, vol: 0.12 * v, t, dest, rev: 0.2 });
  }

  function playStep(step, t) {
    const tr = seq.track, song = seq.song, spb = tr.spb;
    const bar = Math.floor(step / spb) % song.bars, s = step % spb;
    const deg = song.chords[bar];
    const beatDur = 60 / tr.bpm;
    const sd = beatDur / 4;
    const ch = chordNotes(tr, deg, 0);
    // bass
    if (tr.bass === 'tuba') {
      if (s === 0) inst('tuba', ch[0] - 24, t, sd * 3, 1);
      if (s === 8 && bar % 2 === 1) inst('tuba', ch[2] - 24, t, sd * 3, 0.8);
    } else {
      const pat = tr.bass === 'pizz' ? { 0: 0, 6: 2, 8: 0, 14: 1 } : { 0: 0, 10: 2 };
      if (pat[s] !== undefined) {
        const n = pat[s] === 0 ? ch[0] : pat[s] === 2 ? ch[2] : ch[1];
        inst('bass', n - 24, t, tr.bass === 'pizz' ? sd * 2 : sd * 6, 1);
      }
    }
    // comp / chords
    if (tr.comp === 'pad') {
      if (s === 0) ch.forEach(n => inst('pad', n - 12, t, beatDur * 4, 1));
    } else if (tr.comp === 'organchord') {
      if (s === 4 || s === 8) ch.slice(0, 3).forEach(n => inst('organchord', n - 12, t, sd * 2.5, 1));
    } else {
      const hits = tr.drums === 'bossa' ? [0, 6, 10] : tr.comp === 'pluck' ? [4, 12] : [0, 7, 10];
      if (hits.includes(s)) ch.forEach(n => inst(tr.comp, n - 12, t, sd * 3, 0.9));
    }
    // melody
    const mb = song.mel[bar];
    if (mb && mb[s]) {
      const nd = mb[s];
      const idx = nd.d;
      const m = tr.root + tr.scale[((idx % 7) + 7) % 7] + 12 * Math.floor(idx / 7);
      inst(tr.lead, m, t, sd * nd.len * 0.95, 1);
    }
    // drums
    switch (tr.drums) {
      case 'shaker': if (s % 2 === 0) drum('shaker', t, s % 4 === 0 ? 0.6 : 1); break;
      case 'light':
        if (s === 0 || s === 8) drum('kick', t, 0.8);
        if (s === 4 || s === 12) drum('rim', t, 0.8);
        if (s % 2 === 0) drum('hat', t, s % 4 ? 0.6 : 1);
        break;
      case 'swing':
        if (s === 0 || s === 10) drum('kick', t, 0.8);
        if (s === 4 || s === 12) drum('snare', t, 0.7);
        if (s % 2 === 0) drum('hat', t, 1);
        break;
      case 'bossa':
        if (s === 0 || s === 6 || s === 8 || s === 14) drum('kick', t, 0.6);
        if ([0, 3, 6, 10, 12].includes(s)) drum('rim', t, 0.6);
        drum('shaker', t, s % 2 ? 0.5 : 0.9);
        break;
      case 'waltz':
        if (s === 0) drum('kick', t, 0.9);
        if (s === 4 || s === 8) drum('hat', t, 1.4);
        break;
    }
  }

  // ---------------- ambience ----------------
  const amb = { name: null, nodes: [], nextEvent: 0 };
  function loopNoise(filterType, freq, q, v, lfoRate, lfoDepth) {
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); g.gain.value = v;
    src.connect(f); f.connect(g); g.connect(ambBus);
    const nodes = [src, g];
    if (lfoRate) {
      const l = ac.createOscillator(), lg = ac.createGain();
      l.frequency.value = lfoRate; lg.gain.value = lfoDepth; l.connect(lg); lg.connect(g.gain); l.start(); nodes.push(l);
    }
    src.start();
    return nodes;
  }
  function playAmbience(name) {
    if (!ac || amb.name === name) return;
    amb.nodes.forEach(n => { try { n.stop ? n.stop() : 0; } catch (e) { } try { n.disconnect(); } catch (e) { } });
    amb.nodes = [];
    amb.name = name;
    if (!name) return;
    if (name === 'park') amb.nodes.push(...loopNoise('lowpass', 500, 0.5, 0.012));
    if (name === 'market') amb.nodes.push(...loopNoise('bandpass', 450, 0.6, 0.05, 0.13, 0.015));
    if (name === 'beach') amb.nodes.push(...loopNoise('lowpass', 650, 0.4, 0.07, 0.11, 0.06));
    if (name === 'winter') amb.nodes.push(...loopNoise('bandpass', 700, 1.4, 0.05, 0.07, 0.04));
    if (name === 'carnival') amb.nodes.push(...loopNoise('bandpass', 500, 0.6, 0.04, 0.09, 0.012));
    amb.nextEvent = ac.currentTime + 1;
  }
  function ambEvent() {
    const t = ac.currentTime;
    const d = { dest: ambBus };
    switch (amb.name) {
      case 'park': { // birdsong
        const base = 2400 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) voice(Object.assign({ f: base, glide: base * (1.2 + Math.random() * 0.4), gt: 0.06, t: t + i * 0.1, dur: 0.07, vol: 0.02, rev: 0.4 }, d));
        amb.nextEvent = t + 1.2 + Math.random() * 3.5; break;
      }
      case 'market': {
        if (Math.random() < 0.4) { voice(Object.assign({ f: 2100, t, dur: 0.4, vol: 0.015, rev: 0.4 }, d)); voice(Object.assign({ f: 2100, t: t + 0.12, dur: 0.5, vol: 0.015, rev: 0.4 }, d)); }
        else for (let i = 0; i < 3; i++) voice(Object.assign({ f: 180 + Math.random() * 120, t: t + i * 0.15, dur: 0.12, vol: 0.01, type: 'triangle', lp: 600 }, d));
        amb.nextEvent = t + 2 + Math.random() * 4; break;
      }
      case 'beach': {
        const o = voice(Object.assign({ f: 1300, t, dur: 0.35, vol: 0.02, type: 'sawtooth', lp: 1800, q: 3, rev: 0.5 }, d));
        o.frequency.setValueAtTime(1300, t); o.frequency.linearRampToValueAtTime(1700, t + 0.08); o.frequency.linearRampToValueAtTime(1000, t + 0.35);
        amb.nextEvent = t + 3 + Math.random() * 6; break;
      }
      case 'winter': {
        for (let i = 0; i < 6; i++) voice(Object.assign({ f: 3200 + Math.random() * 1600, t: t + i * 0.09, dur: 0.12, vol: 0.008, rev: 0.6 }, d));
        amb.nextEvent = t + 5 + Math.random() * 8; break;
      }
      case 'carnival': {
        for (let i = 0; i < 3; i++) voice(Object.assign({ f: 4600, t: t + i * 0.06, dur: 0.03, vol: 0.008 }, d));
        amb.nextEvent = t + 0.8 + Math.random() * 1.6; break;
      }
      default: amb.nextEvent = t + 5;
    }
  }

  function tick() {
    if (!ac) return;
    if (seq.track) {
      const tr = seq.track, sd = 60 / tr.bpm / 4;
      while (seq.next < ac.currentTime + 0.15) {
        const sw = (seq.step % 2 === 1) ? tr.swing * sd : 0;
        try { playStep(seq.step, seq.next + sw); } catch (e) { console.warn(e); }
        seq.step++;
        seq.next += sd;
      }
    }
    if (amb.name && ac.currentTime > amb.nextEvent) ambEvent();
  }

  function play(name, arg) { if (!ac || !sfx[name]) return; try { sfx[name](arg); } catch (e) { console.warn(e); } }

  return { init, play, playMusic, playAmbience, setVolumes, get ready() { return !!ac; } };
})();
