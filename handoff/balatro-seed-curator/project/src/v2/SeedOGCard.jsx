// SeedOGCard — 1200×630 social-preview for /seed/[seed]/og.png
//
// REBUILT. Old version was redundant: a fan AND rarity counts AND piles AND
// branding all fighting for attention. Real Balatro screens are quieter —
// one big hero, one supporting ribbon, max. So:
//
//   ┌────────────────────────────────────────────────────────────────┐
//   │ ◇ JAMMY · seed                                       gold ★ │  ← micro chrome
//   │                                                                │
//   │   X1B8TW4J                              ┌──────┐               │
//   │   ─────────                             │ HERO │  perkeo       │  ← seed code, hero card
//   │   red deck · gold stake                 │ jkr  │  legendary    │
//   │                                         └──────┘               │
//   │                                                                │
//   │   ╔════════════════════════════════════════════════════╗       │
//   │   ║  v v v v v   t t t t t t   ⊛ ⊛ ⊛                  ║       │  ← single ribbon:
//   │   ║  vouchers     tags          standout jokers        ║       │     vouchers + tags + jokers
//   │   ╚════════════════════════════════════════════════════╝       │
//   └────────────────────────────────────────────────────────────────┘
//
// Hero is the most prized joker (legendary > rare > uncommon, then most-
// repeated). The hero gets a soft glow in its rarity color and edition
// shimmer. Counts go in subtitle text — no big number column.
//
// Background: real Balatro swirl (BalatroSwirl) so the card feels alive
// even as a static .png. When this is rendered server-side via headless
// chrome the swirl resolves to its CSS gradient fallback — still on-brand.

const Co = window.JimboColor;

const RARITY_COLOR = {
  Common:    '#009dff',
  Uncommon:  '#3bc47e',
  Rare:      '#fe5f55',
  Legendary: '#b26cbd',
};

// Map raw data keys to display names. Most jokers can be derived
// (camel split + capitalize), but some are irregular ("perkeo" → "Perkeo").
const OG_DISPLAY_NAME_OVERRIDES = {
  'hangingchad': 'Hanging Chad',
  'evensteven':  'Even Steven',
  'gros michel': 'Gros Michel',
  'eightball':   '8 Ball',
  'mysticsummit':'Mystic Summit',
  'loyaltycard': 'Loyalty Card',
  'mrbones':     'Mr. Bones',
  'delayedgratification': 'Delayed Gratification',
  'raisedfist':  'Raised Fist',
  'scaryface':   'Scary Face',
  'abstractjoker': 'Abstract Joker',
  'wrathfuljoker': 'Wrathful Joker',
  'gluttonousjoker': 'Gluttonous Joker',
  'jollyjoker':  'Jolly Joker',
  'lustyjoker':  'Lusty Joker',
  'greedyjoker': 'Greedy Joker',
  'zanyjoker':   'Zany Joker',
  'madjoker':    'Mad Joker',
  'crazyjoker':  'Crazy Joker',
  'drolljoker':  'Droll Joker',
  'slyjoker':    'Sly Joker',
  'wilyjoker':   'Wily Joker',
  'cleverjoker': 'Clever Joker',
  'steeljoker':  'Steel Joker',
  'marblejoker': 'Marble Joker',
  'halfjoker':   'Half Joker',
  'ceremonialdagger': 'Ceremonial Dagger',
  'ceremonial':  'Ceremonial Dagger',
  'theduo':      'The Duo',
  'thetrio':     'The Trio',
  'thefamily':   'The Family',
  'theorder':    'The Order',
  'thetribe':    'The Tribe',
};
function ogDisplayName(raw) {
  const k = String(raw || '').toLowerCase();
  if (OG_DISPLAY_NAME_OVERRIDES[k]) return OG_DISPLAY_NAME_OVERRIDES[k];
  // generic: first letter caps, leave word breaks in source as-is
  return k.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Pick the single best joker to feature. Priority: Legendary > Rare > Uncommon.
// Within a tier, prefer most-repeated. Returns { name, edition, count, antes, rarity, color }.
function ogPickHero(seed) {
  const seen = {};
  const push = (name, edition, ante) => {
    const key = name + (edition || '');
    if (!seen[key]) seen[key] = { name, edition, antes: new Set(), count: 0 };
    seen[key].antes.add(ante);
    seen[key].count++;
  };
  for (const a of seed.antes || []) {
    for (const it of a.shopQueue || []) {
      if (it.type === 'joker') push(it.value, it.edition, a.ante);
    }
    if (a.soulJoker) push(a.soulJoker.value, a.soulJoker.edition, a.ante);
  }
  const pool = Object.values(seen);
  const tierOrder = { Legendary: 0, Rare: 1, Uncommon: 2, Common: 3 };
  pool.sort((a, b) => {
    const ra = window.jokerRarity(a.name), rb = window.jokerRarity(b.name);
    if (tierOrder[ra] !== tierOrder[rb]) return tierOrder[ra] - tierOrder[rb];
    return b.count - a.count;
  });
  if (pool.length === 0) return null;
  const h = pool[0];
  const r = window.jokerRarity(h.name);
  return { ...h, rarity: r, color: RARITY_COLOR[r] || Co.GREY, displayName: ogDisplayName(h.name) };
}

function ogRarityCounts(seed) {
  const c = { Legendary: 0, Rare: 0, Uncommon: 0, Common: 0 };
  for (const a of seed.antes || []) {
    for (const it of a.shopQueue || []) {
      if (it.type !== 'joker') continue;
      const r = window.jokerRarity(it.value);
      if (c[r] !== undefined) c[r]++;
    }
    if (a.soulJoker) {
      const r = window.jokerRarity(a.soulJoker.value);
      if (c[r] !== undefined) c[r]++;
    }
  }
  return c;
}

function ogUniqueVouchers(seed) {
  const seen = {};
  for (const a of seed.antes || []) {
    if (a.voucher && !seen[a.voucher]) seen[a.voucher] = a.ante;
  }
  return Object.entries(seen).map(([name, ante]) => ({ name, ante }));
}

function ogAllTags(seed) {
  const out = [];
  for (const a of seed.antes || []) {
    if (a.smallBlindTag) out.push({ name: a.smallBlindTag, ante: a.ante });
    if (a.bigBlindTag)   out.push({ name: a.bigBlindTag,   ante: a.ante });
  }
  return out;
}

// Standout jokers other than the hero — top 4 legendary/rare to show in ribbon
function ogStandoutJokers(seed, hero) {
  const tier = { Legendary: 0, Rare: 1, Uncommon: 2 };
  const seen = {};
  for (const a of seed.antes || []) {
    for (const it of a.shopQueue || []) {
      if (it.type !== 'joker') continue;
      const r = window.jokerRarity(it.value);
      if (tier[r] === undefined) continue;
      const key = it.value + (it.edition || '');
      if (hero && key === hero.name + (hero.edition || '')) continue;
      if (!seen[key]) seen[key] = { name: it.value, edition: it.edition, rarity: r, count: 0 };
      seen[key].count++;
    }
    if (a.soulJoker) {
      const r = window.jokerRarity(a.soulJoker.value);
      const key = a.soulJoker.value + (a.soulJoker.edition || '');
      if (hero && key === hero.name + (hero.edition || '')) continue;
      if (tier[r] !== undefined) {
        if (!seen[key]) seen[key] = { name: a.soulJoker.value, edition: a.soulJoker.edition, rarity: r, count: 0 };
        seen[key].count++;
      }
    }
  }
  return Object.values(seen)
    .sort((a, b) => tier[a.rarity] - tier[b.rarity] || b.count - a.count)
    .slice(0, 4);
}

// Idle wobble for the hero card — Balatro card.lua ambient_tilt
(function injectOgKf2(){
  if (document.getElementById('og-card-kf-v2')) return;
  const s = document.createElement('style');
  s.id = 'og-card-kf-v2';
  s.textContent = `
    @keyframes og-hero-tilt {
      0%,100% { transform: rotate(-1.2deg) translateY(0); }
      50%     { transform: rotate(1.2deg)  translateY(-3px); }
    }
    @keyframes og-hero-glow {
      0%,100% { filter: drop-shadow(0 0 14px var(--g)) drop-shadow(0 0 4px var(--g)); }
      50%     { filter: drop-shadow(0 0 22px var(--g)) drop-shadow(0 0 8px var(--g)); }
    }
  `;
  document.head.appendChild(s);
})();

function HeroCard({ hero }) {
  if (!hero) {
    return (
      <div style={{
        width: 240, height: 320, border: `4px dashed ${Co.GREY}`, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: Co.GREY, fontSize: 18, letterSpacing: 2, fontFamily: 'm6x11plus, monospace',
      }}>no joker</div>
    );
  }
  const w = 240, h = Math.round(w * 95 / 71);
  return (
    <div style={{ position: 'relative', animation: 'og-hero-tilt 5s ease-in-out infinite', transformOrigin: '50% 100%' }}>
      <div style={{
        ['--g']: hero.color + 'cc',
        animation: 'og-hero-glow 3.4s ease-in-out infinite',
        padding: 10, borderRadius: 14,
        border: `5px solid ${hero.color}`,
        background: 'rgba(0,0,0,.55)',
        boxShadow: `0 8px 0 rgba(0,0,0,.6)`,
      }}>
        <Sprite sheet="jokers" name={hero.name} width={w} height={h} edition={hero.edition} />
      </div>
      {/* count chip if seen multiple times */}
      {hero.count > 1 && (
        <div style={{
          position: 'absolute', top: -16, right: -16,
          minWidth: 44, padding: '4px 10px', height: 36,
          background: Co.RED, border: `4px solid ${Co.DARKEST}`, borderRadius: 18,
          color: Co.WHITE, fontSize: 22, lineHeight: '24px', textAlign: 'center',
          textShadow: '1px 1px 0 rgba(0,0,0,.8)', letterSpacing: 1,
          fontFamily: 'm6x11plus, monospace',
        }}>×{hero.count}</div>
      )}
    </div>
  );
}

// One mini card in the ribbon — sprite on a faintly-glowing dark plaque.
function RibbonChip({ children, frame, label, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <div style={{
        padding: 6, borderRadius: 8,
        border: `3px solid ${frame}`, background: 'rgba(0,0,0,.55)',
        boxShadow: `0 4px 0 rgba(0,0,0,.55), 0 0 14px ${frame}55`,
      }}>{children}</div>
      {label && (
        <div style={{
          fontSize: 11, color: frame, letterSpacing: 2, fontFamily: 'm6x11plus, monospace',
          textShadow: '1px 1px 0 rgba(0,0,0,.85)',
          maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</div>
      )}
      {sub && (
        <div style={{
          fontSize: 9, color: Co.GREY, letterSpacing: 1.5, fontFamily: 'm6x11plus, monospace',
          textShadow: '1px 1px 0 rgba(0,0,0,.85)', marginTop: -4,
        }}>{sub}</div>
      )}
    </div>
  );
}

function SeedOGCard({ seed }) {
  const hero = ogPickHero(seed);
  const counts = ogRarityCounts(seed);
  const vouchers = ogUniqueVouchers(seed);
  const tags = ogAllTags(seed).slice(0, 6);
  const standout = ogStandoutJokers(seed, hero);

  return (
    <div style={{
      width: 1200, height: 630, position: 'relative', overflow: 'hidden',
      fontFamily: 'm6x11plus, monospace', color: Co.WHITE,
    }}>
      {/* Real Balatro swirl behind it all */}
      <window.BalatroSwirl palette="menu" spinAmount={0.5} contrast={3.5} pixelSize={500} />

      {/* Subtle vignette so the seed code reads */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.55) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        {/* TOP CHROME — wordmark left, real stake-chip + deck-card right */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '22px 36px 0', flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, color: Co.WHITE, letterSpacing: 3, opacity: 0.9 }}>
            <span style={{ color: Co.GOLD_TEXT }}>jammy</span>
            <span style={{ color: Co.GREY, margin: '0 10px' }}>·</span>
            <span style={{ color: Co.WHITE }}>seed finder</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 14px 6px 8px',
            border: `2px solid ${Co.PANEL_EDGE}`,
            borderTopColor: Co.BORDER_SILVER, borderLeftColor: Co.BORDER_SILVER,
            borderBottomColor: Co.BORDER_SOUTH,
            borderRadius: 8,
            background: 'rgba(0,0,0,.6)',
            fontSize: 14, color: Co.WHITE, letterSpacing: 2,
          }}>
            <window.DeckSprite name={seed.deck || 'Red'} size={28} />
            <span style={{ opacity: 0.8 }}>{(seed.deck || 'Red').toLowerCase()}</span>
            <span style={{ width: 1, height: 22, background: Co.PANEL_EDGE }} />
            <window.StakeSprite name={seed.stake || 'Gold'} size={26} />
            <span style={{ color: Co.GOLD_TEXT, opacity: 0.95 }}>{(seed.stake || 'Gold').toLowerCase()} stake</span>
          </div>
        </div>

        {/* HERO ROW — seed code (left) + joker (right) */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 60px', gap: 40, minHeight: 0,
        }}>
          {/* Seed identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, color: Co.GREY, letterSpacing: 4,
              marginBottom: 6,
            }}>seed</div>
            <div style={{
              fontSize: 132, color: Co.WHITE, letterSpacing: 12, lineHeight: 1,
              textShadow: `5px 6px 0 ${Co.BLACK}, 0 0 28px rgba(0,0,0,.6)`,
              wordBreak: 'break-all',
            }}>{seed.seed}</div>
            {/* rarity counts inline — no big number column */}
            <div style={{
              marginTop: 26, display: 'flex', gap: 22, alignItems: 'baseline',
              fontSize: 18, letterSpacing: 2,
              textShadow: `1px 1px 0 ${Co.BLACK}`,
            }}>
              <span style={{ color: RARITY_COLOR.Legendary }}>{counts.Legendary} legendary</span>
              <span style={{ color: RARITY_COLOR.Rare }}>{counts.Rare} rare</span>
              <span style={{ color: RARITY_COLOR.Uncommon }}>{counts.Uncommon} uncommon</span>
              <span style={{ color: Co.GREY }}>· {(seed.antes || []).length} antes</span>
            </div>
          </div>

          {/* Hero joker — the standout */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <HeroCard hero={hero} />
            {hero && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 24, color: hero.color, letterSpacing: 2,
                  textShadow: `2px 2px 0 ${Co.BLACK}`, marginTop: 4,
                }}>{hero.displayName || hero.name}</div>
                <div style={{
                  fontSize: 13, color: Co.GREY, letterSpacing: 2, marginTop: 4,
                  textShadow: `1px 1px 0 ${Co.BLACK}`,
                }}>{hero.rarity.toLowerCase()}{hero.edition ? ` · ${String(hero.edition).toLowerCase()}` : ''}</div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM RIBBON — vouchers + tags only; standouts shown as a tasteful run */}
        <div style={{
          margin: '0 36px 28px', flexShrink: 0,
          background: 'rgba(0,0,0,.55)',
          border: `2px solid ${Co.BORDER_SILVER}`,
          borderBottomColor: Co.BORDER_SOUTH,
          borderRadius: 8,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,.04), 0 2px 0 #000`,
          padding: '14px 22px',
          display: 'flex', alignItems: 'center', gap: 22,
        }}>
          {/* vouchers cluster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: Co.GREY, letterSpacing: 3 }}>vouchers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {vouchers.length === 0 && (
                <div style={{ fontSize: 12, color: Co.GREY }}>none</div>
              )}
              {vouchers.slice(0, 5).map((v, i) => (
                <Sprite key={i} sheet="vouchers" name={v.name} width={42} height={Math.round(42*95/71)} />
              ))}
            </div>
          </div>
          <div style={{ width: 1, alignSelf: 'stretch', background: Co.PANEL_EDGE }} />
          {/* tags cluster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: Co.GREY, letterSpacing: 3 }}>tags</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {tags.length === 0 && (
                <div style={{ fontSize: 12, color: Co.GREY }}>none</div>
              )}
              {tags.map((t, i) => (
                <TagChip key={i} name={t.name} size={34} />
              ))}
            </div>
          </div>
          <div style={{ width: 1, alignSelf: 'stretch', background: Co.PANEL_EDGE }} />
          {/* other standouts — bare sprites, no boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: Co.GREY, letterSpacing: 3 }}>also notable</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start' }}>
              {standout.length === 0 && (
                <div style={{ fontSize: 12, color: Co.GREY }}>—</div>
              )}
              {standout.map((j, i) => (
                <div key={i} style={{
                  filter: `drop-shadow(0 0 6px ${RARITY_COLOR[j.rarity]}66)`,
                }}>
                  <Sprite sheet="jokers" name={j.name} width={50} height={Math.round(50*95/71)} edition={j.edition} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SeedOGCard = SeedOGCard;
window.RARITY_COLOR = RARITY_COLOR;
