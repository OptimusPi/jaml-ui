// SeedDetail — the full phone-sized screen.
//   ┌──────────────────────────┐
//   │  TOP BAR                 │   fixed
//   │  seed · deck · score row │
//   │  score column per clause │
//   ├──────────────────────────┤
//   │  ⟨ horizontal pager ⟩    │
//   │  ┃  vertical ante snap   │   swipes L/R between seeds,
//   │  ┃  ┃ page 0 (pre)       │   swipes up/down between antes
//   │  ┃  ┃ page 1..N          │
//   │  ┃                       │
//   └──────────────────────────┘

const { useState: sdUS, useRef: sdUR, useEffect: sdUE } = React;

// ── Score column: one per should-clause + must-clause.
function ScoreCol({ clause, hits, kind }) {
  const hit = hits > 0;
  const must = kind === 'must';
  return (
    <div
      style={{
        flex: 1,
        background: hit ? '#1e2e2e' : '#161c1e',
        border: `2px solid ${hit ? clause.color || '#3e4a4d' : '#0b1416'}`,
        borderRadius: 4,
        padding: '4px 6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 22 }}>
        {clause.kind === 'Joker' && <Sprite sheet="jokers" name={clause.target} width={18} height={24} />}
        {clause.kind === 'Voucher' && <Sprite sheet="vouchers" name={clause.target} width={18} height={24} />}
        {clause.kind === 'Tag' && <Sprite sheet="tags" name={clause.target} width={20} height={20} />}
      </div>
      <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: hit ? '#fff' : '#556265', letterSpacing: 0.5, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {clause.target}
      </div>
      <div
        style={{
          fontFamily: 'm6x11plus, monospace',
          fontSize: 16,
          color: must ? '#e4b643' : hit ? '#35bd86' : '#3e4a4d',
          lineHeight: 1,
        }}
      >
        ×{hits}
      </div>
    </div>
  );
}

function TopBar({ seed, filter }) {
  return (
    <div style={{ background: '#0f1719', borderBottom: '2px solid #000', padding: '10px 12px 10px', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button style={chromeBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 18, color: '#fff', letterSpacing: 2 }}>{seed.seed}</div>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: '#7e8e91', letterSpacing: 1 }}>{seed.deck} · {seed.stake}</div>
        </div>
        <button style={chromeBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="12" cy="7" r="1.2"/></svg>
        </button>
      </div>
      <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: '#556265', letterSpacing: 1, marginBottom: 4 }}>
        FILTER · {filter.name.toUpperCase()}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {filter.shouldClauses.map((c) => (
          <ScoreCol key={c.id} clause={c} hits={seed.score.perClause[c.id] || 0} kind="should" />
        ))}
        {filter.mustClauses.map((c) => (
          <ScoreCol key={c.id} clause={{ ...c, color: '#e4b643' }} hits={seed.score.perClause[c.id] || 0} kind="must" />
        ))}
      </div>
    </div>
  );
}

const chromeBtn = {
  width: 30, height: 30, border: '2px solid #0b1416', borderRadius: 4, background: '#2a3336',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1), 0 2px 0 #0b1416',
};

// ── Vertical snap scroller of AntePage; shows ante index indicator
function SeedPager({ seed, filter }) {
  const scrollRef = sdUR(null);
  const [anteIdx, setAnteIdx] = sdUS(1);
  const onScroll = (e) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== anteIdx) setAnteIdx(i);
  };

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {seed.antes.map((ante, i) => (
          <div key={i} style={{ minHeight: '100%', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
            <AntePage ante={ante} />
          </div>
        ))}
      </div>

      {/* Right-edge ante rail */}
      <div style={{ position: 'absolute', right: 4, top: 8, bottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, pointerEvents: 'none' }}>
        {seed.antes.map((a, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: i === anteIdx ? 18 : 8,
              borderRadius: 2,
              background: i === anteIdx ? '#e4b643' : '#3e4a4d',
              transition: 'all 200ms',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Root: horizontal seed swiper wrapping the vertical pager
function SeedDetail({ seeds, filter }) {
  const [idx, setIdx] = sdUS(0);
  const [drag, setDrag] = sdUS({ dx: 0, active: false });
  const touch = sdUR({ x0: 0, y0: 0, locked: null });

  const onDown = (e) => {
    const t = e.touches ? e.touches[0] : e;
    // only start tracking from top bar region (safe)
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
    if (touch.current.locked === 'x') {
      e.preventDefault?.();
      setDrag({ dx, active: true });
    }
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
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0b1416',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'm6x11plus, monospace',
        color: '#fff',
      }}
    >
      {/* Seed-swipe layer: only the top bar is draggable for horizontal
          swipes (keeps vertical scroll natural inside the ante pager). */}
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ touchAction: 'pan-y' }}>
        <TopBar seed={seed} filter={filter} />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          transform: drag.active ? `translateX(${drag.dx * 0.3}px) rotate(${drag.dx * 0.02}deg)` : 'none',
          transition: drag.active ? 'none' : 'transform 260ms cubic-bezier(.33,1,.4,1)',
        }}
      >
        <SeedPager key={seed.seed} seed={seed} filter={filter} />
      </div>

      {/* Seed dots */}
      <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
        {seeds.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === idx ? '#e4b643' : '#3e4a4d' }} />
        ))}
      </div>
    </div>
  );
}

window.SeedDetail = SeedDetail;
