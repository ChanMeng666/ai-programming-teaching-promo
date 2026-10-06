// One-way sync of the product's own assets + frozen data into the film repo,
// with a sha256 ledger (src/data/product-lock.json). Plan first, write second.
// The copies are never edited here — fix upstream and re-sync.
//   node tools/sync-product.mjs            copy + write the ledger
//   node tools/sync-product.mjs --verify   re-hash, fail on drift / missing / empty ledger
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCT = resolve(ROOT, process.env.PRODUCT_REPO ?? '../ai-programming-teaching-project');
const LOCK = resolve(ROOT, 'src/data/product-lock.json');

// [product path, film path, role]
const FILES = [
  ['src/data/awards.json', 'src/data/awards.json', 'data: frozen TECHNEST 2026 awards'],
  ['static/img/brand/logo.svg', 'public/img/logo.svg', 'brand mark'],
  ['static/img/chan_logo_without_brand_black.svg', 'public/img/chan-mark.svg', 'instructor mark'],
  ['static/img/illustrations/hero.webp', 'public/img/hero.webp', 'illustration'],
  ['static/img/illustrations/home-build.webp', 'public/img/home-build.webp', 'illustration'],
  ['static/img/illustrations/home-learn.webp', 'public/img/home-learn.webp', 'illustration'],
  ['static/img/illustrations/home-community.webp', 'public/img/home-community.webp', 'illustration'],
  ['static/img/illustrations/capstone.webp', 'public/img/capstone.webp', 'illustration'],
  ['static/img/illustrations/footer-accent.webp', 'public/img/footer-accent.webp', 'illustration'],
  ['static/img/certificates/linguapath.webp', 'public/img/cert-linguapath.webp', 'certificate render (issued credential)'],
  ['static/img/capstone/linguapath.webp', 'public/img/cap-linguapath.webp', 'student project screenshot'],
  ['static/img/capstone/joborg-ai.webp', 'public/img/cap-joborg-ai.webp', 'student project screenshot'],
  ['static/img/capstone/icare.webp', 'public/img/cap-icare.webp', 'student project screenshot'],
  ['static/img/capstone/avatars/abiodun-oyedele.webp', 'public/img/avatar-joborg-ai.webp', 'student avatar'],
  ['static/img/capstone/avatars/ikenna-anasieze.webp', 'public/img/avatar-icare.webp', 'student avatar'],
];

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const verify = process.argv.includes('--verify');

if (verify) {
  if (!existsSync(LOCK)) { console.error('FAIL no ledger'); process.exit(1); }
  const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
  if (!lock.files?.length) { console.error('FAIL empty ledger — it would verify nothing'); process.exit(1); }
  let bad = 0;
  for (const f of lock.files) {
    const p = resolve(ROOT, f.to);
    const got = existsSync(p) ? sha(p) : 'MISSING';
    if (got !== f.sha256) { bad++; console.error(`DRIFT ${f.to}: ${got.slice(0, 12)} != ${f.sha256.slice(0, 12)}`); }
  }
  const stale = existsSync(PRODUCT) ? lock.files.filter((f) => existsSync(resolve(PRODUCT, f.from)) && sha(resolve(PRODUCT, f.from)) !== f.sha256) : [];
  for (const f of stale) console.warn(`STALE (product moved on): ${f.from}`);
  console.log(`[sync:verify] looked at ${lock.files.length} files from ${lock.commit.slice(0, 8)} — ${bad} drifted, ${stale.length} stale`);
  process.exit(bad ? 1 : 0);
}

const missing = FILES.filter(([from]) => !existsSync(resolve(PRODUCT, from)));
if (missing.length) { console.error('FAIL missing in product, nothing copied:\n' + missing.map((m) => '  ' + m[0]).join('\n')); process.exit(1); }
const git = (c) => execSync(`git -C "${PRODUCT}" ${c}`).toString().trim();
const files = FILES.map(([from, to, role]) => {
  mkdirSync(dirname(resolve(ROOT, to)), { recursive: true });
  copyFileSync(resolve(PRODUCT, from), resolve(ROOT, to));
  const p = resolve(ROOT, to);
  return { from, to, role, bytes: readFileSync(p).length, sha256: sha(p) };
});
writeFileSync(LOCK, JSON.stringify({ product: 'ai-programming-teaching-project', commit: git('rev-parse HEAD'),
  branch: git('rev-parse --abbrev-ref HEAD'), dirty: git('status --porcelain') !== '', syncedAt: new Date().toISOString(), files }, null, 2) + '\n');
console.log(`[sync] ${files.length} files, ledger written`);
