// JamlMap — full-bleed analyzer page for a single ante.
//
// DNA from spectralpack/mathisfun: pixel banner headers (==Ante 1==, ==Packs==),
// flat dark canvas, voucher/boss/tags as a left header strip, single horizontal
// joker tape, then packs grouped by type with names labelled below each card.
//
// JAML overlay: items the user's filter targets get a GOLD base-glow underneath.
//   - MUST hits   → gold base + blue keyline
//   - SHOULD hits → gold base + red keyline + ×N badge
//   - everything else → flat, no glow
//
// Mobile-first: header row collapses, joker tape is grab-scroll with red arrows.

const { useRef: jmUR, useState: jmUS, useEffect: jmUE } = React;
const Cm = window.JimboColor;

// ── PixelBanner — the ==ANTE 1== chevron header from spectralpack ────
function PixelBanner({ children, color = Cm.WHITE }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
      fontFamily: 'm6x11plus, monospace', fontSize: 14, color,
      letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)',
      textTransform: 'lowercase',
    }}>
      <span style={{ color }}>==</span>
      <span>{children}</span>
      <span style={{ color }}>==</span>
    </div>
  );
}

// ── GoldBase — the JAML highlight: a gold halo UNDERNEATH the sprite. ──
// kind: 'must' | 'should' | null. We always paint gold base; keyline color
// indicates which kind of clause was matched.
function GoldBase({ kind, children, badge = null }) {
  if (!kind) return <div style={{ display: 'inline-block' }}>{children}</div>;
  const keyline = kind === 'must' ? Cm.BLUE : Cm.RED;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* gold base glow */}
      <div style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        background: `radial-gradient(closest-side, ${Cm.GOLD}cc 0%, ${Cm.GOLD}66 45%, ${Cm.GOLD}00 80%)`,
        filter: 'blur(2px)',
        animation: 'jmGoldPulse 2.4s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* keyline */}
      <div style={{
        position: 'absolute', inset: -2, borderRadius: 4,
        boxShadow: `0 0 0 2px ${keyline}`,
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      {badge != null && (
        <div style={{
          position: 'absolute', top: -8, right: -8, zIndex: 3,
          minWidth: 18, height: 18, padding: '0 4px',
          background: keyline, color: Cm.WHITE,
          fontFamily: 'm6x11plus, monospace', fontSize: 10, lineHeight: '18px',
          letterSpacing: 1, textAlign: 'center',
          border: `2px solid ${Cm.DARKEST}`, borderRadius: 9,
          textShadow: '1px 1px 0 rgba(0,0,0,.8)',
        }}>{badge}</div>
      )}
    </div>
  );
}

(function injectKf(){
  if (document.getElementById('jaml-map-kf')) return;
  const s = document.createElement('style');
  s.id = 'jaml-map-kf';
  s.textContent = `
    @keyframes jmGoldPulse { 0%,100% { opacity:.65; transform: scale(1);} 50% { opacity:1; transform: scale(1.08);} }
    .jm-tape::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(s);
})();

// ── Sprite under name label, like spectralpack ──
function NamedSprite({ sprite, label, sublabel, kind, badge }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56, gap: 3 }}>
      <GoldBase kind={kind} badge={badge}>{sprite}</GoldBase>
      <div style={{
        fontFamily: 'm6x11plus, monospace', fontSize: 9, color: Cm.WHITE,
        textAlign: 'center', maxWidth: 70, whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: 0.5,
        textShadow: '1px 1px 0 rgba(0,0,0,.8)',
      }}>{label}</div>
      {sublabel && (
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: kind === 'must' ? Cm.BLUE : Cm.RED, letterSpacing: 1 }}>{sublabel}</div>
      )}
    </div>
  );
}

// ── Pretty-print joker / tag / voucher names ──
function pretty(name) {
  if (!name) return '—';
  // CamelCase → spaced; keep "The X" forms
  return String(name)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
window.jmPretty = pretty;

// ── Header row: Voucher | Boss | Tags ──
function HeaderRow({ ante }) {
  const voucherKind = window.bestHit(ante._voucherHits);
  const bossKind    = window.bestHit(ante._bossHits);
  const smallKind   = window.bestHit(ante._smallTagHits);
  const bigKind     = window.bestHit(ante._bigTagHits);

  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '4px 0 8px' }}>
      {/* Voucher block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Cm.GOLD_TEXT, letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>Voucher</div>
        {ante.voucher
          ? <NamedSprite
              sprite={<window.VoucherMini name={ante.voucher} size={42} />}
              label={pretty(ante.voucher)}
              kind={voucherKind}
            />
          : <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Cm.GREY }}>—</div>}
      </div>

      {/* Boss block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Cm.GOLD_TEXT, letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>Boss</div>
        <NamedSprite
          sprite={<window.BossChip name={ante.boss} size={42} />}
          label={pretty(ante.boss)}
          kind={bossKind}
        />
      </div>

      {/* Tags block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Cm.GOLD_TEXT, letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>Tags</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <NamedSprite
            sprite={<window.TagChip name={ante.smallBlindTag} size={36} />}
            label={pretty(ante.smallBlindTag).replace(/Tag$/, '')}
            kind={smallKind}
          />
          <NamedSprite
            sprite={<window.TagChip name={ante.bigBlindTag} size={36} />}
            label={pretty(ante.bigBlindTag).replace(/Tag$/, '')}
            kind={bigKind}
          />
        </div>
      </div>
    </div>
  );
}

// ── JokerTape: grab-scroll with tall red striding arrows ──
function JokerTape({ items }) {
  const ref = jmUR(null);
  const drag = jmUR({ down: false, x0: 0, sl0: 0 });
  const [overflow, setOverflow] = jmUS({ left: false, right: false });

  const checkOverflow = () => {
    const el = ref.current; if (!el) return;
    setOverflow({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  jmUE(() => { checkOverflow(); }, [items]);

  const onDown = (e) => {
    const el = ref.current; if (!el) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    drag.current = { down: true, x0: x, sl0: el.scrollLeft };
  };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const el = ref.current; if (!el) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    el.scrollLeft = drag.current.sl0 - (x - drag.current.x0);
    checkOverflow();
  };
  const onUp = () => { drag.current.down = false; };

  const stride = (dir) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: 'smooth' });
    setTimeout(checkOverflow, 350);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={ref}
        className="jm-tape"
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        onScroll={checkOverflow}
        style={{
          overflowX: 'auto', overflowY: 'visible',
          display: 'flex', gap: 8, padding: '12px 28px 18px',
          cursor: drag.current.down ? 'grabbing' : 'grab',
          scrollbarWidth: 'none', userSelect: 'none',
        }}
      >
        {items.map((item, i) => {
          const kind = window.bestHit(item.hits);
          const badge = item.hits?.length ? `${item.hits.length}` : null;
          return (
            <div key={i} style={{ flexShrink: 0 }}>
              <NamedSprite
                sprite={<window.JokerMini name={item.value} size={56} edition={item.edition} />}
                label={pretty(item.value)}
                kind={kind}
                badge={kind ? badge : null}
              />
            </div>
          );
        })}
      </div>
      {/* Tall striding red arrows — INTENTIONALLY taller than the content. JimboUI! */}
      <StrideArrow side="left"  show={overflow.left}  onClick={() => stride(-1)} />
      <StrideArrow side="right" show={overflow.right} onClick={() => stride(1)} />
    </div>
  );
}

// ── StrideArrow — tall red bookend that overflows the content. Intentional. ──
function StrideArrow({ side, show, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute', top: -6, bottom: -6, [side]: -4, width: 22,
        background: show ? Cm.RED : Cm.DARK_RED,
        opacity: show ? 1 : 0.25,
        cursor: show ? 'pointer' : 'default',
        boxShadow: `inset ${side === 'left' ? '-2px' : '2px'} 0 0 ${Cm.DARK_RED}, 0 3px 0 rgba(0,0,0,.5)`,
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: Cm.WHITE, fontSize: 18, fontFamily: 'm6x11plus, monospace',
        textShadow: '1px 1px 0 rgba(0,0,0,.8)',
        zIndex: 4,
      }}
    >{side === 'left' ? '‹' : '›'}</div>
  );
}

// ── Pack group — like spectralpack, packs labelled by type with cards below ──
function PackGroup({ pack, idx }) {
  const anyHit = pack.itemHits?.some(h => h.length) ? window.bestHit(pack.itemHits.flat()) : null;
  const labels = {
    arcanapack: 'Arcana Pack', buffoonpack: 'Buffoon Pack', spectralpack: 'Spectral Pack',
    celestialpack: 'Celestial Pack', standardpack: 'Standard Pack',
    megaarcanapack: 'Mega Arcana Pack', jumboarcanapack: 'Jumbo Arcana Pack',
    jumbobuffoonpack: 'Jumbo Buffoon Pack', megabuffoonpack: 'Mega Buffoon Pack',
  };
  const label = labels[pack.type] || pretty(pack.type.replace('pack', ' pack'));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 4px' }}>
      <div style={{
        minWidth: 84, paddingTop: 2,
        fontFamily: 'm6x11plus, monospace', fontSize: 10, color: anyHit ? (anyHit === 'must' ? Cm.BLUE : Cm.RED) : Cm.GREY,
        letterSpacing: 1, textShadow: '1px 1px 0 rgba(0,0,0,.8)',
      }}>{label}:</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {pack.items.map((item, i) => {
          const kind = window.bestHit(pack.itemHits?.[i]);
          const badge = pack.itemHits?.[i]?.length ? `${pack.itemHits[i].length}` : null;
          // Pick sprite by pack type — minimal heuristic
          const isTarot = pack.type.includes('arcana');
          const isCelestial = pack.type.includes('celestial');
          const isStandard = pack.type.includes('standard');
          const sprite = isTarot
            ? <window.TarotMini name={item} size={42} />
            : isCelestial
              ? <window.TarotMini name={item} size={42} />
              : isStandard
                ? <PlayingCardChip name={item} />
                : <window.JokerMini name={item} size={42} />;
          return (
            <NamedSprite key={i}
              sprite={sprite}
              label={pretty(item)}
              kind={kind}
              badge={kind ? badge : null}
            />
          );
        })}
      </div>
    </div>
  );
}

// Minimal playing-card chip placeholder — labels like "kh" / "10s" / "qd"
function PlayingCardChip({ name }) {
  const m = String(name).match(/^(10|[2-9jqka])([hdsc])$/i);
  const rank = m ? m[1].toUpperCase() : '?';
  const suit = m ? m[2].toLowerCase() : '';
  const suitChar = { h: '♥', d: '♦', s: '♠', c: '♣' }[suit] || '';
  const isRed = suit === 'h' || suit === 'd';
  return (
    <div style={{
      width: 32, height: 42, background: '#fff', borderRadius: 4,
      border: `2px solid ${Cm.PANEL_EDGE}`, boxShadow: '0 2px 0 rgba(0,0,0,.6)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '2px 4px',
      fontFamily: 'm6x11plus, monospace', fontSize: 12,
      color: isRed ? '#d33' : '#222',
    }}>
      <div style={{ lineHeight: 1 }}>{rank}</div>
      <div style={{ fontSize: 14, alignSelf: 'flex-end', lineHeight: 1 }}>{suitChar}</div>
    </div>
  );
}

// ── JamlMap — one ante page, full bleed ────
function JamlMap({ ante }) {
  const soulKind = window.bestHit(ante._soulHits);
  return (
    <div style={{
      width: '100%', minHeight: '100%', background: Cm.DARKEST,
      padding: '14px 12px 24px', display: 'flex', flexDirection: 'column', gap: 8,
      fontFamily: 'm6x11plus, monospace',
    }}>
      <PixelBanner color={Cm.WHITE}>Ante {ante.ante}</PixelBanner>
      <HeaderRow ante={ante} />

      {/* Joker shop tape with tall red striding arrows */}
      <div style={{ marginTop: 4 }}>
        <JokerTape items={ante.shopQueue} />
      </div>

      {/* Packs section banner */}
      <PixelBanner color={Cm.WHITE}>Packs</PixelBanner>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ante.boosterPacks?.length
          ? ante.boosterPacks.map((p, i) => <PackGroup key={i} pack={p} idx={i} />)
          : <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Cm.GREY, padding: '4px 8px' }}>no packs</div>}
      </div>

      {/* Soul joker callout */}
      {ante.soulJoker && (
        <>
          <PixelBanner color={Cm.GOLD}>Soul</PixelBanner>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px' }}>
            <NamedSprite
              sprite={<window.JokerMini name={ante.soulJoker.value} size={56} edition={ante.soulJoker.edition} />}
              label={pretty(ante.soulJoker.value)}
              sublabel={ante.soulJoker.edition}
              kind={soulKind}
            />
            <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Cm.GOLD_TEXT, letterSpacing: 1 }}>
              soul card spawns this joker
            </div>
          </div>
        </>
      )}
    </div>
  );
}

window.JamlMap = JamlMap;
window.NamedSprite = NamedSprite;
window.GoldBase = GoldBase;
window.PixelBanner = PixelBanner;
window.StrideArrow = StrideArrow;
