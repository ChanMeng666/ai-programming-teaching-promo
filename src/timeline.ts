// The ONLY frame arithmetic in the repo, and the only file allowed a frame
// literal. Intent lives in seconds (src/edits); this converts once, with the
// last beat absorbing the rounding so the total is exact.

import { HONESTY, NATURAL, SCENE_CUES, type Role, type SceneId } from './choreo';
import { BPM, EDITS, type Edit } from './edits/A';
import { FPS, type Cut } from './layout-core';

export const secToFrame = (sec: number) => Math.round(sec * FPS);
export const frameToSec = (frame: number) => frame / FPS;
export const framesForCut = (cut: Cut) => secToFrame(cut);
export const BAR_SEC = (60 / BPM) * 4;

export type Beat = Edit & {
  index: number;
  startSec: number;
  startFrame: number;
  frames: number;
  from: number;
  to: number;
};

export const resolveCut = (cut: Cut): Beat[] => {
  const edits = EDITS[cut];
  let acc = 0;
  const beats = edits.map((e, index) => {
    const startSec = acc;
    acc += e.sec;
    return { ...e, index, startSec, startFrame: secToFrame(startSec), frames: 0, from: e.from ?? 0, to: e.to ?? NATURAL[e.scene] };
  });
  const total = framesForCut(cut);
  beats.forEach((b, i) => {
    b.frames = (i + 1 < beats.length ? beats[i + 1].startFrame : total) - b.startFrame;
  });
  return beats;
};

/** The scene's own clock at a SEQUENCE-LOCAL frame of one beat. */
export const sceneClock = (beat: Beat, localFrame: number) =>
  beat.from + (beat.to - beat.from) * Math.min(1, Math.max(0, frameToSec(localFrame) / beat.sec));

/** Film seconds at which a scene-local second happens in a beat (null if cut away). */
export const filmSecOf = (beat: Beat, sceneSec: number) =>
  sceneSec < beat.from || sceneSec > beat.to ? null : beat.startSec + ((sceneSec - beat.from) / (beat.to - beat.from)) * beat.sec;

export type Cue = { sec: number; frame: number; role: Role; gain: number; scene: SceneId };

/** The cue sheet, DERIVED by walking the cut. Starts are frame-quantised. */
export const cuesFor = (cut: Cut): Cue[] =>
  resolveCut(cut).flatMap((beat) => [
    ...(beat.index > 0 ? [{ sec: beat.startSec, frame: beat.startFrame, role: 'move' as Role, gain: 0.55, scene: beat.scene }] : []),
    ...SCENE_CUES[beat.scene].flatMap((c) => {
      const sec = filmSecOf(beat, c.at);
      // A cue in the last 80 ms of a beat belongs to a gesture the cut removed.
      if (sec === null || sec > beat.startSec + beat.sec - 0.08) return [];
      const frame = secToFrame(sec);
      return [{ sec: frameToSec(frame), frame, role: c.role, gain: c.gain ?? 1, scene: beat.scene }];
    }),
  ]).sort((a, b) => a.frame - b.frame);

/** Film-time window in which the honesty caption is up, or null if the scene is not in the cut. */
export const honestyWindow = (cut: Cut) => {
  const beat = resolveCut(cut).find((b) => b.scene === HONESTY.scene);
  if (!beat) return null;
  const a = filmSecOf(beat, Math.max(HONESTY.from, beat.from))!;
  const b = filmSecOf(beat, Math.min(HONESTY.to, beat.to))!;
  return { fromSec: a, toSec: b, fromFrame: secToFrame(a), toFrame: secToFrame(b), seconds: b - a };
};

/** Cuts that continue one page into the next are hard cuts; every other boundary gets the wipe. */
const CONTINUOUS: [SceneId, SceneId][] = [['home', 'programs'], ['docs', 'tutor'], ['showcase', 'cert']];
export const wipeBoundaries = (cut: Cut) => {
  const beats = resolveCut(cut);
  return beats.slice(1).filter((b, i) => !CONTINUOUS.some(([a, z]) => a === beats[i].scene && z === b.scene)).map((b) => frameToSec(b.startFrame));
};
