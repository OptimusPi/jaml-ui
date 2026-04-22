// <Sprite> — positions a slice of a sprite sheet via background-image.
// Works with any sheet registered in window.SHEETS and any name map loaded
// via loadSpriteMap(). Sizes are in display-px; pixel-art is preserved via
// image-rendering: pixelated.

const { useState, useEffect, useRef } = React;

// ─── Name maps, loaded async from JSON. Keys are normalized (lowercase, no
//     spaces, no punctuation) to tolerate both "Blueprint" and "blueprint"
//     inputs.
const SPRITE_MAPS = {};

function normalizeName(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function loadSpriteMap(sheet, url, { field = 'pos' } = {}) {
  const r = await fetch(url);
  const data = await r.json();
  const out = {};
  if (Array.isArray(data)) {
    for (const e of data) out[normalizeName(e.name)] = e[field];
  } else if (data.sprites) {
    // blinds_metadata shape
    const walk = (obj) => {
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === 'object' && 'x' in v && 'y' in v) {
          out[normalizeName(k)] = { x: v.x, y: v.y };
        } else if (v && typeof v === 'object') {
          walk(v);
        }
      }
    };
    walk(data.sprites);
  }
  SPRITE_MAPS[sheet] = { ...(SPRITE_MAPS[sheet] || {}), ...out };
  return out;
}

function getSpritePos(sheet, name) {
  const m = SPRITE_MAPS[sheet];
  if (!m) return null;
  return m[normalizeName(name)] || null;
}

// Hook: re-render when any sprite map loads. Used by Sprite to pick up
// positions that arrive after first render.
const mapListeners = new Set();
function useSpriteMapTick() {
  const [, set] = useState(0);
  useEffect(() => {
    const fn = () => set((n) => n + 1);
    mapListeners.add(fn);
    return () => mapListeners.delete(fn);
  }, []);
}
const _origLoadSpriteMap = loadSpriteMap;
window.loadSpriteMap = async (...args) => {
  const r = await _origLoadSpriteMap(...args);
  for (const fn of mapListeners) fn();
  return r;
};

// ─── <Sprite> — pos is {x,y} grid index. width/height in display px.
function Sprite({ sheet, name, pos: posOverride, width, height, className = '', style = {}, children }) {
  useSpriteMapTick();
  const sheetInfo = window.SHEETS[sheet];
  if (!sheetInfo) return null;
  const pos = posOverride || getSpritePos(sheet, name);

  // Native sprite aspect (before display sizing). Pull from the sheet image
  // if already cached, else assume 71:95 joker ratio as a safe default.
  const aspect = SHEET_ASPECTS[sheet] || (95 / 71);
  const w = width || 71;
  const h = height || Math.round(w * aspect);

  if (!pos) {
    return (
      <div className={className} style={{ width: w, height: h, background: 'rgba(255,0,0,0.08)', border: '1px dashed rgba(255,0,0,0.3)', boxSizing: 'border-box', ...style }} title={`missing: ${sheet}/${name}`}>
        {children}
      </div>
    );
  }

  const bgW = w * sheetInfo.cols;
  const bgH = h * sheetInfo.rows;

  return (
    <div
      className={className}
      style={{
        width: w,
        height: h,
        backgroundImage: `url(${sheetInfo.src})`,
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `-${pos.x * w}px -${pos.y * h}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        flexShrink: 0,
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Aspect ratios per sheet (h/w), so Sprite can size correctly from just a
// width. Derived from image-metadata; fallback is joker-like.
const SHEET_ASPECTS = {
  jokers:    95 / 71,   // 710/10 = 71, 1520/16 = 95
  tarots:    95 / 71,
  vouchers:  95 / 71,
  tags:      34 / 34,   // tags are square-ish
  boosters:  190 / 142, // 568/4 = 142, 1710/9 = 190
  blinds:    1,         // 68×68 square
  editions:  95 / 71,
  enhancers: 95 / 71,
  stickers:  95 / 71,
  deck:      95 / 71,
  stakes:    1,
};

// ─── <HitStamp> — small corner badge: green check for should-hit, gold
//     star for must-hit. Positioned absolutely, so parent must be relative.
function HitStamp({ kind }) {
  if (!kind) return null;
  const palette = kind === 'must'
    ? { bg: window.JimboColor.GOLD, border: '#8a6a1f', glyph: '★', color: '#1e2b2d' }
    : { bg: window.JimboColor.GREEN_TEXT, border: '#1f7a55', glyph: '✓', color: '#fff' };

  return (
    <div
      style={{
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        background: palette.bg,
        border: `1.5px solid ${palette.border}`,
        color: palette.color,
        fontSize: 11,
        lineHeight: '13px',
        textAlign: 'center',
        fontFamily: 'm6x11plus, monospace',
        boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {palette.glyph}
    </div>
  );
}

// ─── <JokerMini>, <TarotMini>, etc. — pre-sized wrappers with optional hit.
function JokerMini({ name, hit, size = 64, edition, onClick }) {
  const w = size;
  const h = Math.round(size * 95 / 71);
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: w,
        height: h,
        cursor: onClick ? 'pointer' : 'default',
        filter: hit ? 'none' : 'brightness(0.78) saturate(0.85)',
        transition: 'filter 180ms',
      }}
    >
      <Sprite sheet="jokers" name={name} width={w} height={h} />
      {edition && <Sprite sheet="editions" pos={EDITION_POS[edition] || { x: 0, y: 0 }} width={w} height={h} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.85 }} />}
      <HitStamp kind={hit} />
    </div>
  );
}

const EDITION_POS = { Foil: { x: 0, y: 0 }, Holographic: { x: 1, y: 0 }, Polychrome: { x: 2, y: 0 }, Negative: { x: 3, y: 0 } };

function TarotMini({ name, hit, size = 64, onClick }) {
  const w = size;
  const h = Math.round(size * 95 / 71);
  return (
    <div onClick={onClick} style={{ position: 'relative', width: w, height: h, cursor: onClick ? 'pointer' : 'default', filter: hit ? 'none' : 'brightness(0.78) saturate(0.85)', transition: 'filter 180ms' }}>
      <Sprite sheet="tarots" name={name} width={w} height={h} />
      <HitStamp kind={hit} />
    </div>
  );
}

function VoucherMini({ name, hit, size = 64, onClick }) {
  const w = size;
  const h = Math.round(size * 95 / 71);
  return (
    <div onClick={onClick} style={{ position: 'relative', width: w, height: h, cursor: onClick ? 'pointer' : 'default', filter: hit ? 'none' : 'brightness(0.85) saturate(0.9)', transition: 'filter 180ms' }}>
      <Sprite sheet="vouchers" name={name} width={w} height={h} />
      <HitStamp kind={hit} />
    </div>
  );
}

function TagChip({ name, hit, size = 28, onClick }) {
  return (
    <div onClick={onClick} style={{ position: 'relative', cursor: onClick ? 'pointer' : 'default', filter: hit ? 'none' : 'none' }}>
      <Sprite sheet="tags" name={name} width={size} height={size} />
      <HitStamp kind={hit} />
    </div>
  );
}

function BossChip({ name, hit, size = 48, onClick }) {
  // BlindChips.png is an animation strip (21 frames per row). Show frame 0
  // by overriding pos.y to the row for this boss and pos.x = 0.
  const basePos = getSpritePos('blinds', name);
  if (!basePos) return <Sprite sheet="blinds" name={name} width={size} height={size} />;
  return (
    <div onClick={onClick} style={{ position: 'relative', cursor: onClick ? 'pointer' : 'default' }}>
      <Sprite sheet="blinds" pos={{ x: 0, y: basePos.y }} width={size} height={size} />
      <HitStamp kind={hit} />
    </div>
  );
}

function PackSprite({ kind, size = 56, onClick, open, hit }) {
  // kind: 'arcana' | 'celestial' | 'spectral' | 'buffoon' | 'standard' + 'jumbo' / 'mega' variants
  const w = size;
  const h = Math.round(size * 190 / 142);
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: w,
        height: h,
        cursor: onClick ? 'pointer' : 'default',
        transform: open ? 'translateY(-4px) rotate(-2deg)' : 'none',
        transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <Sprite sheet="boosters" name={kind} width={w} height={h} />
      <HitStamp kind={hit} />
    </div>
  );
}

window.Sprite = Sprite;
window.HitStamp = HitStamp;
window.JokerMini = JokerMini;
window.TarotMini = TarotMini;
window.VoucherMini = VoucherMini;
window.TagChip = TagChip;
window.BossChip = BossChip;
window.PackSprite = PackSprite;
window.normalizeName = normalizeName;
window.getSpritePos = getSpritePos;
