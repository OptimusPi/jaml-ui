// SeedDetailV2 — phone-size shell around AntePageV2 list.
//   ┌──────────────────────┐
//   │ TOP BAR              │  seed · deck/stake · per-clause score cols
//   ├──────────────────────┤
//   │ EDGE HIT PILLS       │  COD-style edge indicators for hits off-screen
//   │                      │
//   │  ante 1              │  scroll-snapped vertical list of AntePageV2
//   │  ante 2              │
//   │   …                  │
//   │  ante 8              │
//   └──────────────────────┘

const { useState: sUS, useRef: sUR, useEffect: sUE, useLayoutEffect: sULE, useMemo: sUM, useCallback: sUCB } = React;
const Cv = window.JimboColor;

// ── ScoreChip — shoulds: bare sprite + count badge (count IS the data)
//              · musts:   framed box with ✓/✗ (presence IS the data)
function ScoreCol({ clause, hits }) {
  const lit = hits > 0;
  const must = clause._kind === 'must';
  // Balatro metaphor: must = BLUE (chips, the base), should = RED (mult, the bonus)
  const color = must ? Cv.BLUE : lit ? Cv.RED : Cv.GREY;

  const spriteKind =
    clause.type === 'joker' || clause.type === 'souljoker' ? 'jokers' :
    clause.type === 'voucher' ? 'vouchers' :
    clause.type === 'smallblindtag' || clause.type === 'bigblindtag' ? 'tags' :
    clause.type === 'boss' ? 'blinds' : null;

  const w = 30, h = spriteKind === 'tags' || spriteKind === 'blinds' ? 30 : 40;
  const sprite = (
    spriteKind === 'jokers'   ? <Sprite sheet="jokers" name={clause.value} width={w} height={h} /> :
    spriteKind === 'vouchers' ? <Sprite sheet="vouchers" name={clause.value} width={w} height={h} /> :
    spriteKind === 'tags'     ? <Sprite sheet="tags" name={clause.value} width={h} height={h} /> :
    spriteKind === 'blinds'   ? <BossChip name={clause.value} size={h} /> : null
  );

  if (must) {
    // Framed: the box + ✓/✗ IS the signal
    return (
      <div style={{
        position: 'relative',
        padding: '4px 4px 2px',
        border: `2px solid ${lit ? color : Cv.DARK_GREY}`,
        borderRadius: 5,
        background: lit ? `${color}18` : Cv.DARKEST,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: lit ? 1 : 0.6,
      }}>
        {sprite}
        <div style={{
          position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
          width: 16, height: 16,
          background: Cv.DARKEST, border: `2px solid ${color}`, borderRadius: 8,
          fontFamily: 'm6x11plus, monospace', fontSize: 11, lineHeight: '12px',
          color, textAlign: 'center',
        }}>
          {lit ? '✓' : '✗'}
        </div>
      </div>
    );
  }
  // Should: bare sprite + corner count
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      opacity: lit ? 1 : 0.4, filter: lit ? 'none' : 'grayscale(0.6)',
    }}>
      {sprite}
      <div style={{
        position: 'absolute', bottom: -4, right: -4,
        minWidth: 16, height: 16, padding: '0 3px',
        background: Cv.DARKEST,
        fontFamily: 'm6x11plus, monospace', fontSize: 11, lineHeight: '16px',
        color, textAlign: 'center',
        borderRadius: 8,
      }}>
        ×{hits}
      </div>
    </div>
  );
}

function TopBar({ seed, filter }) {
  const allClauses = [...filter.must.map(c => ({ ...c, _kind: 'must' })), ...filter.should.map(c => ({ ...c, _kind: 'should' }))];
  return (
    <div style={{
      background: Cv.DARKEST,
      borderBottom: `2px solid ${Cv.BLACK}`,
      padding: '8px 10px 8px',
      position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 2px 0 #000',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button style={btn}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 18, color: Cv.WHITE, letterSpacing: 3, lineHeight: 1 }}>{seed.seed}</div>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: Cv.GREY, letterSpacing: 1.5, marginTop: 2 }}>{seed.deck} · {seed.stake} · score {seed.score.totalScore}</div>
        </div>
        <button style={btn}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><circle cx="3" cy="7" r="1.3"/><circle cx="7" cy="7" r="1.3"/><circle cx="11" cy="7" r="1.3"/></svg>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-end', padding: '0 4px' }}>
        {allClauses.map(c => (
          <ScoreCol key={c.id} clause={c} hits={seed.score.totals[c.id] || 0} />
        ))}
      </div>
    </div>
  );
}

const btn = {
  width: 26, height: 26, border: `2px solid ${Cv.BLACK}`, borderRadius: 4, background: Cv.DARK_GREY,
  color: Cv.WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  boxShadow: `inset 0 1px 0 rgba(255,255,255,.08), 0 2px 0 ${Cv.BLACK}`, padding: 0,
};

// ── EdgeHitIndicator — COD-style: when a hit is scrolled off the top/bottom,
//   render a pinned arrow at the edge with a small joker sprite.
function EdgeHitIndicator({ direction, item, onTap }) {
  const name = item.type === 'pack' ? 'arcana' : item.value;
  const sheet = item.type === 'pack' ? 'boosters' : 'jokers';
  const hit = item._bestHit;
  const color = hitColor(hit);
  const pointUp = direction === 'up';
  return (
    <div
      onClick={onTap}
      style={{
        pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '3px 8px 3px 4px',
        background: `${Cv.DARKEST}ee`,
        border: `2px solid ${color}`,
        borderRadius: pointUp ? '0 0 14px 14px' : '14px 14px 0 0',
        cursor: 'pointer',
        animation: 'edgeBob 1.4s ease-in-out infinite',
        boxShadow: `0 0 10px ${color}aa`,
      }}
      title={`${item.value} · Ante ${item.ante} · tap to scroll`}
    >
      <div style={{
        width: 20, height: 20, overflow: 'hidden', borderRadius: 3,
        border: `1px solid ${color}`,
      }}>
        <div style={{ transform: 'scale(1.6)', transformOrigin: '50% 30%' }}>
          <Sprite sheet={sheet} name={name} width={20} height={27} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: Cv.WHITE, letterSpacing: 0.5, whiteSpace: 'nowrap', maxWidth: 74, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.value}
        </div>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color, letterSpacing: 1 }}>
          A{item.ante}·{item.where}
        </div>
      </div>
      <svg width="10" height="10" viewBox="0 0 10 10" style={{ color }}>
        {pointUp
          ? <path d="M5 2 L9 7 L1 7 Z" fill="currentColor" />
          : <path d="M5 8 L1 3 L9 3 Z" fill="currentColor" />}
      </svg>
    </div>
  );
}

// ── SeedBody — scroll container + vertical ante list + edge indicators
function SeedBody({ seed, filter }) {
  const scrollRef = sUR(null);
  const [edgeHits, setEdgeHits] = sUS({ up: [], down: [] });

  // Collect all hits in this seed, with where-info for labels.
  const allHits = sUM(() => {
    const out = [];
    seed.antes.forEach(a => {
      a.shopQueue.forEach((it, i) => {
        if (it.hits?.length) out.push({ value: it.value, type: 'joker', ante: a.ante, where: `Shop#${i+1}`, _bestHit: bestHit(it.hits), _findEl: () => it._el });
      });
      a.boosterPacks.forEach((p, pi) => {
        p.itemHits?.forEach((hArr, ii) => {
          if (hArr.length) out.push({ value: p.items[ii], type: 'joker', ante: a.ante, where: `P${pi+1}·${ii+1}`, _bestHit: bestHit(hArr), _findEl: () => p._el });
        });
      });
      if (a._soulHits?.length) out.push({ value: a.soulJoker.value, type: 'joker', ante: a.ante, where: 'Soul', _bestHit: bestHit(a._soulHits), _findEl: () => a._soulEl });
    });
    return out;
  }, [seed]);

  sUE(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const top = el.scrollTop;
      const bottom = top + el.clientHeight;
      const up = [], down = [];
      for (const h of allHits) {
        const node = h._findEl?.();
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const parentRect = el.getBoundingClientRect();
        const yTop = rect.top - parentRect.top + el.scrollTop;
        const yBot = yTop + rect.height;
        if (yBot < top + 40) up.push(h);
        else if (yTop > bottom - 40) down.push(h);
      }
      setEdgeHits({ up: up.slice(-3).reverse(), down: down.slice(0, 3) });
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    const id = setInterval(onScroll, 400); // catch layout settling
    return () => { el.removeEventListener('scroll', onScroll); clearInterval(id); };
  }, [allHits]);

  const jumpTo = (hit) => {
    const el = scrollRef.current;
    const node = hit._findEl?.();
    if (!el || !node) return;
    const parentRect = el.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    const target = el.scrollTop + (rect.top - parentRect.top) - 120;
    el.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="v2-shop-scroll"
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollSnapType: 'y proximity',
          scrollbarWidth: 'none',
        }}
      >
        {seed.antes.map((a, i) => (
          <div key={i} style={{ scrollSnapAlign: 'start' }}>
            <AntePageV2 ante={a} />
            {i < seed.antes.length - 1 && (
              <div style={{
                height: 2, margin: '0 14px',
                background: `repeating-linear-gradient(90deg, ${Cv.PANEL_EDGE} 0 6px, transparent 6px 12px)`,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Edge indicators */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6, padding: '0 8px',
        pointerEvents: 'none', zIndex: 20,
        flexWrap: 'wrap',
      }}>
        {edgeHits.up.map((h, i) => <EdgeHitIndicator key={`u${i}`} direction="up" item={h} onTap={() => jumpTo(h)} />)}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6, padding: '0 8px',
        pointerEvents: 'none', zIndex: 20,
        flexWrap: 'wrap',
      }}>
        {edgeHits.down.map((h, i) => <EdgeHitIndicator key={`d${i}`} direction="down" item={h} onTap={() => jumpTo(h)} />)}
      </div>
    </div>
  );
}

// ── SeedDetailV2 — horizontal seed swiper + body
function SeedDetailV2({ seeds, filter }) {
  const [idx, setIdx] = sUS(0);
  const [drag, setDrag] = sUS({ dx: 0, active: false });
  const touch = sUR({ x0: 0, y0: 0, locked: null });

  const onDown = (e) => {
    const t = e.touches ? e.touches[0] : e;
    touch.current = { x0: t.clientX, y0: t.clientY, locked: null };
  };
  const onMove = (e) => {
    if (!touch.current.x0) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - touch.current.x0;
    const dy = t.clientY - touch.current.y0;
    if (touch.current.locked == null) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5) touch.current.locked = 'x';
      else if (Math.abs(dy) > 8) touch.current.locked = 'y';
    }
    if (touch.current.locked === 'x') setDrag({ dx, active: true });
  };
  const onUp = () => {
    if (touch.current.locked === 'x') {
      const dx = drag.dx;
      if (dx < -70 && idx < seeds.length - 1) setIdx(idx + 1);
      else if (dx > 70 && idx > 0) setIdx(idx - 1);
    }
    touch.current = { x0: 0, y0: 0, locked: null };
    setDrag({ dx: 0, active: false });
  };

  const seed = seeds[idx];

  return (
    <div style={{
      width: '100%', height: '100%', background: Cv.DARKEST,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'm6x11plus, monospace', color: Cv.WHITE,
    }}>
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
           style={{ touchAction: 'pan-y' }}>
        <TopBar seed={seed} filter={filter} />
      </div>
      <div style={{
        flex: 1, minHeight: 0, position: 'relative',
        transform: drag.active ? `translateX(${drag.dx * 0.25}px) rotate(${drag.dx * 0.015}deg)` : 'none',
        transition: drag.active ? 'none' : 'transform 260ms cubic-bezier(.33,1,.4,1)',
      }}>
        <SeedBody key={seed.seed} seed={seed} filter={filter} />
      </div>
      {/* Seed dots */}
      <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 40 }}>
        {seeds.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === idx ? Cv.GOLD : Cv.DARK_GREY }} />
        ))}
      </div>
    </div>
  );
}

window.SeedDetailV2 = SeedDetailV2;
