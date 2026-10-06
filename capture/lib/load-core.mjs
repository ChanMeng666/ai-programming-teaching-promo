// Bundles the film's own React-free modules with esbuild and executes them in
// Node, so the gates and the audio build test the real code, not a re-derivation.
// If a React import creeps into one of these, esbuild fails loudly — the tripwire.
import { build } from 'esbuild';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const loadCore = async () => {
  const entry = `export * from './src/timeline'; export * from './src/layout-core'; export * from './src/choreo';
export { EDITS, BPM } from './src/edits/A'; export { COPY } from './src/copy'; export { STR, shown } from './src/replica/strings'; export { C } from './src/replica/tokens';`;
  const res = await build({ stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false,
    external: ['react', 'remotion'], logLevel: 'silent' });
  const code = res.outputFiles[0].text;
  if (/from\s+["'](react|remotion)/.test(code)) throw new Error('core modules must stay React- and Remotion-free');
  mkdirSync(resolve(ROOT, 'out'), { recursive: true });
  const file = resolve(ROOT, 'out/.core.mjs');
  writeFileSync(file, code);
  return import(pathToFileURL(file).href + `?t=${Date.now()}`);
};
