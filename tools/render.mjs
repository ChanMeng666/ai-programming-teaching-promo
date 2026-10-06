// Renders the masters: bundle once, one composition at a time, into out/masters.
//   node tools/render.mjs                      every deliverable
//   node tools/render.mjs Film-60-landscape    just the named ones
// Prints each output's mtime — a file existing is not evidence this run wrote it.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCore } from '../capture/lib/load-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const core = await loadCore();
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const todo = core.DELIVERABLES.filter((d) => !only.length || only.includes(d.id));
if (!todo.length) { console.error('FAIL nothing to render — known ids: ' + core.DELIVERABLES.map((d) => d.id).join(', ')); process.exit(1); }

mkdirSync(resolve(ROOT, 'out/masters'), { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve(ROOT, 'src/index.ts') });
for (const d of todo) {
  const started = Date.now();
  const composition = await selectComposition({ serveUrl, id: d.id });
  const outputLocation = resolve(ROOT, 'out/masters', `${d.id}.mp4`);
  await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation, crf: 17, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '256k',
    imageFormat: 'jpeg', jpegQuality: 95, concurrency: 3, chromiumOptions: { gl: 'angle' } });
  const st = statSync(outputLocation);
  console.log(`[render] ${d.id}: ${(st.size / 1e6).toFixed(1)} MB in ${((Date.now() - started) / 1000).toFixed(0)} s, modified ${st.mtime.toISOString()}`);
}
