// Bakes REAL product output into src/data/: one RAG tutor answer (with its
// measured stream timing) and the published capstones. Writes only its own
// two files. Costs /api/chat rate budget (30/h per IP) — run on purpose.
import { writeFileSync } from 'node:fs';
const API = 'https://programming-api.chanmeng.org';
const question = process.argv[2] ?? 'What do I build in TECHNEST 2026 Week 2?';
const t0 = performance.now();
const res = await fetch(`${API}/api/chat`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: question, contextNamespace: '2026-technest' }),
});
if (!res.ok) throw new Error(`chat HTTP ${res.status}: ${await res.text()}`);
const reader = res.body.getReader(); const dec = new TextDecoder();
let buf = '', full = ''; const chunks = [];
for (;;) {
  const { done, value } = await reader.read(); if (done) break;
  buf += dec.decode(value, { stream: true });
  const lines = buf.split('\n'); buf = lines.pop() ?? '';
  for (const l of lines) {
    if (!l.startsWith('data: ')) continue;
    const d = l.slice(6); if (d === '[DONE]') continue;
    try { const p = JSON.parse(d); if (p.response) { full += p.response; chunks.push([Math.round(performance.now() - t0), full.length]); } } catch {}
  }
}
const out = { question, contextNamespace: '2026-technest', answer: full, firstTokenMs: chunks[0]?.[0] ?? null,
  totalMs: Math.round(performance.now() - t0), chunks, source: `${API}/api/chat`, bakedAt: new Date().toISOString() };
const slot = process.argv[3] ?? 'chat-answer';
writeFileSync(new URL(`../src/data/${slot}.json`, import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`[chat] ${out.firstTokenMs} ms to first token, ${out.totalMs} ms total\n${full}\n`);
if (!process.argv[3]) {
  const cap = await (await fetch(`${API}/api/capstones`)).json();
  writeFileSync(new URL('../src/data/capstones.json', import.meta.url), JSON.stringify({ source: `${API}/api/capstones`, bakedAt: new Date().toISOString(), ...cap }, null, 2) + '\n');
  console.log('[capstones] keys', Object.keys(cap), JSON.stringify(cap).slice(0, 900));
}
