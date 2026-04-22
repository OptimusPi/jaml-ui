// JamlIde — mobile visual editor for .jaml files.
//
// What the community needs: a side-by-side where the LEFT is a drag-droppable
// clause canvas (zones: must/should/mustnot) and the RIGHT shows the live .jaml
// text. Editing either side updates the other. Drag a clause between zones to
// change its kind. Long-press to reorder within a zone.
//
// Since this is a mobile artboard (390×844), side-by-side becomes TOP/BOTTOM
// tabs: [Visual] / [YAML] toggle at the very top. We show the Visual tab.
//
// Drag & drop: each clause card has a grip handle on the left; touchstart +
// touchmove translates the card; on touchend we hit-test zone rails and move
// the clause between them.

const { useState: idUS, useRef: idUR, useEffect: idUE } = React;
const Cid = window.JimboColor;

const ZONE_META = {
  must:    { label: 'MUST',     color: Cid.BLUE   },
  should:  { label: 'SHOULD',   color: Cid.RED    },
  mustnot: { label: 'MUST NOT', color: Cid.ORANGE },
};

// Render a clause sprite (reused mini from builder).
function ideSprite(c, s = 32) {
  if (c.type === 'joker' || c.type === 'souljoker') return <JokerMini name={c.value} size={s} />;
  if (c.type === 'voucher') return <VoucherMini name={c.value} size={s} />;
  if (c.type === 'smallblindtag' || c.type === 'bigblindtag') return <TagChip name={c.value} size={s} />;
  if (c.type === 'boss') return <BossChip name={c.value} size={s} />;
  if (c.type === 'tarot') return <TarotMini name={c.value} size={s} />;
  return null;
}

// serialize filter → YAML-ish text (no external lib; good enough for preview)
function toJamlText(f) {
  const lines = [];
  lines.push(`name: ${f.name || 'Untitled'}`);
  if (f.author)      lines.push(`author: ${f.author}`);
  if (f.description) lines.push(`description: ${f.description}`);
  if (f.deck)        lines.push(`deck: ${f.deck}`);
  if (f.stake)       lines.push(`stake: ${f.stake}`);
  const blocks = { must: f.must, should: f.should, mustnot: f.mustnot };
  for (const [k, arr] of Object.entries(blocks)) {
    if (!arr || !arr.length) continue;
    lines.push('');
    lines.push(`${k}:`);
    for (const c of arr) {
      const key = c.type === 'souljoker' ? 'soulJoker' :
                  c.type === 'smallblindtag' ? 'smallBlindTag' :
                  c.type === 'bigblindtag' ? 'bigBlindTag' :
                  c.type;
      lines.push(`  - ${key}: ${c.label || c.value}`);
      if (c.antes && c.antes.length) lines.push(`    antes: [${c.antes.join(',')}]`);
      if (c.score) lines.push(`    score: ${c.score}`);
      if (c.edition) lines.push(`    edition: ${c.edition}`);
      if (c.sources) {
        lines.push(`    sources:`);
        for (const [sk, sv] of Object.entries(c.sources)) {
          lines.push(`      ${sk}: [${Array.isArray(sv) ? sv.join(',') : sv}]`);
        }
      }
    }
  }
  return lines.join('\n');
}

// Syntax-ish-highlighted YAML block.
function YamlText({ text }) {
  const lines = text.split('\n');
  return (
    <pre style={{
      margin: 0, padding: 10, background: '#0f1719',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 11, lineHeight: 1.55, color: Cid.WHITE, whiteSpace: 'pre',
      overflow: 'auto', borderRadius: 4, border: `1px solid ${Cid.PANEL_EDGE}`,
    }}>
      {lines.map((ln, i) => {
        const m = ln.match(/^(\s*-?\s*)([a-zA-Z][a-zA-Z0-9_]*)(:)(.*)$/);
        if (m) {
          return (
            <div key={i}>
              <span style={{ color: Cid.GREY }}>{m[1]}</span>
              <span style={{ color: Cid.BLUE }}>{m[2]}</span>
              <span style={{ color: Cid.GREY }}>{m[3]}</span>
              <span style={{ color: /\[/.test(m[4]) ? Cid.GOLD_TEXT : Cid.GREEN_TEXT }}>{m[4]}</span>
            </div>
          );
        }
        if (ln.trim().startsWith('must') || ln.trim().startsWith('should') || ln.trim().startsWith('mustnot')) {
          return <div key={i} style={{ color: Cid.ORANGE_TEXT }}>{ln}</div>;
        }
        return <div key={i} style={{ color: Cid.GREY }}>{ln || '\u00A0'}</div>;
      })}
    </pre>
  );
}

// Draggable clause pill.
function DragClause({ clause, zone, onDragStart }) {
  const z = ZONE_META[zone];
  return (
    <div
      onMouseDown={(e) => onDragStart(e, clause, zone)}
      onTouchStart={(e) => onDragStart(e, clause, zone)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: Cid.DARK_GREY, border: `2px solid ${z.color}`,
        borderRadius: 6, padding: '5px 8px 5px 4px',
        boxShadow: `0 2px 0 ${Cid.BLACK}`,
        cursor: 'grab', userSelect: 'none', touchAction: 'none',
      }}
    >
      {/* grip */}
      <div style={{ color: Cid.GREY, fontSize: 12, lineHeight: 1, padding: '0 2px' }}>⋮⋮</div>
      {ideSprite(clause, 26)}
      <div style={{ fontSize: 10, color: Cid.WHITE, letterSpacing: 1, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>
        {clause.label || clause.value}
      </div>
      {clause.antes && (
        <div style={{ display: 'flex', gap: 2 }}>
          {clause.antes.slice(0,3).map(a => (
            <div key={a} style={{ fontSize: 8, padding: '0 3px', background: Cid.DARKEST, color: z.color, borderRadius: 2 }}>{a}</div>
          ))}
          {clause.antes.length > 3 && <div style={{ fontSize: 8, color: Cid.GREY }}>+{clause.antes.length-3}</div>}
        </div>
      )}
      {clause.score != null && (
        <div style={{ fontSize: 9, padding: '0 4px', background: Cid.RED, color: Cid.WHITE, borderRadius: 2 }}>+{clause.score}</div>
      )}
    </div>
  );
}

function ZoneDropRail({ zone, clauses, onDragStart, highlight }) {
  const z = ZONE_META[zone];
  return (
    <div data-zone={zone} style={{
      border: `2px dashed ${highlight ? z.color : `${z.color}55`}`,
      background: highlight ? `${z.color}22` : 'transparent',
      borderRadius: 6, padding: 8,
      transition: 'background 100ms, border-color 100ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, padding: '2px 8px',
          background: z.color, color: Cid.WHITE, borderRadius: 3,
          textShadow: '1px 1px 0 rgba(0,0,0,.8)',
        }}>{z.label}</div>
        <div style={{ flex: 1, height: 1, background: `${z.color}44` }} />
        <div style={{ fontSize: 8, color: Cid.GREY }}>{clauses.length}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {clauses.map(c => (
          <DragClause key={c.id} clause={c} zone={zone} onDragStart={onDragStart} />
        ))}
        {clauses.length === 0 && (
          <div style={{ fontSize: 10, color: Cid.GREY, padding: 10, fontStyle: 'italic' }}>drop clauses here</div>
        )}
      </div>
    </div>
  );
}

function JamlIde() {
  const base = window.FILTER_V2;
  const [tab, setTab] = idUS('visual'); // visual | yaml
  const [state, setState] = idUS(() => ({
    must:    (base.must || []).map(c => ({ ...c })),
    should:  (base.should || []).map(c => ({ ...c })),
    mustnot: [],
  }));

  // drag state
  const [drag, setDrag] = idUS(null); // {clause, fromZone, x, y, offX, offY}
  const [hoverZone, setHoverZone] = idUS(null);
  const rootRef = idUR(null);

  const onDragStart = (e, clause, fromZone) => {
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({ clause, fromZone, x: t.clientX, y: t.clientY, offX: t.clientX - rect.left, offY: t.clientY - rect.top, w: rect.width, h: rect.height });
  };

  idUE(() => {
    if (!drag) return;
    const move = (e) => {
      const t = e.touches ? e.touches[0] : e;
      setDrag(d => d && { ...d, x: t.clientX, y: t.clientY });
      // hit-test zones
      const rails = rootRef.current?.querySelectorAll('[data-zone]') || [];
      let found = null;
      for (const r of rails) {
        const rc = r.getBoundingClientRect();
        if (t.clientX >= rc.left && t.clientX <= rc.right && t.clientY >= rc.top && t.clientY <= rc.bottom) {
          found = r.getAttribute('data-zone'); break;
        }
      }
      setHoverZone(found);
    };
    const up = () => {
      if (hoverZone && hoverZone !== drag.fromZone) {
        setState(s => {
          const from = s[drag.fromZone].filter(c => c.id !== drag.clause.id);
          const to   = [...s[hoverZone], { ...drag.clause }];
          return { ...s, [drag.fromZone]: from, [hoverZone]: to };
        });
      }
      setDrag(null); setHoverZone(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [drag, hoverZone]);

  const yamlText = toJamlText({ ...base, ...state });

  return (
    <div ref={rootRef} style={{
      width: '100%', height: '100%', background: Cid.DARKEST,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'm6x11plus, monospace', color: Cid.WHITE, overflow: 'hidden',
    }}>
      {/* Tab strip */}
      <div style={{
        display: 'flex', padding: '10px 10px 6px', gap: 6,
        background: Cid.DARK_GREY, borderBottom: `2px solid ${Cid.BLACK}`,
      }}>
        {[['visual','Visual'], ['yaml','.jaml']].map(([k,l]) => (
          <div key={k}
            onClick={() => setTab(k)}
            style={{
              flex: 1, textAlign: 'center', padding: '7px 0',
              background: tab === k ? Cid.GOLD : Cid.DARKEST,
              color: tab === k ? Cid.BLACK : Cid.GREY,
              fontSize: 12, letterSpacing: 2, borderRadius: 4,
              border: `2px solid ${tab === k ? Cid.GOLD_TEXT : Cid.PANEL_EDGE}`,
              textShadow: tab === k ? 'none' : '1px 1px 0 rgba(0,0,0,.8)',
              cursor: 'pointer', userSelect: 'none',
            }}>{l}</div>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'visual' ? (
          <>
            {/* File metadata */}
            <div style={{
              background: Cid.DARK_GREY, border: `2px solid ${Cid.PANEL_EDGE}`, borderRadius: 6,
              padding: 8, boxShadow: `0 2px 0 ${Cid.BLACK}`,
            }}>
              <div style={{ fontSize: 9, color: Cid.GREY, letterSpacing: 2 }}>FILE</div>
              <div style={{ fontSize: 14, color: Cid.WHITE, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>{base.name}.jaml</div>
              <div style={{ fontSize: 9, color: Cid.GOLD_TEXT, marginTop: 2 }}>by {base.author}</div>
            </div>

            {/* Hint */}
            <div style={{ fontSize: 9, color: Cid.GREY, letterSpacing: 1, textAlign: 'center' }}>
              ⋮⋮ drag clauses between zones · tap to edit
            </div>

            <ZoneDropRail zone="must"    clauses={state.must}    onDragStart={onDragStart} highlight={hoverZone==='must'} />
            <ZoneDropRail zone="should"  clauses={state.should}  onDragStart={onDragStart} highlight={hoverZone==='should'} />
            <ZoneDropRail zone="mustnot" clauses={state.mustnot} onDragStart={onDragStart} highlight={hoverZone==='mustnot'} />
          </>
        ) : (
          <YamlText text={yamlText} />
        )}
      </div>

      {/* Bottom actions */}
      <div style={{
        padding: '8px 10px 10px', borderTop: `2px solid ${Cid.BLACK}`, background: Cid.DARK_GREY,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <window.BalButton tone="green" fullWidth size="md">Save</window.BalButton>
        <window.BalButton tone="orange" fullWidth size="md">Back</window.BalButton>
      </div>

      {/* Drag ghost */}
      {drag && (
        <div style={{
          position: 'fixed', left: drag.x - drag.offX, top: drag.y - drag.offY,
          pointerEvents: 'none', zIndex: 999, transform: 'rotate(-2deg) scale(1.05)',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.6))', opacity: 0.92,
        }}>
          <DragClause clause={drag.clause} zone={drag.fromZone} onDragStart={() => {}} />
        </div>
      )}
    </div>
  );
}

window.JamlIde = JamlIde;
