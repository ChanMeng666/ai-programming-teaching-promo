// Tiles whatever stills are on disk into a contact sheet. Separate process on purpose:
// a step that takes seconds and depends only on files must not be downstream of a render.
//   node capture/sheet.mjs <dir> [cols]
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(process.argv[2]);
const cols = Number(process.argv[3] ?? 5);
const files = readdirSync(dir).filter((f) => /^\d{3}-.*\.jpg$/.test(f)).sort();
if (!files.length) { console.error('FAIL no stills in ' + dir); process.exit(1); }
const out = resolve(dir, '..', `${dir.split(/[\\/]/).pop()}-sheet.jpg`);
// This ffmpeg build has no glob support, so the frames go in through a concat list.
writeFileSync(resolve(dir, 'list.txt'), files.map((f) => `file '${f}'\nduration 1\n`).join(''));
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt',
  '-vf', `scale=${process.argv[4] ?? 480}:-1,tile=${cols}x${Math.ceil(files.length / cols)}:padding=6:color=0x2c2e2a`, '-frames:v', '1', '-q:v', '3', out], { cwd: dir });
console.log(`[sheet] ${files.length} frames -> ${out}`);
