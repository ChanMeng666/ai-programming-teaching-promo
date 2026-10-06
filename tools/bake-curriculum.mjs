// Bakes the TECHNEST 2026 lesson list out of the product's own MDX frontmatter
// into src/data/curriculum.json. Byte-idempotent; writes only its own file.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = resolve(ROOT, process.env.PRODUCT_REPO ?? '../ai-programming-teaching-project', 'versioned_docs/version-2026-technest');
const read = (rel) => {
  const src = readFileSync(resolve(DOCS, rel), 'utf8').replace(/\r\n/g, '\n');
  const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (k) => fm.match(new RegExp('^' + k + ':[ ]*(.*)$', 'm'))?.[1]?.trim().replace(/^"|"$/g, '') ?? null;
  const objectives = (src.split(/^## Learning Objectives$/m)[1] ?? '').split(/^## /m)[0]
    .split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).replace(/\*\*/g, '').replace(/`/g, ''));
  return { file: `versioned_docs/version-2026-technest/${rel}`, sidebarLabel: field('sidebar_label') ?? field('title'),
    h1: src.match(/^# (.+)$/m)?.[1] ?? null, description: field('description'), objectives };
};
const weeks = readdirSync(resolve(DOCS, 'weeks')).filter((f) => /^week-\d\d/.test(f)).sort().map((f) => read(`weeks/${f}`));
const capstone = read('capstone/capstone-spec.mdx');
const spec = readFileSync(resolve(DOCS, 'capstone/capstone-spec.mdx'), 'utf8').replace(/\r\n/g, '\n');
capstone.kicker = spec.match(/^> \*\*(.+)\*\*$/m)?.[1] ?? null;
capstone.objective = (spec.split(/^## Objective$/m)[1] ?? '').trim().split('\n')[0];
writeFileSync(resolve(ROOT, 'src/data/curriculum.json'), JSON.stringify({ version: 'TECHNEST 2026', weeks, capstone }, null, 2) + '\n');
console.log(`[curriculum] ${weeks.length} weeks`); for (const w of weeks) console.log(' ', w.sidebarLabel, '|', w.h1, '|', w.objectives.length);
console.log(' ', capstone.sidebarLabel, '|', capstone.h1, '|', capstone.kicker, '|', capstone.objective);
