<div align="center">

# AI Programming School — Promo Film

**A 60-second film for [programming.chanmeng.org](https://programming.chanmeng.org), the free, open-source AI programming school taught by Chan Meng, made entirely in code: a replica of the site's own interface drawn in React and rendered with Remotion.**

</div>

## The film

### AI programming school product film

<!-- FILM: ai-programming-school-film · 16:9 / 60 s — Chan uploads the video here in GitHub's web editor -->

▶ Watch on YouTube: https://youtu.be/DKCzZCQTQgA

Also cut at 30 s, and both lengths in 9:16.

## How it's made

- **Coded replica, not a screen recording.** Every frame is the site's UI rebuilt as React components that are a pure function of time, so the 9:16 cut is a re-layout, not a crop.
- **Product words are checked.** Each interface string in `src/replica/strings.ts` names the product file it mirrors, and `npm run verify` fails if the wording drifts.
- **Real data, baked.** Lessons come from the site's MDX, the AI tutor's answer from the live API, awards and images from a hashed one-way sync.
- **Edits in seconds.** The edit decision lists in `src/edits/A.ts` are written in seconds; `src/timeline.ts` is the only file that converts to frames.
- **Synthesised sound.** `tools/build-audio.mjs` writes the music bed at exactly 120 BPM, so every cut lands on a bar line, plus every sound effect. No samples, no audio service.

## Make your own

Needs Node.js 22+ and `ffmpeg`/`ffprobe` on `PATH`.

```bash
npm install
npm run audio     # synthesise the music bed and effects into public/audio/
npm run render    # all four masters into out/masters/
npm run dev       # or open Remotion Studio
```

The gates (`npm run verify`) and the re-sync/bake scripts also need sibling checkouts of [ai-programming-teaching-project](https://github.com/ChanMeng666/ai-programming-teaching-project) and [ChanMeng666](https://github.com/ChanMeng666/ChanMeng666), or `PRODUCT_REPO` / `PROFILE_REPO` pointing at them.

## Licence

Code: MIT ([LICENSE](LICENSE)). Films, music, sound and other media made by Chan Meng: CC BY 4.0 ([LICENSE-MEDIA.md](LICENSE-MEDIA.md)).

Excluded, under their own terms: the school's logo and brand assets, the student project screenshots, avatars and certificate shown, the quoted LinkedIn recommendation (credited to its author, Kwame Essuman), the Inter font (SIL OFL), and npm libraries such as Remotion and React (their own licences).

More detail: [docs/overview.md](docs/overview.md)
