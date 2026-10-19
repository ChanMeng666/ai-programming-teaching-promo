# AI Programming Teaching — Promo Film

The promo film for [programming.chanmeng.org](https://programming.chanmeng.org), the free,
open-source AI programming school taught by [Chan Meng](https://chanmeng.org/). It shows
the platform she built, the students who shipped on it, and the credentials that prove it.

Nothing in the picture is a screen recording. Every frame is a **coded replica** of the
site's own interface, drawn in React as a pure function of time and rendered with
[Remotion](https://www.remotion.dev/). That is why the vertical cut is a re-layout rather
than a crop, and why the words on screen can be checked against the product's source.

## Deliverables

Two lengths × two aspect ratios, 30 fps, H.264 + AAC, mixed to −16 LUFS.

| Master | Size | Length |
|---|---|---|
| `Film-60-landscape.mp4` | 1920×1080 | 60 s |
| `Film-60-portrait.mp4` | 1080×1920 | 60 s |
| `Film-30-landscape.mp4` | 1920×1080 | 30 s |
| `Film-30-portrait.mp4` | 1080×1920 | 30 s |

Masters are written to `out/masters/` and are not committed. Rebuild them with the
commands below.

## The story

The 60-second cut runs nine scenes. The 30-second cut drops three of them (programmes,
lessons, certificate) instead of speeding everything up.

| # | Scene | What it shows |
|---|---|---|
| 1 | Hook | Chan's line, typed out: "Natural language is the source code." |
| 2 | Homepage | The navbar, the headline, a click on **Start Learning** |
| 3 | Programmes | Five programme cards landing |
| 4 | Lessons | The sidebar walking Week 1 to Week 8, then the capstone spec |
| 5 | AI tutor | A question, a streamed answer, and its two citations |
| 6 | Showcase | The three award-winning capstone projects |
| 7 | Certificate | An issued credential and its verification details |
| 8 | Instructor | "Taught by someone who still ships." and a student's recommendation |
| 9 | End card | The URL and the byline |

## What keeps it honest

- **Product words are asserted.** All 72 interface strings live in
  `src/replica/strings.ts`, each naming the product file it mirrors. The gate reads that
  file and fails if the wording differs.
- **Product data is baked, not typed.** Lessons come from the MDX frontmatter, the tutor's
  answer and the capstone list from the production API, and awards and images from a
  one-way sync with a sha256 ledger.
- **The film's own words are cleared.** Each of its 18 lines has a row in
  [`docs/copy-clearance.md`](copy-clearance.md) with the source that makes it true.
- **Time compression is captioned.** The real tutor took 17 s to answer; the film replays
  it in 3.6 s and says so on screen for at least 3 s in every cut.
- **Timing lives in seconds.** `src/timeline.ts` is the only file that converts to frames.

`npm run verify` runs eight gates over all of this, and a ninth over the rendered files
with `-- --masters`. Each gate prints what it looked at.

## Requirements

- Node.js 22 or later
- `ffmpeg` and `ffprobe` on `PATH`
- Google Chrome (used for stills; Remotion downloads its own headless shell for renders)
- Sibling checkouts of `ai-programming-teaching-project` (the site) and `ChanMeng666`
  (the profile data), or `PRODUCT_REPO` / `PROFILE_REPO` pointing at them

## Usage

```bash
npm install

npm run sync                       # copy product assets + awards, write the ledger
node tools/bake-curriculum.mjs     # bake the lesson list from the site's MDX
npm run bake                       # ask the live tutor again (uses API rate budget)

npm run audio                      # synthesise the music bed and sound effects
npm run verify                     # run the gates
npm run render                     # render all four masters to out/masters
npm run verify -- --masters        # measure the rendered files

npm run dev                        # Remotion Studio
```

Checking the picture without a full render:

```bash
npm run stills -- --comp Film-60-portrait --every 2    # one frame every 2 s
npm run stills -- --comp Film-60-landscape --handover  # frames around every cut
npm run sheet -- out/stills/Film-60-portrait/sheet 6   # tile them into a contact sheet
```

The mixes in `public/audio/` are not committed. `npm run audio` rebuilds them
deterministically, and must be re-run after any timing change: the `audio` gate compares
cue counts and fails if the mix is stale.

## Sound

The music bed and every sound effect are synthesised by `tools/build-audio.mjs`. There are
no samples and no third-party service, so there is nothing to license. The bed is written
at exactly 120 BPM, so a bar is 2 s and every cut lands on a bar line. Effects are placed
from the cue sheet the film derives from its own choreography.

## Project layout

```
src/edits/A.ts      the edit decision lists, in seconds
src/choreo.ts       each scene's choreography and the sound cues it implies
src/timeline.ts     the only frame arithmetic
src/copy.ts         the film's own words
src/replica/        product strings, design tokens, shared UI parts
src/scenes/         the nine scenes
src/data/           baked and synced data, the sync ledger, the audio report
tools/              sync, bake, audio and render scripts
capture/            the gates, stills and contact sheets
docs/               copy clearance and the rejected tutor answers
```

[`CLAUDE.md`](../CLAUDE.md) has the working rules, brand constraints and known traps.

## People shown

The film shows three award-winning student projects as the public showcase presents them,
one issued certificate, and one LinkedIn recommendation quoted verbatim. All of it is
already public; its use here is recorded in `docs/copy-clearance.md`.

## Licence

Code: MIT ([LICENSE](../LICENSE)). Media made by Chan Meng: CC BY 4.0 ([LICENSE-MEDIA.md](../LICENSE-MEDIA.md)).
