// AntePageV2 — per the reorg:
//
//   ANTE n                  smTag  bgTag  BOSS       ← header row, tags+boss right
//   ┌────┬──────────────────────────────────────┐
//   │ V  │   pack0  pack2  pack4                │    ← voucher column (left), packs grid (2 rows × N cols)
//   │    │   pack1  pack3  pack5                │
//   ├────┴──────────────────────────────────────┤
//   │ SHOP ▸  [joker][joker][tarot]…  (tape)    │    ← infinite horizontal tape, edge fades
//   └───────────────────────────────────────────┘
//
// Ante 1 special: two shop tapes stacked, labeled "Round 1" / "Round 2" (since ante 1 starts at
// Small Blind — you haven't earned a shop yet — so only 4 booster packs, but shop refreshes twice).

const { useState: aUS, useRef: aUR, useEffect: aUE } = React;

const C = window.JimboColor;

// ── bestHit / hitColor ──
const bestHit = (hits) => {
  if (!hits || !hits.length) return null;
  if (hits.some(h => h.kind === 'must')) return 'must';
  return 'should';
};
const hitColor = (k) => k === 'must' ? C.BLUE : k === 'should' ? C.RED : null;

// ── Panel ─
function Panel({ children, style, bg = C.DARK_GREY, edge = C.PANEL_EDGE }) {
  return (
    <div style={{
      background: bg,
      border: `2px solid ${edge}`,
      borderRadius: 6,
      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.04), 0 2px 0 ${C.BLACK}`,
      ...style,
    }}>{children}</div>
  );
}

// ── GlowRing ──
function GlowRing({ kind, children }) {
  if (!kind) return children;
  const color = hitColor(kind);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        position: 'absolute', inset: -3, borderRadius: 6,
        boxShadow: `0 0 0 2px ${color}, 0 0 10px ${color}`,
        opacity: 0.8,
        animation: 'pulseGlow 1.6s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

// Inject keyframes once
(function injectKeyframes(){
  if (document.getElementById('v2-kf')) return;
  const s = document.createElement('style');
  s.id = 'v2-kf';
  s.textContent = `
    @keyframes pulseGlow { 0%,100% { opacity:.55;} 50% { opacity:1;} }
    .v2-shop-scroll::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(s);
})();

// ── Tag chip small ──
function MiniChip({ children, tight, color = C.WHITE }) {
  return (
    <div style={{
      fontFamily: 'm6x11plus, monospace', fontSize: 9, color,
      letterSpacing: 1, textTransform: 'uppercase',
      padding: tight ? '1px 3px' : '2px 4px',
      lineHeight: 1,
    }}>{children}</div>
  );
}

// ── HeaderTile — compact tag/boss tile for top-right row ──
function HeaderTile({ kind, value, hit, label }) {
  const sz = 32;
  const inner =
    kind === 'boss' ? <BossChip name={value} size={sz} /> :
    <TagChip name={value} size={sz} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlowRing kind={hit}>{inner}</GlowRing>
      </div>
      <MiniChip color={hit ? hitColor(hit) : C.GREY}>{label}</MiniChip>
    </div>
  );
}

// ── VoucherSquare — tall left column tile ──
function VoucherSquare({ name, hit }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
      background: C.DARKEST, border: `2px solid ${C.PANEL_EDGE}`, borderRadius: 6,
      padding: '8px 6px', minWidth: 68,
    }}>
      <MiniChip color={hit ? hitColor(hit) : C.GREY}>V</MiniChip>
      {name ? <GlowRing kind={hit}><VoucherMini name={name} size={42} /></GlowRing>
            : <div style={{ width: 42, height: 42, opacity: 0.25, border: `1px dashed ${C.GREY}`, borderRadius: 4 }} />}
      <div style={{
        fontFamily: 'm6x11plus, monospace', fontSize: 9, color: C.WHITE,
        maxWidth: 70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        textAlign: 'center', letterSpacing: 0.5,
      }}>{name || '—'}</div>
    </div>
  );
}

// ── PackCell — tap to fan ──
function PackCell({ pack, idx }) {
  const [open, setOpen] = aUS(false);
  const anyHit = pack.itemHits?.some(h => h.length) ? bestHit(pack.itemHits.flat()) : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, position: 'relative' }}>
      <GlowRing kind={anyHit}>
        <PackSprite kind={pack.type.replace('pack','')} size={44} open={open} onClick={() => setOpen(o => !o)} />
      </GlowRing>
      <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: anyHit ? hitColor(anyHit) : C.GREY, letterSpacing: 1, marginTop: 2 }}>
        P{idx + 1}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 4, padding: '6px 8px',
          background: C.DARKEST, border: `2px solid ${C.PANEL_EDGE}`, borderRadius: 5,
          zIndex: 10, whiteSpace: 'nowrap',
        }}>
          {pack.items.map((it, i) => {
            const itemHit = bestHit(pack.itemHits?.[i]);
            return <GlowRing key={i} kind={itemHit}><JokerMini name={it} size={30} /></GlowRing>;
          })}
        </div>
      )}
    </div>
  );
}

// ── PackGrid — 2 rows × ceil(n/2) cols ──
function PackGrid({ packs }) {
  const cols = Math.max(1, Math.ceil(packs.length / 2));
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, auto)`,
      gridTemplateRows: 'repeat(2, auto)',
      gridAutoFlow: 'column',
      gap: '10px 12px',
      alignItems: 'start', justifyItems: 'center',
    }}>
      {packs.map((p, i) => <PackCell key={i} pack={p} idx={i} />)}
    </div>
  );
}

// ── ShopTape — horizontal grab-scroll with edge fades ──
function ShopTape({ items, label = 'SHOP' }) {
  const ref = aUR(null);
  const drag = aUR({ down: false, x0: 0, sl0: 0 });

  const onDown = (e) => {
    const el = ref.current; if (!el) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    drag.current = { down: true, x0: x, sl0: el.scrollLeft };
    el.style.cursor = 'grabbing';
  };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const el = ref.current; if (!el) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    el.scrollLeft = drag.current.sl0 - (x - drag.current.x0);
  };
  const onUp = () => { const el = ref.current; if (el) el.style.cursor = 'grab'; drag.current.down = false; };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: C.GREY, letterSpacing: 2 }}>{label} ▸</div>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: C.GREY }}>{items.length}</div>
      </div>
      <Panel style={{ padding: '8px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 24, background: `linear-gradient(90deg, ${C.DARK_GREY}, transparent)`, pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 24, background: `linear-gradient(-90deg, ${C.DARK_GREY}, transparent)`, pointerEvents: 'none', zIndex: 2 }} />
        <div
          ref={ref}
          className="v2-shop-scroll"
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          style={{
            overflowX: 'auto', overflowY: 'hidden',
            display: 'flex', gap: 8, padding: '2px 18px',
            cursor: 'grab', userSelect: 'none', scrollbarWidth: 'none',
          }}
        >
          {items.map((item, i) => {
            const hit = bestHit(item.hits);
            return (
              <div key={i} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <GlowRing kind={hit}>
                  <JokerMini name={item.value} size={50} edition={item.edition} />
                </GlowRing>
                <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: hit ? hitColor(hit) : C.GREY, letterSpacing: 1, marginTop: 2 }}>
                  #{i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ── AntePageV2 ───────
function AntePageV2({ ante }) {
  const voucherHit = bestHit(ante._voucherHits);
  const smallHit   = bestHit(ante._smallTagHits);
  const bigHit     = bestHit(ante._bigTagHits);
  const bossHit    = bestHit(ante._bossHits);
  const soulHit    = bestHit(ante._soulHits);

  // Ante 1 quirk: split shopQueue into two rounds for display
  const isAnte1 = ante.ante === 1;
  const shopRounds = isAnte1
    ? [
        { label: 'SHOP · ROUND 1', items: ante.shopQueue.slice(0, Math.ceil(ante.shopQueue.length / 2)) },
        { label: 'SHOP · ROUND 2', items: ante.shopQueue.slice(Math.ceil(ante.shopQueue.length / 2)) },
      ]
    : [{ label: 'SHOP', items: ante.shopQueue }];

  return (
    <div style={{ padding: '12px 10px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header row: ANTE n   smTag bgTag Boss */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: C.GREY, letterSpacing: 2 }}>ANTE</div>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 26, color: C.WHITE, lineHeight: 1 }}>{ante.ante}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <HeaderTile kind="smalltag" value={ante.smallBlindTag} hit={smallHit} label="SMALL" />
          <HeaderTile kind="bigtag"   value={ante.bigBlindTag}   hit={bigHit}   label="BIG" />
          <HeaderTile kind="boss"     value={ante.boss}          hit={bossHit}  label="BOSS" />
        </div>
      </div>

      {/* Voucher + Packs row */}
      <Panel style={{ padding: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <VoucherSquare name={ante.voucher} hit={voucherHit} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {ante.boosterPacks?.length > 0
              ? <PackGrid packs={ante.boosterPacks} />
              : <div style={{ color: C.GREY, fontSize: 10, fontFamily: 'm6x11plus, monospace' }}>NO PACKS</div>}
          </div>
        </div>
      </Panel>

      {/* Shop tape(s) */}
      {shopRounds.map((r, i) => (
        <ShopTape key={i} items={r.items} label={r.label} />
      ))}

      {/* Soul joker callout */}
      {ante.soulJoker && (
        <Panel style={{ padding: 8, borderColor: soulHit === 'must' ? C.GOLD : C.DARK_PURPLE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GlowRing kind={soulHit}><JokerMini name={ante.soulJoker.value} size={44} edition={ante.soulJoker.edition} /></GlowRing>
            <div>
              <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: C.GOLD_TEXT, letterSpacing: 2 }}>SOUL JOKER</div>
              <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 14, color: C.WHITE }}>{ante.soulJoker.value}</div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

window.AntePageV2 = AntePageV2;
window.GlowRing = GlowRing;
window.bestHit = bestHit;
window.hitColor = hitColor;
