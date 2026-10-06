import React from 'react';
import { Img } from 'remotion';
import { CERT, END, INSTRUCTOR, SHOWCASE } from '../choreo';
import { COPY } from '../copy';
import awards from '../data/awards.json';
import capstones from '../data/capstones.json';
import { clamp, easeInOut, kf, pop, press, rise, spring } from '../motion';
import { asset, Btn, Cam, Card, Chip, Cursor, Eyebrow, Logo, MaskLines, Navbar, Page, type SceneProps } from '../replica/parts';
import { shown, STR } from '../replica/strings';
import { C, HAIR, MONO } from '../replica/tokens';
import { Scraps } from './HookHome';

// The three winners: order from the FROZEN awards, live fields from the API bake.
const WINNERS = awards.awards.slice(0, 3).map((a) => ({ award: a, project: capstones.projects.find((p) => p.slug === a.slug)! }));
const FIRST = awards.awards[0];
const TIER = awards.tiers[FIRST.tier as keyof typeof awards.tiers];

const WinnerCard: React.FC<{ i: number; t: number; wide: boolean; children?: React.ReactNode }> = ({ i, t, wide, children }) => {
  const { award, project } = WINNERS[i];
  const at = SHOWCASE.cardsAt + i * SHOWCASE.cardGap;
  const first = i === 0;
  return (
    <div style={{ position: 'relative', flex: wide ? (first ? '0 0 400px' : '1 1 0') : undefined, background: C.white, borderRadius: 50, border: first ? `2px solid ${C.grass}` : HAIR, padding: 36, boxSizing: 'border-box', ...rise(t, at, 70, 11, 0.7) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 81, fontWeight: 500, letterSpacing: '-0.06em', lineHeight: 1 }}>{award.rank}</span>
        <Chip>{STR.showcase.ranks[i].text}</Chip>
      </div>
      <Img src={asset(`cap-${award.slug}.webp`)} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 20, marginTop: 20, display: 'block' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginTop: 22 }}>
        <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{project.title}</span>
        <Chip dot={C.stone} style={{ marginTop: 4 }}>{project.track}</Chip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 15 }}>
        {project.avatar ? <Img src={asset(`avatar-${award.slug}.webp`)} style={{ width: 34, height: 34, borderRadius: '50%', border: HAIR }} /> : null}
        <span style={{ borderBottom: HAIR, paddingBottom: 2 }}><span style={{ color: C.muted }}>{STR.showcase.team.text}: </span>{project.team}</span>
      </div>
      <div style={{ fontSize: 15.5, lineHeight: 1.5, marginTop: 14 }}>{project.pitch}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        <Chip dot={C.grass}>{STR.showcase.visit.text}</Chip>
        <Chip dot={C.sky}>{STR.showcase.github.text}</Chip>
        {project.demoURL ? <Chip dot={C.coral}>{STR.showcase.demo.text}</Chip> : null}
        <Chip dot={C.grass} style={first ? { transform: `scale(${press(t, SHOWCASE.clickAt - 0.1)})`, borderColor: t > SHOWCASE.clickAt - 0.5 ? C.ink : C.mist } : undefined}>{STR.showcase.certificate.text}</Chip>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: C.coral, borderRadius: 50, padding: '9px 14px 9px 20px', ...pop(t, SHOWCASE.countAt + i * 0.22, 15, 0.42) }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.4"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" /></svg>
          <span style={{ background: C.white, borderRadius: 50, minWidth: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, padding: '0 6px', boxSizing: 'border-box' }}>{project.votes}</span>
        </span>
      </div>
      {children}
    </div>
  );
};

export const Showcase: React.FC<SceneProps> = ({ t, L }) => {
  const go = easeInOut(clamp((t - SHOWCASE.scrollAt) / 1.0));
  const pad = L.wide ? 140 : 24;
  const cardsTop = L.wide ? 815 : 900;
  const fy = L.wide ? kf([[SHOWCASE.scrollAt, L.H / 2], [SHOWCASE.scrollAt + 1, 1195]], t) : kf([[SHOWCASE.scrollAt, L.H / 2], [SHOWCASE.scrollAt + 1, 1330], [4.6, 1330], [7.6, 1900]], t);
  const s = L.wide ? 1 - 0.14 * go : 1;
  const title = L.wide ? ['TECHNEST 2026', 'Capstone', 'Showcase'] : ['TECHNEST', '2026 Capstone', 'Showcase'];
  return (
    <Page L={L}>
      <Cam L={L} fx={L.W / 2} fy={fy} s={s}>
        <div style={{ position: 'absolute', left: pad, top: L.wide ? 148 : L.safeTop + 100 }}>
          <Eyebrow style={rise(t, SHOWCASE.heroAt + 0.05, 14)}>{STR.showcase.eyebrow.text}</Eyebrow>
          <MaskLines lines={title} k={(i) => spring(t - SHOWCASE.heroAt - 0.1 - i * 0.1, 11, 0.85) * 0.9 + 0.1} lineHeight={1} style={{ fontSize: L.wide ? 96 : 80, fontWeight: 500, letterSpacing: '-0.06em', marginTop: 22 }} />
        </div>
        <Img src={asset('capstone.webp')} style={L.wide ? { position: 'absolute', left: 900, top: 190, width: 400, ...rise(t, 0.3, 60, 10, 0.6) } : { position: 'absolute', left: 190, top: L.safeTop + 400, width: 340, ...rise(t, 0.3, 60, 10, 0.6) }} />
        <div style={{ position: 'absolute', left: pad, top: cardsTop - 82, fontSize: L.wide ? 48 : 44, fontWeight: 500, letterSpacing: '-0.04em', ...rise(t, SHOWCASE.cardsAt - 0.25, 30) }}>{STR.showcase.winners.text}</div>
        <div style={{ position: 'absolute', left: pad, top: cardsTop, width: L.W - pad * 2, display: 'flex', flexDirection: L.wide ? 'row' : 'column', alignItems: 'flex-start', gap: 26 }}>
          {WINNERS.map((_, i) => (
            <WinnerCard key={i} i={i} t={t} wide={L.wide}>
              {i === 0 && L.wide ? (
                <div style={{ position: 'absolute', left: 0, bottom: 0, width: 0, height: 0 }}>
                  <Cursor t={t} show={[SHOWCASE.cursorFrom, 99]} clicks={[SHOWCASE.clickAt]} knots={[{ t: SHOWCASE.cursorFrom, x: 620, y: -330 }, { t: SHOWCASE.clickAt - 0.2, x: 292, y: -122 }]} />
                </div>
              ) : null}
            </WinnerCard>
          ))}
        </div>
      </Cam>
      <Navbar L={L} active="capstone" style={{ transform: `translateY(${-go * 130}px)` }} />
    </Page>
  );
};

const FACTS: [string, React.ReactNode][] = [
  [STR.cert.kCredential.text, `${awards.cohort} Capstone — ${TIER.label}`],
  [STR.cert.kAwarded.text, FIRST.team],
  [STR.cert.kIssuedBy.text, `${awards.issuer} — ${awards.instructor}${STR.cert.instructorSuffix.text}`],
  [STR.cert.kDate.text, awards.issuedOnLabel],
  [STR.cert.kId.text, <span key="id" style={{ fontFamily: MONO, fontSize: 15, background: C.sand, padding: '3px 8px', borderRadius: 6 }}>{FIRST.certId}</span>],
  [STR.cert.kExpires.text, STR.cert.never.text],
];

export const Cert: React.FC<SceneProps> = ({ t, L }) => {
  const cardW = L.wide ? 1000 : 680;
  const cardX = (L.W - cardW) / 2;
  const padC = L.wide ? 24 : 16;
  const imgH = ((cardW - padC * 2) * 1120) / 1584;
  const cardTop = L.wide ? 478 : L.safeTop + 470;
  const cardH = imgH + padC * 2;
  const actionsTop = cardTop + cardH + 34;
  const factsTop = actionsTop + (L.wide ? 76 : 190);
  // One composition first — header and the whole certificate — then travel to the facts.
  const wholeTop = (L.wide ? 150 : L.safeTop + 60), wholeBottom = cardTop + cardH + 16;
  const s0 = Math.min(1, (L.H - (L.wide ? 0 : L.safeTop + L.safeBottom - 60)) / (wholeBottom - wholeTop));
  const fy0 = L.wide ? (wholeTop + wholeBottom) / 2 : (wholeTop + wholeBottom) / 2 + (L.safeBottom - L.safeTop) / 2 / s0 - 30;
  const go = easeInOut(clamp((t - CERT.toFactsAt) / 0.9));
  const s = s0 + (1 - s0) * go;
  const fy = fy0 + (actionsTop + L.H / 2 - (L.wide ? 70 : L.safeTop + 60) - fy0) * go;
  const away = easeInOut(clamp((t - CERT.toCertAt) / 0.6));
  const drop = spring(t - CERT.cardAt, 10, 0.62);
  return (
    <Page L={L}>
      <Cam L={L} fx={L.W / 2} fy={fy} s={s}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: L.wide ? 184 : L.safeTop + 96, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Eyebrow style={rise(t, CERT.headAt, 14)}>{awards.cohort} Capstone</Eyebrow>
          <MaskLines lines={[TIER.label]} k={() => spring(t - CERT.headAt - 0.08, 11, 0.85) * 0.9 + 0.1} lineHeight={1.05} style={{ fontSize: L.wide ? 81 : 84, fontWeight: 500, letterSpacing: '-0.06em', marginTop: 18 }} />
          <div style={{ fontSize: L.wide ? 20 : 22, marginTop: 14, ...rise(t, CERT.headAt + 0.2, 16) }}>
            {STR.cert.awardedTo.text} <strong style={{ fontWeight: 500 }}>{FIRST.team}</strong> {STR.cert.forWord.text} <strong style={{ fontWeight: 500 }}>{FIRST.title}</strong>
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.5, color: C.muted, marginTop: 12, maxWidth: L.wide ? 780 : 600, ...rise(t, CERT.headAt + 0.3, 16) }}>{FIRST.citation}</div>
        </div>
        <Card style={{ position: 'absolute', left: cardX, top: cardTop, width: cardW, padding: padC, borderRadius: L.wide ? 50 : 32, opacity: clamp((t - CERT.cardAt) * 7), transform: `translateY(${(1 - drop) * 90}px) rotate(${(1 - drop) * -2.2}deg)` }}>
          <Img src={asset('cert-linguapath.webp')} style={{ width: '100%', display: 'block', borderRadius: L.wide ? 28 : 18, border: HAIR, boxSizing: 'border-box' }} />
        </Card>
        <div style={{ position: 'absolute', left: cardX, width: cardW, top: actionsTop, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <span style={{ position: 'relative', ...rise(t, CERT.actionsAt, 20) }}>
            <Btn kind="coral" pressed={press(t, CERT.clickAt - 0.1)}>{STR.cert.linkedin.text}</Btn>
            <Cursor t={t} show={[CERT.actionsAt + 0.5, 99]} clicks={[CERT.clickAt]} knots={[{ t: CERT.actionsAt + 0.5, x: 420, y: 250 }, { t: CERT.clickAt - 0.2, x: 96, y: 14 }]} />
          </span>
          <Btn kind="ghost" dot={C.grass} dotAfter style={rise(t, CERT.actionsAt + 0.08, 20)}>{STR.cert.download.text}</Btn>
          <Btn kind="ghost" dot={C.sky} dotAfter style={rise(t, CERT.actionsAt + 0.16, 20)}>{STR.cert.view.text}</Btn>
        </div>
        <Card style={{ position: 'absolute', left: cardX, top: factsTop, width: cardW, padding: L.wide ? '36px 44px' : 30, borderRadius: L.wide ? 50 : 32, ...rise(t, CERT.actionsAt + 0.15, 40) }}>
          <div style={{ fontSize: L.wide ? 40 : 34, fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 12 }}>{STR.cert.details.text}</div>
          {FACTS.map(([k, v], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: L.wide ? '220px 1fr' : '170px 1fr', padding: '13px 0', borderTop: HAIR, fontSize: 17, ...rise(t, CERT.rowsAt + i * CERT.rowGap, 12) }}>
              <span style={{ color: C.muted }}>{k}</span><span>{v}</span>
            </div>
          ))}
        </Card>
      </Cam>
      <Navbar L={L} style={{ transform: `translateY(${-away * 130}px)` }} />
    </Page>
  );
};

export const Instructor: React.FC<SceneProps> = ({ t, L }) => {
  const S = STR.instructor;
  const heading = L.wide ? ['Taught by someone', 'who still ships.'] : ['Taught by', 'someone who', 'still ships.'];
  const idCard = (
    <Card style={{ width: L.wide ? 340 : 400, borderLeft: `3px solid ${C.grass}`, padding: '34px 34px 30px', ...rise(t, INSTRUCTOR.cardAt, 60, 11, 0.65) }}>
      <Img src={asset('chan-mark.svg')} style={{ width: 72, height: 72, display: 'block' }} />
      <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 14 }}>{S.name.text}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.45, color: C.muted, marginTop: 6 }}>{shown(S.role.text)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9, marginTop: 18 }}>
        {S.chips.map((c, i) => <Chip key={i} style={pop(t, INSTRUCTOR.chipsAt + i * INSTRUCTOR.chipGap, 17, 0.55)}>{shown(c.text)}</Chip>)}
      </div>
    </Card>
  );
  const quote = (
    <div style={{ background: C.ink, color: C.cream, borderRadius: L.wide ? 36 : 32, padding: L.wide ? '26px 40px' : '26px 30px', ...rise(t, INSTRUCTOR.quoteAt, 50, 11, 0.7) }}>
      <div style={{ fontSize: L.wide ? 30 : 28, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.22 }}>“{COPY.quote}”</div>
      <div style={{ fontSize: L.wide ? 17 : 18, marginTop: 10, color: C.sand, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.grass }} />{COPY.quoteBy}
      </div>
    </div>
  );
  return (
    <Page L={L}>
      <div style={{ position: 'absolute', left: L.wide ? 120 : 36, top: L.wide ? 130 : L.safeTop + 30, width: L.wide ? 760 : L.W - 72 }}>
        <Eyebrow style={rise(t, INSTRUCTOR.headAt, 14)}>{S.eyebrow.text}</Eyebrow>
        <MaskLines lines={heading} k={(i) => spring(t - INSTRUCTOR.headAt - 0.08 - i * 0.1, 11, 0.85) * 0.9 + 0.1} lineHeight={1} style={{ fontSize: L.wide ? 81 : 84, fontWeight: 500, letterSpacing: '-0.06em', marginTop: 20 }} />
        {L.wide ? <div style={{ fontSize: 18, lineHeight: 1.55, marginTop: 24, maxWidth: 560, ...rise(t, INSTRUCTOR.bodyAt, 22) }}>{S.body.text}</div> : null}
        {L.wide ? (
          <div style={{ display: 'flex', gap: 12, marginTop: 24, ...rise(t, INSTRUCTOR.bodyAt + 0.2, 20) }}>
            <Btn kind="coral">{S.why.text}</Btn><Btn kind="ghost" dot={C.sky}>{S.portfolio.text}</Btn>
          </div>
        ) : null}
      </div>
      <div style={L.wide ? { position: 'absolute', left: 950, top: 160 } : { position: 'absolute', left: 36, top: L.safeTop + 370 }}>{idCard}</div>
      <div style={L.wide ? { position: 'absolute', left: 120, right: 120, bottom: 50 } : { position: 'absolute', left: 36, right: 36, bottom: L.safeBottom + 4 }}>{quote}</div>
    </Page>
  );
};

export const End: React.FC<SceneProps> = ({ t, L }) => {
  const band = spring(t - END.bandAt, 9, 0.8);
  const bandH = L.wide ? 250 : 420;
  const title = L.wide ? [STR.hero.title.text] : ['Learn to build', 'with AI.'];
  return (
    <Page L={L}>
      <Scraps t={t} L={L} at={0.4} band={L.wide ? [0, 0.66] : [0.1, 0.62]} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: bandH, background: C.sun, transform: `translateY(${(1 - band) * bandH}px)` }}>
        <Img src={asset('footer-accent.webp')} style={{ position: 'absolute', right: L.wide ? 110 : 40, bottom: L.wide ? bandH - 6 : bandH - 6, width: L.wide ? 210 : 190, ...rise(t, END.byAt, 30) }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: L.wide ? 92 : 70, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: L.wide ? 26 : 28, fontWeight: 500, ...rise(t, END.byAt, 22) }}>
          <Img src={asset('chan-mark.svg')} style={{ width: 44, height: 44 }} />
          <span>{COPY.endBy}</span><span style={{ width: 8, height: 8, borderRadius: '50%', background: C.ink }} /><span>{COPY.endSite}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: L.wide ? 96 : L.safeTop + 150, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Logo size={L.wide ? 96 : 108} style={pop(t, END.markAt, 13, 0.42)} />
        <MaskLines lines={title} k={(i) => spring(t - END.titleAt - i * 0.1, 11, 0.85) * 0.9 + 0.1} lineHeight={1} style={{ fontSize: L.wide ? 108 : 96, fontWeight: 500, letterSpacing: '-0.06em', marginTop: 30 }} />
        <div style={{ marginTop: 34, ...rise(t, END.urlAt, 26, 12, 0.6) }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: C.white, border: `1.5px solid ${C.ink}`, borderRadius: 50, padding: L.wide ? '18px 38px' : '18px 30px', fontSize: L.wide ? 46 : 38, fontWeight: 500, letterSpacing: '-0.03em' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.coral }} />{COPY.endUrl}
          </span>
        </div>
      </div>
    </Page>
  );
};
