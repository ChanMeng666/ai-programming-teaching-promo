// The deliverable matrix, and the design boxes the replica is laid out in.
// React-free on purpose: the gates and the audio build execute this in Node.

export const FPS = 30;
export const CUT_SECONDS = [30, 60] as const;
export type Cut = (typeof CUT_SECONDS)[number];

export const SHAPES = {
  landscape: { w: 1920, h: 1080, design: { w: 1440, h: 810 } },
  portrait: { w: 1080, h: 1920, design: { w: 720, h: 1280 } },
} as const;
export type Shape = keyof typeof SHAPES;

export const DELIVERABLES = CUT_SECONDS.flatMap((cut) =>
  (Object.keys(SHAPES) as Shape[]).map((shape) => ({
    id: `Film-${cut}-${shape}`, cut, shape, w: SHAPES[shape].w, h: SHAPES[shape].h,
  })),
);

export type Layout = {
  shape: Shape; wide: boolean;
  /** Frame px. */ width: number; height: number;
  /** Design px — what every scene is authored in. */ W: number; H: number;
  /** Frame px per design px. */ scale: number;
  /** Design px kept clear of type at the bottom (platform chrome in 9:16). */ safeBottom: number;
  safeTop: number;
};

export const deriveLayout = (shape: Shape): Layout => {
  const s = SHAPES[shape];
  const wide = shape === 'landscape';
  return {
    shape, wide, width: s.w, height: s.h, W: s.design.w, H: s.design.h, scale: s.w / s.design.w,
    safeBottom: wide ? 44 : 250, safeTop: wide ? 0 : 120,
  };
};
