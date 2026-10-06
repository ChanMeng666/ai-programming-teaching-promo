// Edit A — one EDL per cut length, in SECONDS. Never frames: src/timeline.ts is
// the only file that converts. The bed is synthesised at exactly 120 BPM, so a
// bar is 2.000 s and every boundary below sits on a bar line by construction
// (capture/verify.mjs asserts it rather than trusting this comment).

import type { SceneId } from '../choreo';

export type Edit = {
  scene: SceneId;
  /** Beat length — intent, in seconds. */
  sec: number;
  /** Window into the scene's own clock; defaults to its whole natural run. */
  from?: number;
  to?: number;
  /** Why this beat is this long — read in review. */
  why: string;
};

export const BPM = 120;

export const EDITS: Record<30 | 60, Edit[]> = {
  60: [
    { scene: 'hook', sec: 4, why: '6 words typed at 17 cps = 2.1 s, then 1.5 s to read the byline.' },
    { scene: 'home', sec: 6, why: 'Headline + subtitle read (~22 words, 5.7 s) overlaps the click at 3.5 s.' },
    { scene: 'programs', sec: 6, why: 'Five cards land by 1.8 s; 4 s to read five titles and the caption.' },
    { scene: 'docs', sec: 8, why: 'Eight weeks, one per beat (4 s), then 3 s on the capstone page the tutor is about to be asked about.' },
    { scene: 'tutor', sec: 10, why: 'The money shot: question, wait, a 77-word real answer streaming, its two citations. Honesty caption needs >= 3 s.' },
    { scene: 'showcase', sec: 8, why: 'Title (2 s), three winners land and count up (3 s), cursor to Certificate (2 s).' },
    { scene: 'cert', sec: 6, why: 'The certificate itself (2.6 s), then six credential rows and the LinkedIn action.' },
    { scene: 'instructor', sec: 6, why: 'Who taught it: heading + three chips, then a student quote with 3 s to read.' },
    { scene: 'end', sec: 6, why: 'Resting frame; the bed rings out under it.' },
  ],
  30: [
    { scene: 'hook', sec: 2, from: 1.4, to: 3.4, why: 'Opens with the line two-thirds typed, so it is whole for a full second before the wipe.' },
    { scene: 'home', sec: 4, to: 4.1, why: 'Headline and the click; the scroll-away is dropped.' },
    { scene: 'tutor', sec: 8, from: 0.4, to: 9.6, why: 'The main demonstration at 1.15x; the docs walk is dropped, not shortened.' },
    { scene: 'showcase', sec: 6, from: 1.6, to: 7.6, why: 'Straight to the winners.' },
    { scene: 'instructor', sec: 4, from: 1.0, to: 5.6, why: 'Enters under the wipe with the heading already set, so the quote gets 2.3 s.' },
    { scene: 'end', sec: 6, why: 'Resting frame.' },
  ],
};
