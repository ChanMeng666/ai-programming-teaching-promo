import React from 'react';
import { Img } from 'remotion';
import { DOCS, TUTOR } from '../choreo';
import { COPY } from '../copy';
import chat from '../data/chat-answer.json';
import curriculum from '../data/curriculum.json';
import type { Layout } from '../layout-core';
import { caretOn, clamp, easeInOut, lerp, pop, press, prog, rise, spring, typed } from '../motion';
import { asset, Cam, Chip, Cursor, Navbar, Page, type SceneProps } from '../replica/parts';
import { STR } from '../replica/strings';
import { C, HAIR, MONO } from '../replica/tokens';

const WEEKS = curriculum.weeks;
const CAP = curriculum.capstone;

/** `**bold**` -> <strong>, the only inline markdown these strings use. */
const md = (text: string) => text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') ? <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong> : part));

const Sidebar: React.FC<{ L: Layout; active: number; glow: number }> = ({ L, active, glow }) => {
  const item = (label: string, on: boolean, key: React.Key, indent = 12) => (
    <div key={key} style={{ fontSize: L.wide ? 15.5 : 17, fontWeight: on ? 700 : 400, padding: L.wide ? '8px 12px' : '9px 14px', marginLeft: indent, borderRadius: 12, lineHeight: 1.25, background: on ? C.white : 'transparent', borderLeft: `3px solid ${on ? C.grass : 'transparent'}`, transform: on ? `translateX(${(1 - glow) * -6}px)` : undefined }}>{label}</div>
  );
  const cat = (label: string) => <div style={{ fontSize: L.wide ? 15.5 : 17, fontWeight: 500, padding: '10px 12px 6px', display: 'flex', justifyContent: 'space-between' }}>{label}<span style={{ color: C.stone }}>⌄</span></div>;
  return (
    <div>
      {cat(STR.docs.teaching.text)}
      {WEEKS.map((w, i) => item(w.sidebarLabel!, active === i, i))}
      {cat(STR.docs.capstoneCat.text)}
      {item(CAP.sidebarLabel!, active === WEEKS.length, 'cap')}
    </div>
  );
};

const Crumbs: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: C.muted }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill={C.ink}><path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3z" /></svg>
    <span>›</span><span>{a}</span><span>›</span>
    <span style={{ background: C.sand, color: C.ink, padding: '4px 10px', borderRadius: 10 }}>{b}</span>
  </div>
);

const Article: React.FC<{ L: Layout; active: number; k: number }> = ({ L, active, k }) => {
  const isCap = active >= WEEKS.length;
  const w = WEEKS[Math.min(active, WEEKS.length - 1)];
  const h1 = L.wide ? 48 : 44;
  return (
    <div style={{ opacity: clamp(0.55 + k * 2), transform: `translateY(${(1 - k) * 16}px)` }}>
      <Crumbs a={isCap ? STR.docs.capstoneCat.text : STR.docs.teaching.text} b={isCap ? CAP.sidebarLabel! : w.sidebarLabel!} />
      <div style={{ fontSize: h1, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 26 }}>{isCap ? CAP.h1 : w.h1}</div>
      {isCap ? (
        <>
          <div style={{ marginTop: 24, borderLeft: `3px solid ${C.grass}`, background: C.white, borderRadius: '0 12px 12px 0', padding: '12px 18px', fontSize: 17, fontWeight: 700 }}>{CAP.kicker}</div>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 34 }}>{STR.docs.objective.text}</div>
          <div style={{ fontSize: 17, lineHeight: 1.65, marginTop: 14 }}>{md(CAP.objective)}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 34 }}>{STR.docs.objectives.text}</div>
          <div style={{ fontSize: 17, lineHeight: 1.6, marginTop: 14 }}>{STR.docs.objectivesLead.text}</div>
          <ul style={{ fontSize: 17, lineHeight: 1.6, margin: '10px 0 0', paddingLeft: 24 }}>
            {w.objectives.slice(0, 3).map((o, i) => <li key={i} style={{ marginBottom: 8 }}>{o}</li>)}
          </ul>
        </>
      )}
    </div>
  );
};

/** The docs page: sidebar + article + the chat toggle. Shared by `docs` and `tutor`. */
const DocsPage: React.FC<{ L: Layout; active: number; k: number; glow: number; toggleOpen?: boolean; togglePress?: number; enter?: number }> = ({ L, active, k, glow, toggleOpen, togglePress = 1, enter = 1 }) => {
  const toggle = (
    <div style={{ position: 'absolute', right: 24, bottom: L.wide ? 24 : L.safeBottom + 10, width: 56, height: 56, borderRadius: '50%', border: HAIR, background: toggleOpen ? C.white : C.grass, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${togglePress})` }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {toggleOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
      </svg>
    </div>
  );
  if (L.wide) {
    return (
      <>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, borderRight: HAIR, padding: '100px 14px 0 10px', boxSizing: 'border-box', transform: `translateX(${(1 - enter) * -60}px)` }}>
          <Sidebar L={L} active={active} glow={glow} />
        </div>
        <div style={{ position: 'absolute', left: 340, top: 112, width: 760 }}><Article L={L} active={active} k={k} /></div>
        {toggle}
      </>
    );
  }
  return (
    <>
      <div style={{ position: 'absolute', left: 20, right: 20, top: L.safeTop + 78, background: C.cream, border: HAIR, borderRadius: 24, padding: '8px 10px 14px', transform: `translateY(${(1 - enter) * 40}px)` }}>
        <Sidebar L={L} active={active} glow={glow} />
      </div>
      <div style={{ position: 'absolute', left: 32, right: 32, top: L.safeTop + 640 }}><Article L={L} active={active} k={k} /></div>
      {toggle}
    </>
  );
};

export const Docs: React.FC<SceneProps> = ({ t, L }) => {
  const step = Math.floor((t - DOCS.walkAt) / DOCS.walkGap);
  const active = clamp(step, 0, DOCS.weeks);
  const since = t < DOCS.walkAt ? t : t - (DOCS.walkAt + active * DOCS.walkGap);
  const k = t < DOCS.walkAt ? spring(t - 0.15, 12, 0.85) : spring(since, 20, 0.8);
  return (
    <Page L={L}>
      <DocsPage L={L} active={active} k={k} glow={spring(since, 22, 0.55)} enter={spring(t, 12, 0.85) * 0.9 + 0.1} />
      <Navbar L={L} active="tutorials" />
    </Page>
  );
};

/** Characters of the answer out at stream progress p, on the REAL stream's rhythm. */
const streamed = (p: number) => {
  const ch = chat.chunks as number[][];
  const t0 = ch[0][0], t1 = ch[ch.length - 1][0];
  const at = lerp(t0, t1, clamp(p));
  let n = 0;
  for (const [ms, len] of ch) { if (ms <= at) n = len; else break; }
  return p >= 1 ? chat.answer.length : n;
};

const Bubble: React.FC<{ user?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ user, children, style }) => (
  <div style={{ display: 'flex', gap: 8, maxWidth: '85%', alignSelf: user ? 'flex-end' : 'flex-start', flexDirection: user ? 'row-reverse' : 'row', flex: '0 0 auto', ...style }}>
    {user ? null : (
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.sand, border: HAIR, flex: '0 0 auto', padding: 4, boxSizing: 'border-box' }}>
        <Img src={asset('chan-mark.svg')} style={{ width: '100%', height: '100%' }} />
      </div>
    )}
    <div style={{ padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.6, background: user ? C.sand : C.white, border: user ? undefined : HAIR, borderBottomRightRadius: user ? 4 : 16, borderBottomLeftRadius: user ? 16 : 4 }}>{children}</div>
  </div>
);

const ChatBox: React.FC<{ t: number }> = ({ t }) => {
  const Q = chat.question;
  const qn = t < TUTOR.sendAt ? typed(t, TUTOR.typeAt, TUTOR.cps, Q.length) : 0;
  const sent = t >= TUTOR.sendAt;
  const p = prog(t, TUTOR.streamAt, TUTOR.streamDur);
  const n = t >= TUTOR.streamAt ? streamed(p) : 0;
  const streaming = sent && p < 1;
  const paras = chat.answer.slice(0, n).split(/\n\n+/);
  const refs = clamp((t - TUTOR.refsAt) * 4);
  const icon = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: C.ink, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <div style={{ width: 380, height: 500, background: C.white, borderRadius: 24, border: HAIR, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: HAIR, fontSize: 16, fontWeight: 500 }}>
        <svg {...icon}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        {STR.chat.header.text}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.grass }} />
        <span style={{ flex: 1 }} />
        <svg {...icon} style={{ opacity: 0.7 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </div>
      <div style={{ flex: 1, minHeight: 0, background: C.cream, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: sent ? 'flex-end' : 'center', gap: 12, overflow: 'hidden' }}>
        {!sent ? (
          <div style={{ textAlign: 'center', color: C.muted }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.grass} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
            <div style={{ fontSize: 18, fontWeight: 500, color: C.ink, margin: '12px 0 8px' }}>{STR.chat.welcomeTitle.text}</div>
            <div style={{ fontSize: 14, padding: '0 30px' }}>{STR.chat.welcomeText.text}</div>
          </div>
        ) : (
          <>
            <Bubble user style={pop(t, TUTOR.sendAt, 18, 0.7)}>{Q}</Bubble>
            <Bubble style={{ opacity: clamp((t - TUTOR.dotsAt) * 8) }}>
              {n === 0 ? (
                <span style={{ display: 'inline-flex', gap: 4, padding: '6px 0' }}>
                  {[0, 1].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.grass, transform: `translateY(${Math.sin((t - i * 0.2) * 9) * 3}px)` }} />)}
                </span>
              ) : (
                paras.map((para, i) => {
                  const isRef = para.trimStart().startsWith('—');
                  return (
                    <div key={i} style={{ margin: i ? '8px 0 0' : 0, wordBreak: 'break-word', background: isRef ? `rgba(142, 212, 98, ${0.3 * refs})` : undefined, borderRadius: 6, fontFamily: undefined }}>
                      {para.replace(/\n/g, ' ')}
                      {streaming && i === paras.length - 1 ? <span style={{ color: C.grass, fontWeight: 700 }}>|</span> : null}
                    </div>
                  );
                })
              )}
            </Bubble>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: 16, borderTop: HAIR, alignItems: 'center' }}>
        <div style={{ flex: 1, background: C.sand, borderRadius: 50, padding: '11px 16px', fontSize: 14, color: qn ? C.ink : C.muted, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {qn ? Q.slice(0, qn) : sent ? STR.chat.placeholder.text : t >= TUTOR.typeAt ? '' : STR.chat.placeholder.text}
          {!sent && t >= TUTOR.typeAt - 0.3 ? <span style={{ opacity: caretOn(t, qn > 0 && qn < Q.length) ? 1 : 0 }}>|</span> : null}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: qn ? C.coral : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press(t, TUTOR.sendAt - 0.1)})` }}>
          <svg {...icon} width={18} height={18}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </div>
      </div>
    </div>
  );
};

export const Tutor: React.FC<SceneProps> = ({ t, L }) => {
  const push = easeInOut(prog(t, TUTOR.pushAt, 1.1));
  const open = spring(t - TUTOR.openAt, 14, 0.75);
  const bottom = L.wide ? 24 : L.safeBottom + 10;
  // The chat box's rectangle on the page, in design px.
  const box = { x: L.W - 24 - 380, y: L.H - bottom - 72 - 500, w: 380, h: 500 };
  const s = lerp(1, L.wide ? 1.42 : 1.45, push);
  // Where the box's centre sits in the frame once pushed: right third (wide) / upper middle (tall).
  const cx = lerp(box.x + box.w / 2, L.wide ? L.W * 0.735 : L.W / 2, push);
  const cy = lerp(box.y + box.h / 2, L.wide ? L.H * 0.5 : L.safeTop + 478, push);
  const fx = box.x + box.w / 2 - (cx - L.W / 2) / s;
  const fy = box.y + box.h / 2 - (cy - L.H / 2) / s;
  const toggle = { x: L.W - 24 - 28, y: L.H - bottom - 28 };
  const honesty = <span style={{ display: 'inline-block', background: C.ink, color: C.cream, fontSize: L.wide ? 17 : 19, fontWeight: 500, padding: '10px 18px', borderRadius: 14, lineHeight: 1.3 }}>{COPY.honesty}</span>;
  return (
    <Page L={L}>
      <Cam L={L} fx={fx} fy={fy} s={s}>
        <DocsPage L={L} active={WEEKS.length} k={1} glow={1} toggleOpen={t >= TUTOR.openAt} togglePress={press(t, TUTOR.openAt - 0.1)} />
        <Navbar L={L} active="tutorials" />
        <div style={{ position: 'absolute', inset: -400, background: C.cream, opacity: clamp(push * 1.7) }} />
        {t >= TUTOR.openAt ? (
          <div style={{ position: 'absolute', left: box.x, top: box.y + (1 - open) * 20, opacity: clamp(open * 3) }}><ChatBox t={t} /></div>
        ) : null}
        <Cursor t={t} show={[TUTOR.cursorFrom, TUTOR.openAt + 0.5]} clicks={[TUTOR.openAt]} knots={[{ t: TUTOR.cursorFrom, x: toggle.x - 240, y: toggle.y - 190 }, { t: TUTOR.openAt - 0.12, x: toggle.x - 6, y: toggle.y - 4 }]} />
      </Cam>
      {/* The film's own voice, on the cream the push cleared. */}
      <div style={L.wide ? { position: 'absolute', left: 110, top: 170, width: 560 } : { position: 'absolute', left: 40, right: 40, top: L.safeTop + 30, textAlign: 'center' }}>
        {L.wide ? (
          <>
            <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: '-0.045em', lineHeight: 1.08, ...rise(t, TUTOR.pushAt + 0.9, 30) }}>{COPY.captions.tutor}</div>
            <div style={{ marginTop: 34, fontSize: 14, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, ...rise(t, TUTOR.sendAt, 16) }}>{COPY.stackLabel}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {COPY.stack.map((x, i) => <Chip key={x} dot={[C.coral, C.sky, C.grass][i]} style={{ background: C.white, fontFamily: MONO, fontSize: 15, padding: '7px 14px', ...pop(t, TUTOR.sendAt + 0.15 + i * 0.14) }}>{x}</Chip>)}
            </div>
            {t >= TUTOR.sendAt ? <div style={{ marginTop: 30 }}>{honesty}</div> : null}
          </>
        ) : null}
      </div>
      {!L.wide ? (
        <div style={{ position: 'absolute', left: 36, right: 36, top: L.safeTop + 14, textAlign: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.12, ...rise(t, TUTOR.pushAt + 0.9, 24) }}>{COPY.captions.tutor}</div>
        </div>
      ) : null}
      {/* Honesty: whole or gone — a hard cut in, never a fade. */}
      {!L.wide && t >= TUTOR.sendAt ? <div style={{ position: 'absolute', left: 36, right: 36, bottom: L.safeBottom, textAlign: 'center' }}>{honesty}</div> : null}
    </Page>
  );
};
