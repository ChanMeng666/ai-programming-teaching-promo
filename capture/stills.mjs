// The look loop. One bundle, one browser, sequential, per composition.
//   node capture/stills.mjs --comp Film-60-landscape                 one frame per --every s (default 1)
//   node capture/stills.mjs --comp Film-60-landscape --at 7.4,9.1    ad-hoc seconds
//   node capture/stills.mjs --comp Film-60-landscape --handover      -0.2 / +0.1 / +0.4 s around every cut
// Frames are named by contiguous index with the second as a suffix; tiling is a
// separate step (capture/sheet.mjs) so a dead render never takes the sheet with it.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCore } from './lib/load-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i < 0 ? d : process.argv[i + 1] ?? true; };
const comp = arg('comp', 'Film-60-landscape');
const cut = Number(comp.split('-')[1]);
const core = await loadCore();
let secs;
if (arg('at')) secs = String(arg('at')).split(',').map(Number);
else if (process.argv.includes('--handover')) secs = core.resolveCut(cut).slice(1).flatMap((b) => [b.startSec - 0.2, b.startSec + 0.1, b.startSec + 0.4]);
else { const every = Number(arg('every', 1)); secs = Array.from({ length: Math.floor(cut / every) }, (_, i) => i * every + (i === 0 ? 0 : 0)); }
const tag = arg('at') ? 'at' : process.argv.includes('--handover') ? 'handover' : 'sheet';
const outDir = resolve(ROOT, 'out/stills', comp, tag);
rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: resolve(ROOT, 'src/index.ts') });
const browser = await openBrowser('chrome');
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
for (const [i, sec] of secs.entries()) {
  const frame = Math.min(composition.durationInFrames - 1, Math.max(0, core.secToFrame(sec)));
  const output = resolve(outDir, `${String(i).padStart(3, '0')}-${sec.toFixed(2)}s.jpg`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 88, puppeteerInstance: browser, scale: Number(arg('scale', 0.5)) });
}
await browser.close({ silent: true });
console.log(`[stills] ${comp}: ${secs.length} frames -> ${outDir}`);
