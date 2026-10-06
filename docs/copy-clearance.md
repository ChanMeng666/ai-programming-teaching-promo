# Copy clearance

Every word the film says **in its own voice** (`src/copy.ts`, plus the opening line in
`src/choreo.ts`) has a row here, with the source that makes it true. `npm run verify`
fails on a line with no row. The product's own words are a separate matter: they live in
`src/replica/strings.ts` and are asserted against the product's source files.

Paths under `ChanMeng666/` are in the profile repo; all others are in
`ai-programming-teaching-project/`.

| On-screen text | Source | Flag |
|---|---|---|
| `Natural language is the source code.` | Chan's own line — `ChanMeng666/data/profile/10-career.yaml:426`, `cv/extended.typ:507` | |
| `Chan Meng — AI Agent Architect & Full-stack Engineer` | `src/components/Home/Instructor/index.js` (id-card role, shipped) | |
| `A free, open-source school for building with AI.` | Site: "keeps every lesson free", "Apache-2.0 open source" (`Home/Instructor`), "Learn to build with AI." (`Home/Hero`) | "school" is the film's word for the site |
| `Five programmes since 2024. Every lesson free, in English and Chinese.` | `versions.json` (5 entries); `Home/Instructor`: "five cohorts since 2024", "free and in both languages"; locales `en` + `zh-Hans` | gated: count read from `versions.json` |
| `Eight project-first weeks, then a four-week capstone.` | `Home/Programs`: "an eight-week, project-first path"; `capstone-spec.mdx`: "Over four weeks (9–12)" | gated: 8 week files baked |
| `An AI tutor that answers from the lessons, and cites them.` | `worker/src/rag.ts` (retrieval over `docs-index`); the baked answer carries two `— Reference:` lines | gated: baked answer must contain a reference |
| `A real answer from the live tutor. It took 17 s; shown faster.` | `src/data/chat-answer.json` — `totalMs` measured by `tools/bake-live.mjs` against the production API | honesty caption; number derived, never typed |
| `Built and run by the instructor` | `ChanMeng666/data/profile/23-projects-oss-more.yaml:888` ("211 of 220 non-merge commits solo") | |
| `Cloudflare Workers AI` | `worker/wrangler.toml` (`AI` binding) | |
| `Vectorize` | `worker/wrangler.toml` (`VECTORIZE`, index `docs-index`) | |
| `Llama 3.1 8B` | `worker/src/chat.ts` (`@cf/meta/llama-3.1-8b-instruct-fp8`) | |
| `TECHNEST 2026: 30 graduates, 6 AI products deployed.` | `ChanMeng666/dist/video-data.json` — `teaching.graduates` = 30, `teaching.products` = 6 | gated against that file |
| `Every project earned a credential anyone can verify.` | `src/pages/capstone-showcase.js`: "Every project earned a credential"; public `/certificate/*` verification pages | |
| `Chan has a rare talent for making complex AI concepts accessible and intuitive.` | LinkedIn recommendation, verbatim — `ChanMeng666/data/profile/50-references.yaml` (Kwame Essuman, given 2026-08-10) | **needs Chan's call**: a named student quote in a promo |
| `Kwame Essuman, TECHNEST 2026 graduate` | Same entry ("taught and mentored by Chan in TechNest AI Cohort 3"); awardee in `src/data/awards.json` | **needs Chan's call** (as above) |
| `programming.chanmeng.org` | `docusaurus.config.js` (`url`) | |
| `Taught by Chan Meng` | `src/data/awards.json` (`instructor`) | |
| `chanmeng.org` | `Home/Instructor` links to `https://chanmeng.org/` | |

## People shown

Three award-winning student projects appear exactly as the public showcase shows them
(name, project screenshot, avatar where the site has one, live like count), and one
issued certificate is shown in full. All of it is already public on
`programming.chanmeng.org`; putting it in a promotional film is still a new use, so it is
**flagged for Chan's decision** rather than assumed.

## Deliberately not claimed

Drawn from the profile repo's own claim rules: no "Instructor" for Her Waka (the role was
curriculum author), no mentor-award line (self-attested, no artefact), no follower or star
counts (date-bound), no "certified", no audience-age claims, no superlatives.
