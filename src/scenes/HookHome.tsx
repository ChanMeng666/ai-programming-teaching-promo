import React from 'react';
import { Img } from 'remotion';
import { HOME, HOOK, HOOK_LINE, PROGRAMS } from '../choreo';
import { COPY } from '../copy';
import { caretOn, clamp, easeInOut, hash, kf, pop, press, prog, rise, spring, typed } from '../motion';
import { asset, Btn, Cam, Card, Chip, Cursor, Eyebrow, MaskLines, Navbar, Page, Scrap, type SceneProps } from '../replica/parts';
import { STR } from '../replica/strings';
import { C } from '../replica/tokens';

const SCRAPS = [
  { kind: 'dot', color: C.sun, x: 0.1, y: 0.2, size: 46 }, { kind: 'square', color: C.coral, x: 0.88, y: 0.16, size: 38 },
  { kind: 'tri', color: C.sky, x: 0.83, y: 0.8, size: 40 }, { kind: 'leaf', color: C.grass, x: 0.14, y: 0.78, size: 54 },
  { kind: 'dot', color: C.coral, x: 0.06, y: 0.52, size: 20 }, { kind: 'square', color: C.sun, x: 0.94, y: 0.5, size: 24 },
  { kind: 'leaf', color: C.grass, x: 0.7, y: 0.1, size: 34 }, { kind: 'dot', color: C.sky, x: 0.3, y: 0.9, size: 22 },
] as const;

/** Paper-cut scraps that pop in and then drift a few px on a slow seeded sway. */
export const Scraps: React.FC<SceneProps & { at?: number; band?: [number, number] }> = ({ t, L, at = 0.2, band = [0, 1] }) => (
  <>
    {SCRAPS.map((s, i) => {
      const k = spring(t - at - i * 0.09, 15, 0.45);
      const y = (band[0] + s.y * (band[1] - band[0])) * L.H;
      const sway = Math.sin(t * (0.5 + hash(i) * 0.5) + i) * 5;
      return <Scrap key={i} kind={s.kind} color={s.color} x={s.x * L.W} y={y + sway} size={s.size} rot={hash(i + 9) * 50 - 25 + sway * 1.5} style={{ transform: `scale(${k})`, opacity: clamp(k * 3) }} />;
    })}
  </>
);

export const Hook: React.FC<SceneProps> = ({ t, L }) => {
  const lines = L.wide ? ['Natural language is', 'the source code.'] : ['Natural', 'language is', 'the source', 'code.'];
  const n = typed(t, HOOK.typeAt, HOOK.cps, HOOK_LINE.length);
  const typing = n < HOOK_LINE.length;
  const size = L.wide ? 118 : 104;
  let used = 0;
  return (
    <Page L={L}>
      <Scraps t={t} L={L} band={L.wide ? [0, 1] : [0.12, 0.8]} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: L.wide ? 210 : 330, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: size, fontWeight: 500, letterSpacing: '-0.06em', lineHeight: 1 }}>
          {lines.map((line, i) => {
                      const start = used;
            used += line.length + 1;
            const out = clamp(n - start, 0, line.length);
            const here = n >= start && (n < start + line.length + 1 || i === lines.length - 1);
            return (
              <div key={i} style={{ whiteSpace: 'pre', height: size * 1.02, textAlign: L.wide ? 'center' : 'left', width: L.wide ? undefined : 560 }}>
                {line.slice(0, out)}
                {here ? <span style={{ display: 'inline-block', width: size * 0.07, height: size * 0.78, marginLeft: size * 0.05, background: C.grass, verticalAlign: 'baseline', transform: 'translateY(8%)', opacity: caretOn(t, typing) ? 1 : 0 }} /> : null}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 44, height: 4, borderRadius: 4, background: C.ink, width: (L.wide ? 520 : 400) * (0.12 + 0.88 * clamp(n / HOOK_LINE.length)) }} />
        <div style={{ marginTop: 30, fontSize: L.wide ? 24 : 26, color: C.muted, fontWeight: 500, textAlign: 'center', maxWidth: L.W - 120, ...rise(t, HOOK.byAt, 18) }}>{COPY.hookBy}</div>
      </div>
    </Page>
  );
};

export const Home: React.FC<SceneProps> = ({ t, L }) => {
  const scroll = easeInOut(prog(t, HOME.scrollAt, 1.6));
  const push = 1 + 0.035 * easeInOut(prog(t, 0.6, 3.4));
  const artW = L.wide ? 1000 : 660;
  const artTop = L.wide ? 760 : 800;
  const scrollBy = L.wide ? 560 : 150;
  const title = L.wide ? ['Learn to build', 'with AI.'] : ['Learn to', 'build', 'with AI.'];
  return (
    <Page L={L}>
      <Cam L={L} fx={L.W / 2} fy={L.H / 2 + scroll * scrollBy} s={push}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: L.wide ? 200 : L.safeTop + 110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: L.wide ? 26 : 26, textAlign: 'center' }}>
          <Eyebrow style={rise(t, HOME.eyebrowAt, 16)}>{STR.hero.eyebrow.text}</Eyebrow>
          <MaskLines lines={title} k={(i) => spring(t - HOME.titleAt - i * 0.12, 11, 0.85) * 0.92 + 0.08} style={{ fontSize: L.wide ? 140 : 116, fontWeight: 500, letterSpacing: '-0.06em' }} />
          <div style={{ fontSize: 20, lineHeight: 1.45, maxWidth: L.wide ? 560 : 520, ...rise(t, HOME.subAt, 20) }}>{STR.hero.sub.text}</div>
          <div style={{ position: 'relative', display: 'flex', gap: 14, ...rise(t, HOME.ctaAt, 20) }}>
            <Btn kind="coral" size={16} pressed={press(t, HOME.clickAt)}>{STR.hero.start.text}</Btn>
            <Btn kind="ghost" size={16} dot={C.sky}>{STR.hero.blog.text}</Btn>
            <Cursor t={t} show={[HOME.cursorFrom, HOME.scrollAt + 0.2]} clicks={[HOME.clickAt]} knots={[{ t: HOME.cursorFrom, x: 470, y: 150 }, { t: HOME.clickAt - 0.25, x: 92, y: 22 }]} />
          </div>
        </div>
        <Img src={asset('hero.webp')} style={{ position: 'absolute', left: (L.W - artW) / 2, top: artTop - scroll * 60, width: artW, ...rise(t, HOME.artAt, 120, 9, 0.8) }} />
      </Cam>
      <Navbar L={L} style={{ transform: `translateY(${(1 - spring(t - HOME.navAt, 12, 0.8)) * -110}px)` }} />
    </Page>
  );
};

const ProgramCard: React.FC<{ title: string; desc: string; style?: React.CSSProperties }> = ({ title, desc, style }) => (
  <Card style={{ padding: '32px 36px', ...style }}>
    <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</div>
    <div style={{ fontSize: 16, lineHeight: 1.5, color: C.muted, marginTop: 10 }}>{desc}</div>
    <div style={{ display: 'inline-block', marginTop: 14, fontSize: 16, fontWeight: 500, borderBottom: `1.5px solid ${C.ink}`, paddingBottom: 2 }}>{STR.programs.explore.text} →</div>
  </Card>
);

export const Programs: React.FC<SceneProps> = ({ t, L }) => {
  const P = STR.programs;
  const pad = L.wide ? 120 : 24;
  const inner = L.W - pad * 2;
  const pan = kf([[PROGRAMS.panFrom, 0], [PROGRAMS.panFrom + 2.2, 1]], t);
  return (
    <Page L={L}>
      <Cam L={L} fx={L.W / 2} fy={L.H / 2 + pan * (L.wide ? 330 : 430)}>
        <div style={{ position: 'absolute', left: pad, top: L.wide ? 110 : L.safeTop + 90, width: inner }}>
          <Eyebrow style={rise(t, PROGRAMS.headAt, 14)}>{P.eyebrow.text}</Eyebrow>
          <MaskLines lines={L.wide ? [P.heading.text] : ['Pick your', 'programme.']} k={(i) => spring(t - PROGRAMS.headAt - 0.08 - i * 0.1, 11, 0.85) * 0.9 + 0.1} lineHeight={1} style={{ fontSize: L.wide ? 81 : 76, fontWeight: 500, letterSpacing: '-0.06em', marginTop: 18 }} />
          <Card style={{ marginTop: 36, display: 'flex', flexDirection: L.wide ? 'row' : 'column', alignItems: L.wide ? 'center' : 'flex-start', gap: 24, padding: L.wide ? '40px 48px' : 32, ...rise(t, PROGRAMS.featuredAt, 46) }}>
            <div style={{ flex: 1 }}>
              <Chip style={{ fontSize: 14, ...pop(t, PROGRAMS.featuredAt + 0.25) }}>{P.badge.text}</Chip>
              <div style={{ fontSize: L.wide ? 44 : 40, fontWeight: 500, letterSpacing: '-0.04em', marginTop: 16 }}>{P.technest.text}</div>
              <div style={{ fontSize: 17, lineHeight: 1.5, color: C.muted, marginTop: 10, maxWidth: 520 }}>{P.technestDesc.text}</div>
              <Btn kind="coral" style={{ marginTop: 20 }}>{P.technestCta.text}</Btn>
            </div>
            <Img src={asset('home-build.webp')} style={{ width: L.wide ? 300 : 300, alignSelf: 'center', ...rise(t, PROGRAMS.featuredAt + 0.15, 40, 10, 0.6) }} />
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: L.wide ? '1fr 1fr' : '1fr', gap: 20, marginTop: 20 }}>
            {P.cards.map((c, i) => <ProgramCard key={i} title={c.title.text} desc={c.desc.text} style={rise(t, PROGRAMS.cardsAt + i * PROGRAMS.cardGap, 50)} />)}
          </div>
        </div>
      </Cam>
      <Navbar L={L} />
    </Page>
  );
};
