// SeedAnalyzer — full-screen modal for one or many seeds.
//
// CHROME-FREE for MCP-app rendering. Background is the real Balatro swirl
// shader (BalatroSwirl, ported from background.fs) by default. Pass
// chrome="black" for a flat-black backdrop, or chrome="none" to render with
// no backdrop at all (host provides one).
//
// Stake is hardcoded GOLD per the analyzer's contract.
//
// Layout (per seed):
//   ┌─────────────────────────────────┐
//   │   12/103   ‹ ABCD COPY ›   ✕    │  ← floating top: no panel, no border
//   │                                 │
//   │  PAGE 0: PREVIEW (translucent)  │  ← legendary/rare counts, vouchers, tags
//   │  PAGE 1+: ANTE PAGES (JamlMap)  │
//   │                                 │
//   │   ◀ swirl background visible ▶  │
//   │                                 │
//   │     [JimboUI Back button]       │  ← floating, always thumb-zone
//   └─────────────────────────────────┘
//
// Gestures:
//   - Horizontal swipe on PREVIEW    → flips between SEEDS (12 of 103)
//   - Horizontal swipe on ANTE PAGE  → flips between ANTES of current seed
//   - Vertical swipe up from PREVIEW → snap into Ante 1
//   - Vertical swipe down from Ante  → snap back to Preview
//   - Back button (or Esc)           → close

const { useState: saUS, useRef: saUR, useEffect: saUE, useMemo: saUM } = React;
const Csa = window.JimboColor;

function rarityCounts(seed) {
  const buckets = { Legendary: [], Rare: [], Uncommon: [], Negative: [] };
  for (const a of seed.antes) {
    for (const it of a.shopQueue || []) {
      if (it.type !== 'joker') continue;
      const r = window.jokerRarity(it.value);
      if (buckets[r]) buckets[r].push({ name: it.value, ante: a.ante, edition: it.edition });
      if (it.edition === 'Negative') buckets.Negative.push({ name: it.value, ante: a.ante, edition: 'Negative' });
    }
    for (const p of a.boosterPacks || []) {
      for (const item of p.items || []) {
        const r = window.jokerRarity(item);
        if (buckets[r] && (r === 'Legendary' || r === 'Rare')) buckets[r].push({ name: item, ante: a.ante });
      }
    }
    if (a.soulJoker) {
      buckets.Legendary.push({ name: a.soulJoker.value, ante: a.ante, edition: a.soulJoker.edition });
      if (a.soulJoker.edition === 'Negative') buckets.Negative.push({ name: a.soulJoker.value, ante: a.ante, edition: 'Negative' });
    }
  }
  // De-dup
  for (const k of Object.keys(buckets)) {
    const seen = new Set();
    buckets[k] = buckets[k].filter(x => {
      const key = `${x.name}|${x.ante}|${x.edition || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return buckets;
}

function allVouchers(seed) {
  return seed.antes.filter(a => a.voucher).map(a => ({ name: a.voucher, ante: a.ante, hit: !!(a._voucherHits?.length) }));
}
function allTags(seed) {
  const out = [];
  for (const a of seed.antes) {
    if (a.smallBlindTag) out.push({ name: a.smallBlindTag, ante: a.ante, hit: !!(a._smallTagHits?.length) });
    if (a.bigBlindTag)   out.push({ name: a.bigBlindTag, ante: a.ante, hit: !!(a._bigTagHits?.length) });
  }
  return out;
}

// ── RarityRow — one line: "Legendary ×2  perkeo · canio" ──
function RarityRow({ label, color, items, emptyText = 'none' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
      <div style={{
        minWidth: 90,
        fontFamily: 'm6x11plus, monospace', fontSize: 11, color, letterSpacing: 1.5,
        textShadow: '1px 1px 0 rgba(0,0,0,.8)',
      }}>{label}</div>
      <div style={{ minWidth: 22, textAlign: 'right',
        fontFamily: 'm6x11plus, monospace', fontSize: 12, color: Csa.WHITE,
        textShadow: '1px 1px 0 rgba(0,0,0,.8)',
      }}>×{items.length}</div>
      <div style={{ flex: 1, display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {items.length === 0
          ? <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Csa.GREY, opacity: 0.6 }}>{emptyText}</div>
          : items.slice(0, 8).map((it, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                <window.JokerMini name={it.name} size={28} edition={it.edition} />
              </div>
            ))}
      </div>
    </div>
  );
}

// ── Translucent jimbo-card — used in place of grey panels. ─
// Ink-on-swirl: dark inner with a gold/silver edge; reads on any palette.
function JimboCard({ children, style = {}, edge = Csa.PANEL_EDGE }) {
  return (
    <div style={{
      background: 'rgba(15, 24, 26, 0.78)',
      border: `2px solid ${edge}`,
      borderRadius: 8,
      boxShadow: `0 3px 0 rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.04)`,
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      ...style,
    }}>{children}</div>
  );
}

// ── PreviewPage — leftmost / first page (chrome-free, swirl shows through) ─
function PreviewPage({ seed, onSwipeUpHint }) {
  const buckets = saUM(() => rarityCounts(seed), [seed]);
  const vouchers = saUM(() => allVouchers(seed), [seed]);
  const tags = saUM(() => allTags(seed), [seed]);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'm6x11plus, monospace',
      position: 'relative',
    }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 14px 0', scrollbarWidth: 'none' }}>
        {/* RARITY PREVIEW */}
        <JimboCard style={{ padding: '8px 10px', marginBottom: 10 }}>
          <RarityRow label="Legendary" color={Csa.GOLD}        items={buckets.Legendary} />
          <RarityRow label="Rare"      color={Csa.RED}         items={buckets.Rare} />
          <RarityRow label="Uncommon"  color={Csa.GREEN_TEXT}  items={buckets.Uncommon} />
          <RarityRow label="Negative"  color={Csa.PURPLE}      items={buckets.Negative} emptyText="no negatives" />
        </JimboCard>

        {/* VOUCHERS strip */}
        <JimboCard style={{ padding: '6px 10px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ minWidth: 70, fontSize: 10, color: Csa.GOLD_TEXT, letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>Vouchers</div>
          <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {vouchers.length === 0
              ? <div style={{ fontSize: 10, color: Csa.GREY }}>none</div>
              : vouchers.map((v, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <window.GoldBase kind={v.hit ? 'must' : null}>
                      <window.VoucherMini name={v.name} size={28} />
                    </window.GoldBase>
                    <div style={{ fontSize: 8, color: Csa.GREY, letterSpacing: 1, marginTop: 1 }}>A{v.ante}</div>
                  </div>
                ))}
          </div>
        </JimboCard>

        {/* TAGS strip */}
        <JimboCard style={{ padding: '6px 10px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ minWidth: 70, fontSize: 10, color: Csa.GOLD_TEXT, letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>Tags</div>
          <div style={{ display: 'flex', gap: 5, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {tags.map((t, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                <window.GoldBase kind={t.hit ? 'must' : null}>
                  <window.TagChip name={t.name} size={22} />
                </window.GoldBase>
              </div>
            ))}
          </div>
        </JimboCard>
      </div>

      {/* Bottom: Ante 1 peek — translucent, no grey panel */}
      <div
        onClick={onSwipeUpHint}
        style={{
          position: 'relative', height: 96, cursor: 'pointer', overflow: 'hidden',
        }}
      >
        {/* Mini Ante 1 strip on a translucent jimbo-card */}
        <JimboCard style={{ position: 'absolute', inset: '6px 10px', padding: '6px 10px', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, color: Csa.WHITE, letterSpacing: 2, marginBottom: 4, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>== Ante 1 ==</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {seed.antes[0]?.voucher && <window.VoucherMini name={seed.antes[0].voucher} size={28} />}
            <window.BossChip name={seed.antes[0]?.boss} size={26} />
            {(seed.antes[0]?.shopQueue || []).slice(0, 6).map((it, i) => (
              <window.JokerMini key={i} name={it.value} size={28} edition={it.edition} />
            ))}
          </div>
        </JimboCard>
        {/* Blue fade overlay → swirl */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, rgba(15,24,26,0) 0%, rgba(0,87,161,.55) 70%, rgba(0,40,80,.85) 100%)`,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: 6,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'm6x11plus, monospace', fontSize: 11, color: Csa.WHITE,
            letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.85)',
            animation: 'sa-bob 1.6s ease-in-out infinite',
          }}>↑ swipe up · jaml map</div>
        </div>
      </div>
    </div>
  );
}

// ── AntesPager — horizontal pager between antes, with tall red striding arrows ──
function AntesPager({ seed, anteIdx, setAnteIdx }) {
  const drag = saUR({ active: false, x0: 0, y0: 0, locked: null });
  const [dx, setDx] = saUS(0);
  const [w, setW] = saUS(0);
  const wrapRef = saUR(null);

  saUE(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const onDown = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = { active: true, x0: x, y0: y, locked: null };
  };
  const onMove = (e) => {
    if (!drag.current.active) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dxN = x - drag.current.x0, dyN = y - drag.current.y0;
    if (!drag.current.locked) {
      if (Math.abs(dxN) > 8 && Math.abs(dxN) > Math.abs(dyN)) drag.current.locked = 'x';
      else if (Math.abs(dyN) > 8) drag.current.locked = 'y';
    }
    if (drag.current.locked === 'x') setDx(dxN);
  };
  const onUp = () => {
    if (drag.current.locked === 'x') {
      if (dx < -60 && anteIdx < seed.antes.length - 1) setAnteIdx(anteIdx + 1);
      else if (dx > 60 && anteIdx > 0) setAnteIdx(anteIdx - 1);
    }
    drag.current.active = false; drag.current.locked = null;
    setDx(0);
  };

  const stride = (dir) => {
    const next = Math.max(0, Math.min(seed.antes.length - 1, anteIdx + dir));
    setAnteIdx(next);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Tall red striding arrows — jut above and below the content. */}
      <div
        onClick={() => stride(-1)}
        style={{
          position: 'absolute', top: -8, bottom: -8, left: 0, width: 22,
          background: anteIdx > 0 ? Csa.RED : Csa.DARK_RED,
          opacity: anteIdx > 0 ? 1 : 0.3,
          cursor: anteIdx > 0 ? 'pointer' : 'default',
          boxShadow: `inset -2px 0 0 ${Csa.DARK_RED}, 0 4px 0 rgba(0,0,0,.5)`,
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: Csa.WHITE, fontSize: 22, fontFamily: 'm6x11plus, monospace',
          textShadow: '1px 1px 0 rgba(0,0,0,.8)',
          zIndex: 10,
        }}
      >‹</div>
      <div
        onClick={() => stride(1)}
        style={{
          position: 'absolute', top: -8, bottom: -8, right: 0, width: 22,
          background: anteIdx < seed.antes.length - 1 ? Csa.RED : Csa.DARK_RED,
          opacity: anteIdx < seed.antes.length - 1 ? 1 : 0.3,
          cursor: anteIdx < seed.antes.length - 1 ? 'pointer' : 'default',
          boxShadow: `inset 2px 0 0 ${Csa.DARK_RED}, 0 4px 0 rgba(0,0,0,.5)`,
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: Csa.WHITE, fontSize: 22, fontFamily: 'm6x11plus, monospace',
          textShadow: '1px 1px 0 rgba(0,0,0,.8)',
          zIndex: 10,
        }}
      >›</div>

      {/* Page track */}
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{
          height: '100%', display: 'flex',
          width: `${seed.antes.length * 100}%`,
          transform: `translateX(calc(${-anteIdx * 100 / seed.antes.length}% + ${dx}px))`,
          transition: drag.current.active ? 'none' : 'transform 320ms cubic-bezier(.32,1.06,.34,1)',
          touchAction: 'pan-y',
          padding: '0 24px',
        }}
      >
        {seed.antes.map((a, i) => (
          <div key={i} style={{ width: `${100 / seed.antes.length}%`, height: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>
            <window.JamlMap ante={a} />
          </div>
        ))}
      </div>

      {/* Ante dot indicator */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 5, zIndex: 11,
        background: `${Csa.DARKEST}cc`, padding: '4px 8px', borderRadius: 10,
      }}>
        {seed.antes.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: i === anteIdx ? Csa.GOLD : Csa.DARK_GREY,
            boxShadow: i === anteIdx ? `0 0 6px ${Csa.GOLD}` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

// ── SeedPagerHeader — three columns: [‹ stride] [identity panel] [stride ›]
//     Strides are slim and CLEAN — nothing floats over them. The identity
//     panel sits in the middle on its own dark ground.
function SeedPagerHeader({ idx, count, seed, onPrev, onNext, onClose }) {
  const [copied, setCopied] = saUS(false);
  const onCopy = (e) => {
    e.stopPropagation();
    const url = `https://www.seedfinder.app/seed/${seed.seed}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const STRIDE_W = 30; // outer red stride bar width

  // Stride styling — flat red columns with a hairline edge, full panel height
  const strideBase = {
    width: STRIDE_W, alignSelf: 'stretch',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: Csa.RED,
    color: Csa.WHITE,
    fontFamily: 'm6x11plus, monospace',
    fontSize: 24, lineHeight: 1,
    textShadow: '1px 1px 0 rgba(0,0,0,.55)',
    cursor: 'pointer', userSelect: 'none',
    boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,.45), inset 0 -2px 0 rgba(0,0,0,.35)',
    flexShrink: 0,
  };

  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'stretch',
      height: 76, padding: '6px 0 0', gap: 6,
    }}>
      {/* LEFT stride — full height */}
      <div style={strideBase} onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="previous seed">‹</div>

      {/* MIDDLE identity panel — own dark ground; strides bookend it */}
      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4,
        background: 'rgba(15, 24, 26, 0.78)',
        border: `2px solid ${Csa.PANEL_EDGE}`,
        borderRadius: 6,
        boxShadow: `0 3px 0 rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.04)`,
        padding: '4px 8px',
        position: 'relative',
      }}>
        {/* Counter pip — top-right corner of identity panel */}
        <div style={{
          position: 'absolute', top: 2, right: 6,
          fontSize: 9, color: Csa.GREY, letterSpacing: 1.5,
          fontFamily: 'm6x11plus, monospace',
        }}>{idx + 1} / {count}</div>

        {/* Seed code + copy chip */}
        <div
          onClick={onCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '2px 6px 2px 10px',
            background: copied ? Csa.GREEN : 'transparent',
            border: copied ? `1.5px solid ${Csa.DARK_GREEN}` : '1.5px solid transparent',
            borderRadius: 4, cursor: 'pointer', userSelect: 'none',
            transition: 'background 120ms, border-color 120ms',
          }}
        >
          <div style={{
            fontFamily: 'm6x11plus, monospace', fontSize: 17, color: Csa.WHITE,
            letterSpacing: 4, textShadow: '1px 1px 0 rgba(0,0,0,.8)',
            whiteSpace: 'nowrap', lineHeight: 1,
          }}>{copied ? 'copied!' : seed.seed}</div>
          {!copied && (
            <svg width="14" height="14" viewBox="0 0 18 18" style={{ flexShrink: 0, opacity: 0.7 }} aria-hidden="true">
              <rect x="5" y="3" width="9" height="11" rx="1.5" fill="none" stroke={Csa.GREY} strokeWidth="1.7" />
              <rect x="3" y="5" width="9" height="11" rx="1.5" fill={Csa.DARK_GREY} stroke={Csa.WHITE} strokeWidth="1.7" />
            </svg>
          )}
        </div>

        {/* Deck card + stake chip — own row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <window.DeckSprite name={seed.deck} size={22} />
          <window.StakeSprite name="Gold" size={18} />
        </div>
      </div>

      {/* RIGHT stride — full height */}
      <div style={strideBase} onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="next seed">›</div>
    </div>
  );
}

// ── SeedAnalyzer — outer shell ──────
function SeedAnalyzer({ seeds, filter, onClose, initialIdx = 0, chrome = 'swirl' }) {
  const [seedIdx, setSeedIdx] = saUS(initialIdx);
  const [toast, setToast] = saUS(null);

  const seed = seeds[seedIdx];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: chrome === 'black' ? '#000' : (chrome === 'none' ? 'transparent' : Csa.DARKEST),
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'm6x11plus, monospace', color: Csa.WHITE,
    }}>
      {/* Real Balatro swirl behind everything (background.fs port) */}
      {chrome === 'swirl' && <window.BalatroSwirl palette="menu" spinAmount={0.5} contrast={3.5} />}

      {/* Content layer — sits on top of swirl */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* TOP: seed pager (strides bookend the identity panel) */}
      <SeedPagerHeader
        idx={seedIdx} count={seeds.length} seed={seed}
        onPrev={() => seedIdx > 0 && setSeedIdx(seedIdx - 1)}
        onNext={() => seedIdx < seeds.length - 1 && setSeedIdx(seedIdx + 1)}
        onClose={onClose}
      />

      {/* MAIN: jamlyzer — one analyzer view that magnetically snaps to ante
          boundaries. ante 0 prepends if ante 1 has a Hieroglyph voucher
          (Hieroglyph rule: -1 ante, +1 hand → there IS an ante 0 shop). */}
      {(() => {
        const hieroglyphAt1 = seed.antes[0]?.voucher === 'Hieroglyph';
        // synthesize an ante-0 placeholder by reusing ante 1's structure shape.
        // when real data comes in, the search will populate ante 0 itself.
        const antesToShow = hieroglyphAt1
          ? [{ ...seed.antes[0], ante: 0, _ante0Synthetic: true }, ...seed.antes]
          : seed.antes;
        return (
          <div style={{
            flex: 1, minHeight: 0,
            overflowY: 'auto', scrollbarWidth: 'none',
            scrollSnapType: 'y mandatory',
            overscrollBehavior: 'contain',
          }}>
            {antesToShow.map((a, i) => (
              <div key={i} style={{ scrollSnapAlign: 'start', minHeight: '100%' }}>
                <window.JamlMap ante={a} />
              </div>
            ))}
          </div>
        );
      })()}
      </div>

      {/* BOTTOM-MOST: full-width back — thumb-slap target. UX rule: bottom = back. */}
      <div style={{
        position: 'relative', zIndex: 2, padding: '6px 8px 8px',
        background: 'rgba(0,0,0,0.55)',
      }}>
        <window.BalButton tone="orange" size="md" fullWidth onClick={onClose}>back</window.BalButton>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 80, transform: 'translateX(-50%)',
          background: Csa.GOLD, color: Csa.BLACK,
          padding: '6px 14px', borderRadius: 6, fontSize: 11, letterSpacing: 1,
          boxShadow: '0 4px 0 rgba(0,0,0,.6)', border: `2px solid ${Csa.GOLD_TEXT}`,
          fontFamily: 'm6x11plus, monospace', zIndex: 100,
          textShadow: '1px 1px 0 rgba(255,255,255,.3)',
        }}>✓ {toast}</div>
      )}
    </div>
  );
}

(function injectKf(){
  if (document.getElementById('sa-kf')) return;
  const s = document.createElement('style');
  s.id = 'sa-kf';
  s.textContent = `@keyframes sa-bob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-3px);} }`;
  document.head.appendChild(s);
})();

window.SeedAnalyzer = SeedAnalyzer;
