// The gate suite. Every gate executes the film's own modules (via load-core),
// prints WHAT IT LOOKED AT, and fails loudly on an empty input set — a gate whose
// inputs can go empty reports success by doing nothing.
//   node capture/verify.mjs            all gates
//   node capture/verify.mjs --masters  also measure the rendered masters in out/masters
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCore } from './lib/load-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCT = resolve(ROOT, process.env.PRODUCT_REPO ?? '../ai-programming-teaching-project');
const PROFILE = resolve(ROOT, process.env.PROFILE_REPO ?? '../ChanMeng666');
const core = await loadCore();
const read = (p) => readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(resolve(ROOT, p)));
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

const results = [];
const gate = (name, fn) => {
  const fails = [];
  let looked = '';
  try { looked = fn((msg) => fails.push(msg)) ?? ''; } catch (e) { fails.push(`threw: ${e.message}`); }
  results.push({ name, fails });
  console.log(`${fails.length ? 'FAIL' : 'ok  '}  ${name.padEnd(10)} ${looked}`);
  for (const f of fails) console.log(`        - ${f}`);
};
const nonEmpty = (n, what, fail) => { if (!n) fail(`looked at zero ${what}`); };

gate('sync', () => execFileSync('node', [resolve(ROOT, 'tools/sync-product.mjs'), '--verify'], { encoding: 'utf8' }).trim().replace('[sync:verify] ', ''));

gate('strings', (fail) => {
  const leaves = [];
  const visit = (v) => { if (v && typeof v === 'object') { if (typeof v.text === 'string' && typeof v.file === 'string') leaves.push(v); else Object.values(v).forEach(visit); } };
  visit(core.STR);
  nonEmpty(leaves.length, 'product strings', fail);
  const cache = new Map();
  for (const { text, file } of leaves) {
    if (!cache.has(file)) cache.set(file, existsSync(resolve(PRODUCT, file)) ? norm(read(resolve(PRODUCT, file))) : null);
    const src = cache.get(file);
    if (src === null) fail(`product file missing: ${file}`);
    else if (!src.includes(norm(text))) fail(`"${text.slice(0, 50)}" is not in ${file}`);
  }
  const css = read(resolve(PRODUCT, 'src/css/tokens.css')).toLowerCase();
  for (const [k, hex] of Object.entries(core.C)) if (!css.includes(hex)) fail(`token ${k} ${hex} is not in the product's tokens.css`);
  return `${leaves.length} product strings in ${cache.size} product files, ${Object.keys(core.C).length} colour tokens`;
});

gate('copy', (fail) => {
  const table = existsSync(resolve(ROOT, 'docs/copy-clearance.md')) ? read(resolve(ROOT, 'docs/copy-clearance.md')) : null;
  if (table === null) { fail('docs/copy-clearance.md is missing — that is itself a violation'); return ''; }
  const lines = [core.HOOK_LINE];
  const visit = (v) => { if (typeof v === 'string') lines.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(visit); };
  visit(core.COPY);
  nonEmpty(lines.length - 1, 'film copy lines', fail);
  for (const l of lines) if (!table.includes('`' + l + '`')) fail(`no clearance row: "${l}"`);
  if (/placeholder|lorem|todo/i.test(lines.join(' '))) fail('placeholder copy');
  return `${lines.length} film lines against docs/copy-clearance.md`;
});

gate('timeline', (fail) => {
  const files = walk(resolve(ROOT, 'src')).filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith('timeline.ts'));
  nonEmpty(files.length, 'source files', fail);
  for (const f of files) {
    const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    if (/(from|durationInFrames)=\{\s*\d/.test(code) || /\bframe\s*[<>=+\-*]=?\s*\d/.test(code)) fail(`frame literal outside timeline.ts: ${f}`);
  }
  let beats = 0;
  for (const cut of core.CUT_SECONDS) {
    const b = core.resolveCut(cut);
    beats += b.length;
    const sum = b.reduce((a, x) => a + x.sec, 0);
    if (sum !== cut) fail(`cut ${cut}: beats sum to ${sum} s`);
    if (b.reduce((a, x) => a + x.frames, 0) !== core.framesForCut(cut)) fail(`cut ${cut}: frames do not total`);
    for (const x of b) {
      if (Math.abs(x.startSec / core.BAR_SEC - Math.round(x.startSec / core.BAR_SEC)) > 1e-9) fail(`cut ${cut}: ${x.scene} starts off the bar grid at ${x.startSec} s`);
      if (x.sec < 0.5) fail(`cut ${cut}: ${x.scene} is a flash (${x.sec} s)`);
      if (x.to > core.NATURAL[x.scene] || x.from < 0 || x.to <= x.from) fail(`cut ${cut}: ${x.scene} window ${x.from}..${x.to} leaves its natural run`);
      const rate = (x.to - x.from) / x.sec;
      if (rate > 1.25 || rate < 0.8) fail(`cut ${cut}: ${x.scene} plays at ${rate.toFixed(2)}x — drop beats, do not squeeze them`);
    }
    if (b.at(-1).scene !== 'end') fail(`cut ${cut}: does not end on the end card`);
  }
  return `${files.length} source files for frame literals, ${beats} beats over cuts ${core.CUT_SECONDS.join('/')} on a ${core.BAR_SEC} s bar`;
});

gate('honesty', (fail) => {
  const seen = [];
  for (const cut of core.CUT_SECONDS) {
    const hasTutor = core.resolveCut(cut).some((b) => b.scene === 'tutor');
    const w = core.honestyWindow(cut);
    if (hasTutor && (!w || w.seconds < 3)) fail(`cut ${cut}: honesty caption up ${w ? w.seconds.toFixed(2) : 0} s (< 3 s)`);
    seen.push(`${cut}s=${w ? w.seconds.toFixed(2) + ' s' : 'no tutor beat'}`);
  }
  const chat = json('src/data/chat-answer.json');
  if (!core.COPY.honesty.includes(`${Math.round(chat.totalMs / 1000)} s`)) fail('honesty caption does not state the measured answer time');
  if (core.TUTOR.streamDur >= chat.totalMs / 1000) fail('nothing is compressed — the caption would be false');
  return `caption window per cut: ${seen.join(', ')}; real answer ${chat.totalMs} ms, shown in ${core.TUTOR.streamDur} s`;
});

gate('numbers', (fail) => {
  const chat = json('src/data/chat-answer.json'), cur = json('src/data/curriculum.json'), awards = json('src/data/awards.json'), caps = json('src/data/capstones.json');
  const cap = core.COPY.captions;
  const versions = JSON.parse(read(resolve(PRODUCT, 'versions.json')));
  if (versions.length !== 5 || !/^Five programmes/.test(cap.programs)) fail(`"Five programmes": versions.json has ${versions.length}`);
  if (cur.weeks.length !== 8 || !/^Eight /.test(cap.docs)) fail(`"Eight weeks": ${cur.weeks.length} week files baked`);
  if (!/Reference:/.test(chat.answer)) fail('the baked tutor answer cites nothing');
  if (!chat.source.includes('programming-api.chanmeng.org')) fail('the tutor answer was not baked from the production API');
  const vd = resolve(PROFILE, 'dist/video-data.json');
  if (!existsSync(vd)) fail('profile fact slice missing: ' + vd);
  else {
    const facts = JSON.parse(read(vd)).facts;
    const g = facts['teaching.graduates'].n, p = facts['teaching.products'].n;
    if (!cap.showcase.includes(`${g} graduates`) || !cap.showcase.includes(`${p} AI products`)) fail(`showcase caption disagrees with the profile (${g} graduates, ${p} products)`);
  }
  for (const a of awards.awards.slice(0, 3)) {
    const proj = caps.projects.find((x) => x.slug === a.slug);
    if (!proj) fail(`winner ${a.slug} is not in the API bake`);
    else if (proj.title !== a.title || proj.team !== a.team) fail(`winner ${a.slug}: API bake and frozen awards disagree`);
  }
  if (caps.projects.length !== awards.awards.length) fail('published projects != awards issued');
  return `versions.json (${versions.length}), ${cur.weeks.length} baked weeks, tutor bake of ${chat.bakedAt.slice(0, 10)}, profile slice, ${caps.projects.length} capstones vs frozen awards`;
});

gate('purity', (fail) => {
  const files = walk(resolve(ROOT, 'src')).filter((f) => /\.(ts|tsx)$/.test(f));
  nonEmpty(files.length, 'source files', fail);
  const bans = [/\btransition\s*:/, /\banimation\s*:/, /@keyframes/, /will-?change/i, /Math\.random/, /Date\.now/, /performance\.now/, /new Date\(/, /requestAnimationFrame/, /box-?shadow/i, /gradient\(/i, /data-theme/];
  for (const f of files) {
    const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    for (const b of bans) if (b.test(code)) fail(`${b} in ${f}`);
  }
  return `${files.length} source files for clocks, CSS animation, shadows and gradients`;
});

gate('audio', (fail) => {
  const rep = json('src/data/audio-report.json');
  const seen = [];
  for (const cut of core.CUT_SECONDS) {
    const r = rep.cuts[cut], file = resolve(ROOT, `public/audio/mix-${cut}.wav`);
    if (!r || !existsSync(file)) { fail(`cut ${cut}: no mix`); continue; }
    const cues = core.cuesFor(cut);
    if (!cues.length) fail(`cut ${cut}: empty cue sheet`);
    if (cues.length !== r.cues) fail(`cut ${cut}: mix was built from ${r.cues} cues, the film now derives ${cues.length} — rebuild the audio`);
    if (cues.some((c) => Math.abs(c.sec * core.FPS - Math.round(c.sec * core.FPS)) > 1e-6)) fail(`cut ${cut}: a cue is not frame-quantised`);
    if (Math.abs(r.LUFS - rep.target.I) > 0.5) fail(`cut ${cut}: ${r.LUFS} LUFS`);
    if (r.truePeak > rep.target.TP) fail(`cut ${cut}: ${r.truePeak} dBTP`);
    seen.push(`${cut}s: ${cues.length} cues, ${r.LUFS} LUFS, ${r.truePeak} dBTP`);
  }
  return seen.join(' · ');
});

if (process.argv.includes('--masters')) {
  gate('masters', (fail) => {
    const dir = resolve(ROOT, 'out/masters');
    const seen = [];
    for (const d of core.DELIVERABLES) {
      const f = resolve(dir, `${d.id}.mp4`);
      if (!existsSync(f)) { fail(`missing ${d.id}.mp4`); continue; }
      const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', f], { encoding: 'utf8' }));
      const v = probe.streams.find((s) => s.codec_type === 'video');
      const frames = Number(v.nb_frames);
      if (v.width !== d.w || v.height !== d.h) fail(`${d.id}: ${v.width}x${v.height}`);
      if (frames !== core.framesForCut(d.cut)) fail(`${d.id}: ${frames} frames`);
      const err = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
      const tail = err.slice(err.lastIndexOf('Summary:'));
      const I = Number(tail.match(/I:\s+(-?[\d.]+) LUFS/)[1]), TP = Number(tail.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]);
      if (Math.abs(I + 16) > 0.5) fail(`${d.id}: ${I} LUFS`);
      if (TP > -1.5) fail(`${d.id}: ${TP} dBTP`);
      seen.push(`${d.id} ${v.width}x${v.height} ${frames}f ${I} LUFS ${TP} dBTP (modified ${statSync(f).mtime.toISOString().slice(11, 19)}Z)`);
    }
    return '\n        ' + seen.join('\n        ');
  });
}

const bad = results.filter((r) => r.fails.length);
console.log(bad.length ? `\n${bad.length} gate(s) failing` : `\nall ${results.length} gates green`);
process.exit(bad.length ? 1 : 0);
