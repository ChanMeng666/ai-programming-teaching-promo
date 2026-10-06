// Every word the FILM says in its own voice (the product's own words live in
// src/replica/strings.ts). Each line has a row in docs/copy-clearance.md with
// the source that makes it true; capture/verify.mjs fails on a line with no row.

import { REAL_ANSWER_SECONDS, type SceneId } from './choreo';

export const COPY = {
  hookBy: 'Chan Meng — AI Agent Architect & Full-stack Engineer',
  captions: {
    home: 'A free, open-source school for building with AI.',
    programs: 'Five programmes since 2024. Every lesson free, in English and Chinese.',
    docs: 'Eight project-first weeks, then a four-week capstone.',
    tutor: 'An AI tutor that answers from the lessons, and cites them.',
    showcase: 'TECHNEST 2026: 30 graduates, 6 AI products deployed.',
    cert: 'Every project earned a credential anyone can verify.',
  } as Partial<Record<SceneId, string>>,
  honesty: `A real answer from the live tutor. It took ${REAL_ANSWER_SECONDS} s; shown faster.`,
  stackLabel: 'Built and run by the instructor',
  stack: ['Cloudflare Workers AI', 'Vectorize', 'Llama 3.1 8B'],
  quote: 'Chan has a rare talent for making complex AI concepts accessible and intuitive.',
  quoteBy: 'Kwame Essuman, TECHNEST 2026 graduate',
  endUrl: 'programming.chanmeng.org',
  endBy: 'Taught by Chan Meng',
  endSite: 'chanmeng.org',
} as const;
