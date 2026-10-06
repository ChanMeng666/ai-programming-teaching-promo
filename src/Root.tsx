import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import './fonts';
import { DELIVERABLES, FPS } from './layout-core';
import { framesForCut } from './timeline';

// Compositions are generated from the deliverables table, never typed by hand.
export const Root: React.FC = () => (
  <>
    {DELIVERABLES.map((d) => (
      <Composition key={d.id} id={d.id} component={Film} durationInFrames={framesForCut(d.cut)} fps={FPS} width={d.w} height={d.h} defaultProps={{ cut: d.cut, shape: d.shape }} />
    ))}
  </>
);
