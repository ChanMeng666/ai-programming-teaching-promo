import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import type { SceneId } from './choreo';
import { COPY } from './copy';
import { deriveLayout, type Cut, type Layout, type Shape } from './layout-core';
import { clamp, easeInOut, rise } from './motion';
import type { SceneProps } from './replica/parts';
import { C, FONT } from './replica/tokens';
import { Docs, Tutor } from './scenes/DocsTutor';
import { Home, Hook, Programs } from './scenes/HookHome';
import { Cert, End, Instructor, Showcase } from './scenes/ShowcaseCertEnd';
import { frameToSec, resolveCut, sceneClock, wipeBoundaries, type Beat } from './timeline';

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  hook: Hook, home: Home, programs: Programs, docs: Docs, tutor: Tutor, showcase: Showcase, cert: Cert, instructor: Instructor, end: End,
};

/** Beat-local second a caption arrives, where the default would land on the picture's subject. */
const CAPTION_AT: Partial<Record<SceneId, number>> = { cert: 3.2 };

/** The film's lower-third: an ink pill, so it never reads as the product's own UI. */
const Caption: React.FC<{ beat: Beat; sec: number; L: Layout }> = ({ beat, sec, L }) => {
  const text = COPY.captions[beat.scene];
  if (!text || beat.scene === 'tutor') return null; // the tutor scene sets its own, on the cream it clears
  const out = clamp((beat.sec - 0.12 - sec) * 9);
  const top = L.wide && beat.scene === 'showcase' && sec > 2.4;
  const place: React.CSSProperties = top ? { top: 26, right: 140, justifyContent: 'flex-end' } : { left: 0, right: 0, bottom: L.safeBottom, justifyContent: 'center' };
  const at = top ? 2.5 : CAPTION_AT[beat.scene] ?? 0.45;
  if (sec < at) return null;
  if (L.wide && beat.scene === 'showcase' && sec <= 2.4) return null;
  const inS = rise(sec, at, 26, 13, 0.7);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: L.W, height: L.H, transform: `scale(${L.scale})`, transformOrigin: '0 0', fontFamily: FONT }}>
      <div style={{ position: 'absolute', display: 'flex', padding: L.wide ? 0 : '0 36px', ...place }}>
        <span style={{ background: C.ink, color: C.cream, fontSize: L.wide ? 23 : 26, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.25, textAlign: 'center', padding: L.wide ? '14px 28px' : '16px 26px', borderRadius: L.wide ? 50 : 28, ...inS, opacity: Math.min(inS.opacity, out) }}>{text}</span>
      </div>
    </div>
  );
};

/** A sunshine sheet rises over the cut and carries on off the top. */
const Wipe: React.FC<{ sec: number; boundaries: number[] }> = ({ sec, boundaries }) => {
  const half = 0.3;
  const b = boundaries.find((x) => Math.abs(sec - x) < half);
  if (b === undefined) return null;
  const p = easeInOut((sec - (b - half)) / (half * 2));
  // Frame-relative: the sheet is 130% tall and travels from below the frame to above it,
  // so it covers the whole frame exactly at the boundary (p = 0.5 -> top -15%).
  const top = 100 - p * 230;
  const sheet = (color: string, edge: number) => <div style={{ position: 'absolute', left: 0, right: 0, top: `${top - edge}%`, height: `${130 + edge * 2}%`, background: color }} />;
  return <AbsoluteFill>{sheet(C.white, 2.5)}{sheet(C.sun, 0)}</AbsoluteFill>;
};

const BeatView: React.FC<{ beat: Beat; L: Layout }> = ({ beat, L }) => {
  const local = useCurrentFrame(); // sequence-local
  const Scene = SCENES[beat.scene];
  return (
    <AbsoluteFill>
      <Scene t={sceneClock(beat, local)} L={L} />
      <Caption beat={beat} sec={frameToSec(local)} L={L} />
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ cut: Cut; shape: Shape }> = ({ cut, shape }) => {
  const L = deriveLayout(shape);
  const beats = resolveCut(cut);
  const sec = frameToSec(useCurrentFrame());
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      {beats.map((beat) => (
        <Sequence key={beat.index} from={beat.startFrame} durationInFrames={beat.frames} name={beat.scene}>
          <BeatView beat={beat} L={L} />
        </Sequence>
      ))}
      <Wipe sec={sec} boundaries={wipeBoundaries(cut)} />
      <Audio src={staticFile(`audio/mix-${cut}.wav`)} />
    </AbsoluteFill>
  );
};
