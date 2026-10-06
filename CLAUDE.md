# CLAUDE.md — AI Programming Teaching «Learn to build»

The promo film for `programming.chanmeng.org`, whose job is to show Chan Meng's strength
as an AI programming instructor and as the engineer who built the platform.
Two lengths (30 / 60 s) × two aspect ratios (16:9, 9:16) = **four masters**, Remotion
4.0.522, 30 fps. Method inherited from `../archcanvas-promo-studio`.

Nothing on screen is a screen recording. It is a **coded replica** of the site — navbar,
homepage, programme cards, a lesson page, the chat widget, the capstone showcase, a
credential page — drawn as a pure function of time, so 9:16 is a re-layout, not a crop.

## The four laws

1. **Nothing on screen is mocked up.** Product words live in `src/replica/strings.ts`, each
   naming the product file it mirrors, and `verify` asserts the literal is in that file.
   Lessons are baked from the MDX (`tools/bake-curriculum.mjs`), the tutor's answer and the
   capstones from the **production API** (`tools/bake-live.mjs`), awards and images are a
   one-way sync with a sha256 ledger (`tools/sync-product.mjs`). Never edit a baked or
   synced file — fix upstream and re-run.
2. **Every word the film says itself is cleared** in `docs/copy-clearance.md`, with its
   source. A line with no row fails the build.
3. **Time compression is captioned.** The real tutor took 17 s; the film shows it in 3.6 s
   and says so on screen for ≥ 3 s in every cut. The number is derived from the bake.
4. **Intent in seconds; one file converts.** EDLs are in `src/edits/A.ts`; `src/timeline.ts`
   is the only frame arithmetic and the only file allowed a frame literal.

## Brand constraints (MindMarket — see the site's `DESIGN.md`)

Cream ground, ink type, Inter only. **No shadows, no gradients** (gated). Green is a
structural accent, never a large fill; coral buttons carry ink text; accents are never
semantic. The film's own voice is an **ink pill** so it never reads as the product's UI.
The instructor is shown by her mark, not a portrait (the site's own choice; the profile
repo forbids AI-generated portraits).

## Structure

```
src/layout-core.ts   FPS, cut lengths, the 4 DELIVERABLES, design boxes        [React-free]
src/edits/A.ts       the EDLs, in SECONDS, each beat with its `why`            [React-free]
src/choreo.ts        every scene's choreography + the sound cues it implies    [React-free]
src/timeline.ts      the ONLY frame arithmetic; cue sheet + honesty window     [React-free]
src/copy.ts          the film's own words                                      [React-free]
src/motion.ts        springs, easings, typing, the seeded hash                 [React-free]
src/replica/         strings (asserted), tokens (asserted), shared parts
src/scenes/          the nine scenes: ({ t, L }) -> pixels. No hooks, no clocks.
src/Film.tsx         <Sequence> per beat + captions + the wipe + one <Audio>
src/data/            baked + synced data, product-lock.json, audio-report.json
tools/               sync-product · bake-live · bake-curriculum · build-audio · render
capture/             verify (the gates) · stills · sheet · lib/load-core
```

The React-free files are bundled and executed in Node by `capture/lib/load-core.mjs`, so
the gates and the audio build run the film's real code. Keep them React-free.

## Commands

```bash
npm run sync && node tools/bake-curriculum.mjs   # after the product changes
npm run bake                                     # re-ask the live tutor (costs rate budget)
npm run audio                                    # re-synthesise bed + effects (after ANY timing change)
npm run verify                                   # 8 gates; add `-- --masters` after a render
npm run stills -- --comp Film-60-portrait --every 2      # then: npm run sheet -- out/stills/<comp>/sheet 6
npm run stills -- --comp Film-60-landscape --handover    # frames around every cut
npm run render                                   # all four -> out/masters
```

## Sound

Entirely synthesised by `tools/build-audio.mjs` — no samples, no service, nothing to
license. The bed is written at exactly 120 BPM (a bar is 2.000 s, so every cut sits on a
bar line by construction) and arranged from the cut's own scene list; effects come from the
cue sheet the film derives, at frame-quantised starts, so the offline mix *is* the
composition. One `<Audio>` per master. Target −16 LUFS ±0.5, true peak ≤ −1.5 dBTP.
To swap in a SUNO take later: generate at a stated 120 BPM, measure its real downbeats,
and replace the bed inside `buildBed` — do not assume `bpm × n` for a generated take.

## Traps already paid for

- This ffmpeg build has **no glob**; `capture/sheet.mjs` uses a concat list.
- Chain heredocs break on some payloads in this shell — write source files directly.
- The tutor (Llama 3.1 8B) is often wrong. Three of six sampled answers misattributed
  weeks or invented a reference; the rejects are kept in `docs/evidence/`. Only bake an
  answer you have checked against the lesson it cites.
- `showcase` shows the **live** like count from the API bake (67), the certificate page the
  **frozen** vote count (66). Both are real; do not "reconcile" them.
- Timing changed? Rebuild the audio — the `audio` gate compares cue counts and goes red.
