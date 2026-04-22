// SeedOGCard — 1200×630 social-preview rollup.
//   /seed/[seed]/og.png renders this server-side.
//
// Design rule (from pifreak): DON'T SHOW OFF CARDS THAT AREN'T THERE.
// The point of posting a seed is showing off the JOKERS YOU FOUND, splayed
// out like a Balatro poker hand. Unmatched clauses get a tiny stat line,
// not a grayed-out sprite.
//
// Splay math: mirrors Balatro `cardarea.lua` hand positioning —
//   rotate = (i - center) * spread°   (≈6° per card, clamped)
//   y      = abs(i - center) * arcDip  (arc dip, not a straight line)
//   ambient_tilt: ~0.2 per Balatro/card.lua — each card gets a unique
//     phase (i/1.14212) and a gentle sin/cos wobble. Pure CSS anim.
//
// Score columns: red SHOULD line has room for per-clause `+N` pills so
// the share card doubles as a scoring preview.

const Co = window.JimboColor;

// Balatro rarity palette
const RARITY_COLOR = {
  Common:    '#009dff',
  Uncommon:  '#3bc47e',
  Rare:      '#fe5f55',
  Legendary: '#b26cbd',
};

// Inject ambient_tilt keyframes once (Balatro card.lua: G.TIMERS.REAL*1.56 + id/1.35 drift)
(function injectOgKf(){
  if (document.getElementById('og-card-kf')) return;
  const s = document.createElement('style');
  s.id = 'og-card-kf';
  s.textContent = `
    @keyframes ogTilt0 { 0%,100% { transform: var(--base) rotate(var(--r, 0deg)) translateY(var(--ty, 0px)); }
                         50%     { transform: var(--base) rotate(calc(var(--r, 0deg) + 1.2deg)) translateY(calc(var(--ty, 0px) - 2px)); } }
    @keyframes ogTilt1 { 0%,100% { transform: var(--base) rotate(var(--r, 0deg)) translateY(var(--ty, 0px)); }
                         50%     { transform: var(--base) rotate(calc(var(--r, 0deg) - 1.4deg)) translateY(calc(var(--ty, 0px) + 2px)); } }
    @keyframes ogTilt2 { 0%,100% { transform: var(--base) rotate(var(--r, 0deg)) translateY(var(--ty, 0px)); }
                         50%     { transform: var(--base) rotate(calc(var(--r, 0deg) + 0.9deg)) translateY(calc(var(--ty, 0px) - 1px)); } }
    @keyframes ogTilt3 { 0%,100% { transform: var(--base) rotate(var(--r, 0deg)) translateY(var(--ty, 0px)); }
                         50%     { transform: var(--base) rotate(calc(var(--r, 0deg) - 0.7deg)) translateY(calc(var(--ty, 0px) + 1.5px)); } }
  `;
  document.head.appendChild(s);
})();

// One splayed card in the hand. Includes ambient tilt + per-card phase.
function FannedCard({ sprite, label, score, frame, rotate, yOff, zIndex, phase }) {
  const tiltKf = ['ogTilt0','ogTilt1','ogTilt2','ogTilt3'][phase % 4];
  return (
    <div style={{
      position: 'relative',
      marginLeft: -14,  // cards overlap like a hand
      zIndex,
      animation: `${tiltKf} ${4 + (phase % 3)}s ease-in-out infinite`,
      animationDelay: `${phase * 0.37}s`,
      ['--base']: 'translate(0,0)',
      ['--r']: `${rotate}deg`,
      ['--ty']: `${yOff}px`,
      transformOrigin: '50% 110%', // pivot below card, like holding from bottom
      transform: `translate(0,0) rotate(${rotate}deg) translateY(${yOff}px)`,
    }}>
      <div style={{
        padding: 6, borderRadius: 8,
        border: `4px solid ${frame || Co.GOLD}`,
        background: `${Co.DARKEST}`,
        boxShadow: `0 6px 0 rgba(0,0,0,.55), 0 0 18px ${frame || Co.GOLD}55`,
        position: 'relative',
      }}>
        {sprite}
        {score != null && (
          <div style={{
            position: 'absolute', top: -14, right: -14,
            minWidth: 34, padding: '2px 8px', height: 30,
            background: Co.RED, border: `3px solid ${Co.DARKEST}`, borderRadius: 15,
            color: Co.WHITE, fontSize: 18, lineHeight: '22px', textAlign: 'center',
            textShadow: '1px 1px 0 rgba(0,0,0,.8)', letterSpacing: 1,
          }}>+{score}</div>
        )}
        {label && (
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: -26, textAlign: 'center',
            fontSize: 13, color: frame || Co.GOLD_TEXT, letterSpacing: 2,
            textShadow: '1px 1px 0 rgba(0,0,0,.8)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{label}</div>
        )}
      </div>
    </div>
  );
}

function SeedOGCard({ seed, filter }) {
  const must = filter.must || [];
  const should = filter.should || [];
  const allMustHit = must.every(c => (seed.score?.totals[c.id] || 0) > 0);

  // Collect actual HITS across MUST + SHOULD to render as the hand.
  // Each entry: { value, edition, rarity, score, kind, clauseId }
  const hand = [];
  for (const c of must) {
    const matches = seed.score?.matches?.[c.id] || [];
    if (!matches.length) continue;
    const m = matches[0];
    hand.push({
      kind: 'must', value: m.value, edition: m.edition, clauseId: c.id,
      frame: Co.BLUE, label: c.label || m.value, score: null,
      sheet: c.type === 'joker' || c.type === 'souljoker' ? 'jokers' :
             c.type === 'voucher' ? 'vouchers' :
             c.type.includes('tag') ? 'tags' :
             c.type === 'boss' ? 'blinds' : 'jokers',
    });
  }
  for (const c of should) {
    const matches = seed.score?.matches?.[c.id] || [];
    if (!matches.length) continue;
    const m = matches[0];
    const rarity = c.rarity || window.jokerRarity?.(m.value) || 'Common';
    hand.push({
      kind: 'should', value: m.value, edition: m.edition, clauseId: c.id,
      frame: RARITY_COLOR[rarity], label: c.label && c.label !== 'Any Rare' ? c.label : m.value,
      score: (c.score || 1) * (seed.score.totals[c.id] || 1),
      sheet: 'jokers',
    });
  }

  // Un-matched SHOULD clauses go in a tiny "didn't hit" score line (no big art).
  const unmatched = should.filter(c => !(seed.score?.totals[c.id] > 0));

  // Splay math — Balatro hand fan.
  const n = hand.length;
  const center = (n - 1) / 2;
  const spread = Math.min(8, 44 / Math.max(1, n));   // degrees per card, clamp so 8 cards look right
  const arcDip = 3.5;                                 // px per step of arc
  const mkFan = (i) => {
    const off = i - center;
    return { rotate: off * spread, yOff: Math.abs(off) * arcDip, zIndex: 100 - Math.round(Math.abs(off) * 10) };
  };

  // Sprite renderer for a hand entry
  const renderSprite = (h, size = 96) => {
    const w = size, hh = h.sheet === 'tags' || h.sheet === 'blinds' ? size : Math.round(size * 95 / 71);
    if (h.sheet === 'blinds') return <BossChip name={h.value} size={hh} />;
    return <Sprite sheet={h.sheet} name={h.value} width={w} height={hh} />;
  };

  return (
    <div style={{
      width: 1200, height: 630, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(ellipse at top left, #2d4a38 0%, #0f1a13 70%)`,
      fontFamily: 'm6x11plus, monospace', color: Co.WHITE,
    }}>
      {/* Felt texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08,
        backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 3px)',
      }} />

      {/* Top strip — filter name + branding */}
      <div style={{ position: 'absolute', top: 28, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 16, color: Co.GOLD, letterSpacing: 3, textShadow: '2px 2px 0 rgba(0,0,0,.8)' }}>FILTER</div>
          <div style={{ fontSize: 28, color: Co.WHITE, letterSpacing: 1, textShadow: '2px 2px 0 rgba(0,0,0,.8)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 760 }}>
            {filter.name}
          </div>
        </div>
        <div style={{ fontSize: 16, color: Co.GREY, letterSpacing: 3 }}>Balatro Seed Curator</div>
      </div>

      {/* Seed code — big, LEFT */}
      <div style={{ position: 'absolute', top: 96, left: 40 }}>
        <div style={{ fontSize: 18, color: Co.GREY, letterSpacing: 4 }}>SEED</div>
        <div style={{ fontSize: 108, color: Co.WHITE, letterSpacing: 10, lineHeight: 1, marginTop: 4, textShadow: `3px 4px 0 ${Co.BLACK}` }}>{seed.seed}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 20, color: Co.GREY, letterSpacing: 2 }}>
          <span>{seed.deck} Deck</span>
          <span style={{ color: Co.PANEL_EDGE }}>·</span>
          <span>{seed.stake} Stake</span>
          <span style={{ color: Co.PANEL_EDGE }}>·</span>
          <span style={{ color: allMustHit ? Co.BLUE : Co.RED }}>
            {allMustHit ? '✓ must complete' : '✗ must incomplete'}
          </span>
        </div>
      </div>

      {/* Score — big number, RIGHT */}
      <div style={{ position: 'absolute', top: 96, right: 40, textAlign: 'right' }}>
        <div style={{ fontSize: 18, color: Co.GREY, letterSpacing: 4 }}>SCORE</div>
        <div style={{ fontSize: 140, color: Co.RED, letterSpacing: 4, lineHeight: 1, marginTop: 4, textShadow: `4px 6px 0 ${Co.BLACK}` }}>
          {seed.score.totalScore}
        </div>
      </div>

      {/* THE HAND — splayed rainbow poker-hand of everything that hit. */}
      <div style={{
        position: 'absolute', left: 40, right: 40, bottom: 78,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingLeft: 14,  // compensate first card's -14 marginLeft
      }}>
        {hand.map((h, i) => {
          const fan = mkFan(i);
          return (
            <FannedCard
              key={h.clauseId + ':' + i}
              sprite={renderSprite(h, 96)}
              label={h.label}
              score={h.kind === 'should' ? h.score : null}
              frame={h.frame}
              rotate={fan.rotate}
              yOff={fan.yOff}
              zIndex={fan.zIndex}
              phase={i}
            />
          );
        })}
        {hand.length === 0 && (
          <div style={{ fontSize: 22, color: Co.GREY, letterSpacing: 3, padding: 40 }}>
            no hits — try a different seed
          </div>
        )}
      </div>

      {/* SHOULD score line — unmatched clauses get tiny sad-face stat pills here.
          Room preserved so this reads as a proper scoring readout, not just art. */}
      {unmatched.length > 0 && (
        <div style={{
          position: 'absolute', left: 40, right: 40, bottom: 30,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            fontSize: 12, letterSpacing: 3, padding: '3px 10px',
            background: Co.DARK_RED, color: Co.WHITE, borderRadius: 3,
            textShadow: '1px 1px 0 rgba(0,0,0,.8)',
          }}>MISSED</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {unmatched.map(c => (
              <div key={c.id} style={{
                fontSize: 12, color: Co.GREY, letterSpacing: 1.5,
                padding: '2px 8px', border: `1px dashed ${Co.GREY}`, borderRadius: 3,
              }}>
                {c.label || c.value} <span style={{ color: Co.DARK_RED }}>+{c.score || 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.SeedOGCard = SeedOGCard;
window.RARITY_COLOR = RARITY_COLOR;
