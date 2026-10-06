// Shared pieces of the site replica. Dumb components: no hooks, no effects, no
// CSS transitions or keyframes — everything that moves is handed a style
// computed from the scene clock.

import React from 'react';
import { Img, staticFile } from 'remotion';
import type { Layout } from '../layout-core';
import { along, clamp, press, type Knot } from '../motion';
import { STR } from './strings';
import { C, FONT, HAIR } from './tokens';

export type SceneProps = { t: number; L: Layout };
type Style = React.CSSProperties;

export const asset = (name: string) => staticFile(`img/${name}`);

/** The page: design-px box, cream ground, scaled once to the frame. */
export const Page: React.FC<{ L: Layout; children: React.ReactNode; bg?: string }> = ({ L, children, bg = C.cream }) => (
  <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: L.W, height: L.H, transform: `scale(${L.scale})`, transformOrigin: '0 0', fontFamily: FONT, color: C.ink }}>
      {children}
    </div>
  </div>
);

/**
 * Camera: puts design point (fx, fy) at the centre of the frame at scale s.
 * translate + scale from a top-left origin — never scale-about-the-focus.
 */
export const Cam: React.FC<{ L: Layout; fx: number; fy: number; s?: number; children: React.ReactNode }> = ({ L, fx, fy, s = 1, children }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: L.W, height: L.H, transformOrigin: '0 0', transform: `translate(${L.W / 2 - fx * s}px, ${L.H / 2 - fy * s}px) scale(${s})` }}>
    {children}
  </div>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; style?: Style }> = ({ children, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 50, border: HAIR, background: C.white, color: C.muted, fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...style }}>
    {children}
  </span>
);

export const Chip: React.FC<{ children: React.ReactNode; dot?: string; style?: Style }> = ({ children, dot, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 10, border: HAIR, color: C.ink, fontSize: 15, whiteSpace: 'nowrap', ...style }}>
    {dot ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flex: '0 0 auto' }} /> : null}
    {children}
  </span>
);

const Dot: React.FC<{ color: string }> = ({ color }) => <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flex: '0 0 auto' }} />;

/** .mm-btn — coral action (ink text, white dot after) or ghost (white, dot before). */
export const Btn: React.FC<{ kind: 'coral' | 'ghost'; children: React.ReactNode; dot?: string; dotAfter?: boolean; pressed?: number; size?: number; style?: Style }> = ({ kind, children, dot, dotAfter, pressed = 1, size = 15, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: size, fontWeight: 500, lineHeight: 1, padding: size >= 16 ? '14px 26px' : '12px 22px', borderRadius: 50, whiteSpace: 'nowrap', background: kind === 'coral' ? C.coral : C.white, border: `1px solid ${kind === 'coral' ? C.coral : C.mist}`, color: C.ink, transform: `scale(${pressed})`, ...style }}>
    {kind === 'ghost' && dot && !dotAfter ? <Dot color={dot} /> : null}
    {children}
    {kind === 'coral' ? <Dot color={C.white} /> : null}
    {kind === 'ghost' && dot && dotAfter ? <Dot color={dot} /> : null}
  </span>
);

export const Card: React.FC<{ children: React.ReactNode; style?: Style; small?: boolean }> = ({ children, style, small }) => (
  <div style={{ background: C.white, border: HAIR, borderRadius: small ? 24 : 50, padding: small ? 24 : 36, boxSizing: 'border-box', ...style }}>{children}</div>
);

export const Logo: React.FC<{ size: number; style?: Style }> = ({ size, style }) => <Img src={asset('logo.svg')} style={{ width: size, height: size, display: 'block', ...style }} />;

const IconCircle: React.FC<{ fill?: string; children?: React.ReactNode; size?: number }> = ({ fill = C.white, children, size = 32 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', border: HAIR, background: fill, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>{children}</span>
);
const SearchGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.2" y2="16.2" /></svg>
);

/** The floating white pill navbar. `active` underlines one link, as the site does. */
export const Navbar: React.FC<{ L: Layout; active?: keyof typeof STR.nav; style?: Style }> = ({ L, active, style }) => {
  const link = (k: keyof typeof STR.nav) => (
    <span key={k} style={{ fontSize: 15, fontWeight: 500, paddingBottom: 3, borderBottom: `1.5px solid ${active === k ? C.ink : 'transparent'}` }}>{STR.nav[k].text}</span>
  );
  if (!L.wide) {
    return (
      <div style={{ position: 'absolute', left: 20, right: 20, top: L.safeTop, height: 60, borderRadius: 50, background: C.white, border: HAIR, display: 'flex', alignItems: 'center', padding: '0 12px 0 14px', boxSizing: 'border-box', gap: 12, ...style }}>
        <svg width="24" height="24" viewBox="0 0 24 24" stroke={C.ink} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
        <Logo size={32} />
        <span style={{ flex: 1 }} />
        <IconCircle fill={C.sand} size={40}><SearchGlyph /></IconCircle>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 20, height: 64, borderRadius: 50, background: C.white, border: HAIR, display: 'flex', alignItems: 'center', padding: '0 20px 0 14px', boxSizing: 'border-box', gap: 18, ...style }}>
      <Logo size={32} />
      <span style={{ width: 8 }} />
      {link('tutorials')}{link('blog')}{link('board')}{link('capstone')}
      <span style={{ width: 8 }} />
      <span style={{ fontSize: 15, fontWeight: 500 }}>{STR.nav.version.text} <span style={{ fontSize: 10, marginLeft: 2 }}>⌄</span></span>
      <span style={{ flex: 1 }} />
      {link('chan')}{link('newsletter')}
      <IconCircle /><IconCircle /><IconCircle />
      <IconCircle fill={C.sand} size={42}><SearchGlyph /></IconCircle>
    </div>
  );
};

/** Lines that slide up from behind a clip mask — the display-type entrance. */
export const MaskLines: React.FC<{ lines: string[]; k: (i: number) => number; style?: Style; lineHeight?: number }> = ({ lines, k, style, lineHeight = 0.95 }) => (
  <div style={style}>
    {lines.map((line, i) => (
      <div key={i} style={{ overflow: 'hidden', lineHeight, paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
        <div style={{ transform: `translateY(${(1 - k(i)) * 105}%)`, whiteSpace: 'nowrap' }}>{line}</div>
      </div>
    ))}
  </div>
);

/** The cursor: a hand on a spline, dipping on each click. Film furniture, drawn in design px. */
export const Cursor: React.FC<{ t: number; knots: Knot[]; clicks?: number[]; show?: [number, number] }> = ({ t, knots, clicks = [], show }) => {
  const p = along(knots, t);
  const s = clicks.reduce((acc, c) => Math.min(acc, press(t, c - 0.08)), 1);
  const o = show ? clamp((t - show[0]) * 6) * clamp((show[1] - t) * 6) : 1;
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: 'absolute', left: p.x, top: p.y, opacity: o, transform: `scale(${s * (2 - s)})`, transformOrigin: '4px 3px', zIndex: 50 }}>
      <path d="M4 3 L4 19 L8.6 15 L11.6 21.5 L14.3 20.3 L11.4 13.9 L17.5 13.9 Z" fill={C.ink} stroke={C.white} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
};

/** A paper-cut scrap — the certificate border's vocabulary, used as film furniture. */
export const Scrap: React.FC<{ kind: 'dot' | 'square' | 'tri' | 'leaf'; color: string; x: number; y: number; size: number; rot?: number; style?: Style }> = ({ kind, color, x, y, size, rot = 0, style }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', ...style, transform: `${style?.transform ?? ''} rotate(${rot}deg)` }}>
    {kind === 'dot' ? <circle cx="10" cy="10" r="9" fill={color} /> : null}
    {kind === 'square' ? <rect x="2" y="2" width="16" height="16" rx="3.5" fill={color} /> : null}
    {kind === 'tri' ? <path d="M10 2 L19 17 L1 17 Z" fill={color} strokeLinejoin="round" stroke={color} strokeWidth="2" /> : null}
    {kind === 'leaf' ? <path d="M1 10 C5 2, 15 2, 19 10 C15 18, 5 18, 1 10 Z" fill={color} /> : null}
  </svg>
);
