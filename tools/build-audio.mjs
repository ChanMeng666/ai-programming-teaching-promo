// The whole soundtrack, synthesised: no samples, no service, no licence to clear.
//   node tools/build-audio.mjs            every cut -> public/audio/mix-<cut>.wav
// The bed is written at exactly BPM (so the bar grid is exact, not measured), its
// arrangement follows the cut's own scenes, and every effect is placed from the cue
// sheet the film derives (src/timeline.ts cuesFor) at FRAME-QUANTISED starts — the
// offline mix is the composition. Deterministic: a seeded LCG is the only noise.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCore } from '../capture/lib/load-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SR = 48000;
const core = await loadCore();
const BEAT = 60 / core.BPM;
const BAR = BEAT * 4;
const TARGET = { I: -16, TP: -1.5 };

let seed = 1;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const makeBus = (sec) => ({ l: new Float32Array(Math.ceil(sec * SR)), r: new Float32Array(Math.ceil(sec * SR)) });
/** Adds a mono voice fn(tLocal) -> sample to a bus at t0, equal-power panned. */
const add = (bus, t0, dur, gain, pan, fn) => {
  const i0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const j = i0 + i;
    if (j < 0 || j >= bus.l.length) continue;
    const v = fn(i / SR);
    bus.l[j] += v * gl; bus.r[j] += v * gr;
  }
};
const att = (t, a = 0.004) => Math.min(1, t / a);

const pluck = (bus, f, t0, gain, pan = 0, tau = 0.22) => add(bus, t0, tau * 7, gain, pan, (t) =>
  att(t) * Math.exp(-t / tau) * (Math.sin(2 * Math.PI * f * t) + 0.32 * Math.exp(-t / (tau * 0.4)) * Math.sin(2 * Math.PI * f * 4 * t) + 0.12 * Math.sin(2 * Math.PI * f * 2 * t)));
const pad = (bus, freqs, t0, dur, gain) => freqs.forEach((f, k) => add(bus, t0, dur + 0.6, gain / freqs.length, k % 2 ? 0.5 : -0.5, (t) => {
  const env = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, (dur + 0.6 - t) / 0.6));
  return env * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.004 * t + k));
}));
const bass = (bus, f, t0, dur, gain) => add(bus, t0, dur, gain, 0, (t) => att(t, 0.008) * Math.exp(-t / 0.35) * Math.min(1, (dur - t) / 0.03) * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)));
const kick = (bus, t0, gain) => add(bus, t0, 0.3, gain, 0, (t) => Math.exp(-t / 0.09) * Math.sin(2 * Math.PI * (45 * t + (75 * 0.03) * (1 - Math.exp(-t / 0.03)))));
const noiseHit = (bus, t0, gain, pan, tau, bright) => { let prev = 0, lp = 0; add(bus, t0, tau * 6, gain, pan, (t) => {
  const x = rnd(); const hp = x - prev; prev = x; lp += 0.35 * (x - lp);
  return att(t, 0.001) * Math.exp(-t / tau) * (bright ? hp : lp);
}); };

// ---- the bed --------------------------------------------------------------
const CHORDS = [[53, 57, 60, 64], [48, 52, 55, 62], [57, 60, 64, 67], [55, 59, 62, 66 - 1]]; // Fmaj7 · Cadd9 · Am7 · G
const ARP = [0, 2, 1, 3, 2, 3, 1, 2];
const LEAD = [[76, 79, 81, 79], [76, 74, 72, 74], [76, 79, 84, 81], [79, null, 76, null]];
/** How much of the band plays under each scene. */
const ENERGY = { hook: 0, home: 2, programs: 2, docs: 2, tutor: 1, showcase: 3, cert: 3, instructor: 2, end: -1 };

const buildBed = (cut) => {
  const beats = core.resolveCut(cut);
  const bus = makeBus(cut + 1), wet = makeBus(cut + 1);
  const sceneAt = (sec) => beats.findLast((b) => b.startSec <= sec + 1e-6).scene;
  const endStart = beats.find((b) => b.scene === 'end').startSec;
  for (let bar = 0; bar * BAR < cut; bar++) {
    const t0 = bar * BAR, scene = sceneAt(t0), e = ENERGY[scene], ch = CHORDS[bar % 4];
    if (scene === 'end') continue;
    const lastBeforeEnd = Math.abs(t0 + BAR - endStart) < 1e-6;
    pad(bus, ch.map((n) => midi(n)), t0, BAR, e === 0 ? 0.1 : 0.075);
    for (let s = 0; s < 8; s++) { // the arpeggio — the film's pulse
      const n = ch[ARP[s]] + 12 + (s % 4 === 3 ? 12 : 0);
      if (e === 0 && s % 2) continue;
      pluck(wet, midi(n), t0 + s * BEAT * 0.5, (e === 1 ? 0.1 : 0.13) * (s % 2 ? 0.7 : 1), ((s % 4) - 1.5) * 0.3);
    }
    if (e >= 1) [0, 2.5].forEach((b) => bass(bus, midi(ch[0] - 12), t0 + b * BEAT, b ? BEAT * 1.4 : BEAT * 2.3, e === 1 ? 0.2 : 0.3));
    if (e >= 2) {
      [0, 1, 2, 3].forEach((b) => kick(bus, t0 + b * BEAT, b % 2 ? 0.34 : 0.5));
      for (let s = 0; s < 8; s++) if (s % 2) noiseHit(bus, t0 + s * BEAT * 0.5, 0.05, 0.4, 0.018, true);
      [1, 3].forEach((b) => noiseHit(bus, t0 + b * BEAT, 0.085, -0.2, 0.05, false));
    }
    if (e >= 3) LEAD[bar % 4].forEach((n, b) => n && pluck(wet, midi(n), t0 + b * BEAT, 0.15, 0.15, 0.3));
    if (lastBeforeEnd) for (let s = 0; s < 4; s++) noiseHit(bus, t0 + BAR - (4 - s) * BEAT * 0.25, 0.05 + s * 0.02, 0, 0.03, false); // fill into the end card
  }
  // The ending: one resolved chord that rings out under the end card.
  const fin = [48, 55, 60, 64, 67, 74, 76];
  fin.forEach((n, k) => pluck(wet, midi(n), endStart + k * 0.018, 0.14, (k - 3) * 0.2, 0.9));
  kick(bus, endStart, 0.42); bass(bus, midi(36), endStart, 2.6, 0.22);
  pad(bus, [48, 55, 64, 71, 74].map(midi), endStart, 3.4, 0.11);
  [72, 76, 79, 84].forEach((n, k) => pluck(wet, midi(n), endStart + BEAT * (1 + k * 0.5), 0.07, 0.3 - k * 0.2, 0.5));
  // Dotted-eighth feedback delay on the tuned voices.
  const d = Math.round(BEAT * 0.75 * SR);
  for (const c of ['l', 'r']) { const src = wet[c], out = bus[c], other = wet[c === 'l' ? 'r' : 'l'];
    for (let i = 0; i < src.length; i++) { const echo = i >= d ? other[i - d] * 0.3 : 0; src[i] += echo * 0.55; out[i] += src[i]; } }
  return bus;
};

// ---- the effects ----------------------------------------------------------
const PENTA = [84, 86, 88, 91, 93, 96, 98, 100, 103];
const sfx = (bus, cue, k) => {
  const t = cue.sec, g = cue.gain;
  if (cue.role === 'type') { noiseHit(bus, t, 0.05 * g, 0.1, 0.006, true); add(bus, t, 0.05, 0.035 * g, 0.1, (x) => Math.exp(-x / 0.008) * Math.sin(2 * Math.PI * (1500 + 500 * ((k * 7) % 5) / 5) * x)); }
  if (cue.role === 'click') { add(bus, t, 0.12, 0.2 * g, 0, (x) => Math.exp(-x / 0.016) * Math.sin(2 * Math.PI * 780 * x)); noiseHit(bus, t, 0.09 * g, 0, 0.008, true); add(bus, t + 0.07, 0.1, 0.1 * g, 0, (x) => Math.exp(-x / 0.014) * Math.sin(2 * Math.PI * 1040 * x)); }
  if (cue.role === 'pop') add(bus, t, 0.4, 0.2 * g, -0.1, (x) => att(x, 0.003) * Math.exp(-x / 0.06) * Math.sin(2 * Math.PI * (300 * x + 190 * 0.05 * (1 - Math.exp(-x / 0.05)))));
  if (cue.role === 'move') { let lp = 0; add(bus, t - 0.12, 0.5, 0.13 * g, 0, (x) => { const p = x / 0.5; lp += (0.04 + 0.3 * Math.sin(Math.PI * p)) * (rnd() - lp); return Math.pow(Math.sin(Math.PI * p), 2) * lp; }); }
  if (cue.role === 'tick') { const f = midi(PENTA[k % PENTA.length]); add(bus, t, 0.5, 0.13 * g, 0.2, (x) => att(x, 0.002) * Math.exp(-x / 0.07) * (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * x) * Math.exp(-x / 0.02))); }
  if (cue.role === 'end') [84, 88, 91, 96].forEach((n, i) => add(bus, t + i * 0.05, 2.2, 0.07 * g, (i - 1.5) * 0.3, (x) => att(x, 0.003) * Math.exp(-x / 0.5) * Math.sin(2 * Math.PI * midi(n) * x)));
};

const writeWav = (file, bus, sec) => {
  const n = Math.round(sec * SR), buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(bus.l[i]), Math.abs(bus.r[i]));
  const k = peak > 0.89 ? 0.89 / peak : 1; // headroom for the measuring pass only; loudness is set below
  for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round(bus.l[i] * k * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(bus.r[i] * k * 32767), 46 + i * 4); }
  writeFileSync(file, buf);
};
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
const measured = (file) => {
  // ffmpeg prints the summary on stderr; spawnSync keeps it.
  const out = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const tail = out.slice(out.lastIndexOf('Summary:'));
  return { I: Number(tail.match(/I:\s+(-?[\d.]+) LUFS/)[1]), TP: Number(tail.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]) };
};

mkdirSync(resolve(ROOT, 'public/audio'), { recursive: true });
mkdirSync(resolve(ROOT, 'out/audio'), { recursive: true });
const report = {};
for (const cut of core.CUT_SECONDS) {
  seed = 1;
  const bus = buildBed(cut);
  const cues = core.cuesFor(cut);
  const count = {};
  let lastScene = null;
  for (const cue of cues) {
    if (cue.scene !== lastScene) { count.tick = 0; lastScene = cue.scene; }
    count[cue.role] = (count[cue.role] ?? 0) + 1;
    sfx(bus, cue, count[cue.role] - 1);
  }
  const raw = resolve(ROOT, `out/audio/raw-${cut}.wav`), final = resolve(ROOT, `public/audio/mix-${cut}.wav`);
  writeWav(raw, bus, cut);
  const before = measured(raw);
  // One linear gain to the loudness target, then a true-peak limiter as the safety net.
  const gain = TARGET.I - before.I;
  ff(['-y', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, (TARGET.TP - 0.4) / 20).toFixed(4)}:attack=2:release=40:level=disabled,afade=t=out:st=${cut - 0.25}:d=0.25`, '-ar', String(SR), '-c:a', 'pcm_s16le', final]);
  const after = measured(final);
  report[cut] = { cues: cues.length, roles: count, rawLUFS: before.I, gainDb: Number(gain.toFixed(2)), LUFS: after.I, truePeak: after.TP };
  console.log(`[audio] ${cut}s: ${cues.length} cues, ${after.I} LUFS, ${after.TP} dBTP -> ${final}`);
}
writeFileSync(resolve(ROOT, 'src/data/audio-report.json'), JSON.stringify({ bpm: core.BPM, target: TARGET, cuts: report }, null, 2) + '\n');
