// The choreography of every scene, in SCENE-LOCAL SECONDS. React-free: the scenes
// paint from these numbers and the audio build derives its cue sheet from the
// same ones, so a sound can never be hand-placed away from the thing it scores.

import chat from './data/chat-answer.json';

export type SceneId = 'hook' | 'home' | 'programs' | 'docs' | 'tutor' | 'showcase' | 'cert' | 'instructor' | 'end';
export type Role = 'type' | 'click' | 'pop' | 'move' | 'tick' | 'end';
export type SceneCue = { at: number; role: Role; gain?: number };

/** The line the film opens on — Chan's own, see docs/copy-clearance.md. */
export const HOOK_LINE = 'Natural language is the source code.';

export const HOOK = { typeAt: -0.1, cps: 17, byAt: 2.5 };
export const HOME = { navAt: 0, eyebrowAt: 0.15, titleAt: 0.3, subAt: 0.85, ctaAt: 1.15, artAt: 0.55, cursorFrom: 2.3, clickAt: 3.5, scrollAt: 4.1 };
export const PROGRAMS = { headAt: -0.2, featuredAt: 0.25, cardsAt: 1.0, cardGap: 0.2, panFrom: 1.6 };
/** Sidebar walk: week i goes active at walkAt + i * walkGap; then the capstone. */
export const DOCS = { walkAt: 1.0, walkGap: 0.5, weeks: 8, get capAt() { return this.walkAt + this.weeks * this.walkGap; } };

const Q = chat.question;
export const TUTOR = (() => {
  const openAt = 0.7;
  const typeAt = 1.7;
  const cps = 20;
  const sendAt = typeAt + Q.length / cps + 0.35;
  const streamAt = sendAt + 0.9;
  const streamDur = 3.6;
  return { cursorFrom: 0.1, openAt, pushAt: 1.0, typeAt, cps, sendAt, dotsAt: sendAt + 0.15, streamAt, streamDur, refsAt: streamAt + streamDur + 0.15 };
})();

export const SHOWCASE = { heroAt: 0, scrollAt: 1.9, cardsAt: 2.5, cardGap: 0.25, countAt: 3.3, cursorFrom: 5.6, clickAt: 6.9 };
export const CERT = { headAt: -0.3, cardAt: 0.1, toCertAt: 0.2, toFactsAt: 2.8, actionsAt: 3.1, rowsAt: 3.5, rowGap: 0.13, clickAt: 5.0 };
export const INSTRUCTOR = { headAt: 0.1, bodyAt: 0.8, cardAt: 0.5, chipsAt: 1.2, chipGap: 0.18, quoteAt: 2.6 };
export const END = { bandAt: 0.1, markAt: 0.25, titleAt: 0.5, urlAt: 1.0, byAt: 1.5 };

/** How long each scene's own clock runs when played at natural speed. */
export const NATURAL: Record<SceneId, number> = {
  hook: 4, home: 6, programs: 6, docs: 8, tutor: 10, showcase: 8, cert: 6, instructor: 6, end: 6,
};

const typing = (at: number, cps: number, len: number, every = 3): SceneCue[] =>
  Array.from({ length: Math.ceil(len / every) }, (_, i) => ({ at: at + (i * every) / cps, role: 'type' as const }));

/** What makes a sound in each scene, in scene-local seconds. */
export const SCENE_CUES: Record<SceneId, SceneCue[]> = {
  hook: typing(Math.max(0, HOOK.typeAt), HOOK.cps, HOOK_LINE.length, 2),
  home: [{ at: HOME.navAt, role: 'move' }, { at: HOME.titleAt, role: 'pop' }, { at: HOME.clickAt, role: 'click' }, { at: HOME.scrollAt, role: 'move' }],
  programs: [{ at: PROGRAMS.featuredAt, role: 'pop' }, ...[0, 1, 2, 3].map((i) => ({ at: PROGRAMS.cardsAt + i * PROGRAMS.cardGap, role: 'pop' as const, gain: 0.7 }))],
  docs: [...Array.from({ length: DOCS.weeks }, (_, i) => ({ at: DOCS.walkAt + i * DOCS.walkGap, role: 'tick' as const })), { at: DOCS.capAt, role: 'pop' }],
  tutor: [{ at: TUTOR.openAt, role: 'click' }, { at: TUTOR.pushAt, role: 'move' }, ...typing(TUTOR.typeAt, TUTOR.cps, Q.length),
    { at: TUTOR.sendAt, role: 'click' }, { at: TUTOR.streamAt, role: 'pop', gain: 0.6 }, { at: TUTOR.refsAt, role: 'tick' }],
  showcase: [{ at: SHOWCASE.scrollAt, role: 'move' }, ...[0, 1, 2].map((i) => ({ at: SHOWCASE.cardsAt + i * SHOWCASE.cardGap, role: 'pop' as const })),
    { at: SHOWCASE.clickAt, role: 'click' }],
  cert: [{ at: CERT.cardAt, role: 'pop' }, { at: CERT.toFactsAt, role: 'move' },
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ at: CERT.rowsAt + i * CERT.rowGap, role: 'tick' as const, gain: 0.6 })), { at: CERT.clickAt, role: 'click' }],
  instructor: [{ at: INSTRUCTOR.cardAt, role: 'pop' }, ...[0, 1, 2].map((i) => ({ at: INSTRUCTOR.chipsAt + i * INSTRUCTOR.chipGap, role: 'tick' as const })),
    { at: INSTRUCTOR.quoteAt, role: 'pop' }],
  end: [{ at: END.bandAt, role: 'move' }, { at: END.markAt, role: 'end' }],
};

/**
 * The real tutor took `chat.totalMs` to answer; the film replays it in
 * TUTOR.streamDur. That compression is a claim unless it is captioned, so the
 * caption's window is derived here and gated to be >= 3 s in every cut.
 */
export const HONESTY = { scene: 'tutor' as SceneId, from: TUTOR.sendAt, to: NATURAL.tutor };
export const REAL_ANSWER_SECONDS = Math.round(chat.totalMs / 1000);
