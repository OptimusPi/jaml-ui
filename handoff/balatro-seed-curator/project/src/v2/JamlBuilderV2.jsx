// JamlBuilderV2 — mobile JAML filter builder.
//
//   ┌──────────────────────┐
//   │  ◂ BACK   (full-width orange)
//   ├──────────────────────┤
//   │ Filter name · author │  editable top matter
//   │                      │
//   │ MUST ━━━━━━━━━━━━━━━━│  blue zone rail
//   │  [card] [card] [ ?  ]│  clause cards + mystery-slot ADD tile
//   │                      │
//   │ SHOULD ━━━━━━━━━━━━━━│  red zone rail
//   │  [card] [card] [ ?  ]│
//   │                      │
//   │ MUST NOT ━━━━━━━━━━━━│  orange zone rail
//   │  [ ?  ]              │
//   │                      │
//   ├──────────────────────┤
//   │ SEARCH (full-width green)
//   └──────────────────────┘
//
// Bottom sheet cascade picker:
//   Level 1 (category): Joker / Voucher / Tag / Boss / Tarot / Pack
//   Level 2 (item):     grid of sprites from that sheet — tap to commit
//   Level 3 (settings): antes toggles 1-8, score (should-only), commit
//
// Snapshot: this is the mockup — no state persisted upward, but structure is real.

const { useState: bUS, useRef: bUR, useEffect: bUE, useMemo: bUM } = React;
const Col = window.JimboColor;

// ── ZONE META ──
const ZONES = {
  must:    { label: 'MUST',     hint: 'Seed must contain all of these.',        color: Col.BLUE,   accent: '#4db5ff' },
  should:  { label: 'SHOULD',   hint: 'Bonus points per match.',                color: Col.RED,    accent: '#ff8076' },
  mustnot: { label: 'MUST NOT', hint: 'Seed is rejected if any appear.',        color: Col.ORANGE, accent: '#ffb84d' },
};

// ── CATEGORY META (for the picker) ──
const CATEGORIES = [
  { id: 'joker',         label: 'JOKER',    sheet: 'jokers',   render: (n,s) => <JokerMini   name={n} size={s} />, detect: 'jokers' },
  { id: 'souljoker',     label: 'SOUL',     sheet: 'jokers',   render: (n,s) => <JokerMini   name={n} size={s} />, filter: ['perkeo','triboulet','yorick','chicot','canio'] },
  { id: 'voucher',       label: 'VOUCHER',  sheet: 'vouchers', render: (n,s) => <VoucherMini name={n} size={s} /> },
  { id: 'smallblindtag', label: 'SMALL TAG',sheet: 'tags',     render: (n,s) => <TagChip     name={n} size={s} /> },
  { id: 'bigblindtag',   label: 'BIG TAG',  sheet: 'tags',     render: (n,s) => <TagChip     name={n} size={s} /> },
  { id: 'boss',          label: 'BOSS',     sheet: 'blinds',   render: (n,s) => <BossChip    name={n} size={s} /> },
  { id: 'tarot',         label: 'TAROT',    sheet: 'tarots',   render: (n,s) => <TarotMini   name={n} size={s} /> },
];

// ── Chunky 3D Button (DEPRECATED — use window.BalButton; kept only for zone commit color overrides) ──
function ChunkyButton({ color = Col.ORANGE, shadow = Col.DARK_ORANGE, children, onClick, style, fullWidth, small }) {
  const [pressed, setPressed] = bUS(false);
  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{
        display: 'inline-block',
        width: fullWidth ? '100%' : 'auto',
        cursor: 'pointer', userSelect: 'none',
        paddingBottom: pressed ? 0 : 4,
        transition: 'padding-bottom 60ms ease-out',
        ...style,
      }}
    >
      <div style={{
        position: 'relative',
        background: shadow,
        borderRadius: 6,
        paddingBottom: pressed ? 0 : 4,
        boxShadow: `inset 0 -4px 0 ${shadow}`,
      }}>
        <div style={{
          background: color,
          borderRadius: 6,
          padding: small ? '6px 12px' : '12px 16px',
          transform: pressed ? 'translateY(4px)' : 'translateY(0)',
          transition: 'transform 60ms ease-out',
          fontFamily: 'm6x11plus, monospace',
          color: Col.WHITE,
          letterSpacing: 2,
          fontSize: small ? 12 : 16,
          textAlign: 'center',
          textShadow: `0 1px 0 ${shadow}`,
          boxShadow: `inset 0 2px 0 rgba(255,255,255,.18), inset 0 -2px 0 rgba(0,0,0,.22)`,
        }}>{children}</div>
      </div>
    </div>
  );
}

// ── Ante chip pill (1..8) ──
function AnteChip({ n, active, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? Col.GOLD : Col.DARKEST,
        border: `2px solid ${active ? Col.GOLD_TEXT : Col.PANEL_EDGE}`,
        borderRadius: 14,
        fontFamily: 'm6x11plus, monospace', fontSize: 13,
        color: active ? Col.BLACK : Col.GREY,
        cursor: 'pointer', userSelect: 'none',
        boxShadow: active ? `0 0 6px ${Col.GOLD}aa` : 'none',
      }}
    >{n}</div>
  );
}

// ── Preview renderer for a clause item ──
function clauseSprite(c, size = 40) {
  const cat = CATEGORIES.find(x => x.id === c.type);
  if (!cat) return null;
  return cat.render(c.value, size);
}

// ── ClauseCard — horizontal compact card ──
function ClauseCard({ clause, zoneKey, onRemove, onEdit }) {
  const z = ZONES[zoneKey];
  return (
    <div
      onClick={onEdit}
      style={{
        position: 'relative',
        background: Col.DARK_GREY,
        border: `2px solid ${z.color}`,
        borderRadius: 6,
        padding: '8px 8px 8px 6px',
        display: 'flex', alignItems: 'center', gap: 8,
        minWidth: 0, cursor: 'pointer',
        boxShadow: `0 2px 0 ${Col.BLACK}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 50, flexShrink: 0 }}>
        {clauseSprite(clause, 40)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 13, color: Col.WHITE, letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {clause.label || clause.value}
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: Col.GREY, letterSpacing: 1 }}>A</div>
          {clause.antes.map(a => (
            <div key={a} style={{
              fontFamily: 'm6x11plus, monospace', fontSize: 9,
              padding: '1px 4px', background: Col.DARKEST, color: z.accent,
              borderRadius: 3, letterSpacing: 0.5, lineHeight: 1,
            }}>{a}</div>
          ))}
          {zoneKey === 'should' && clause.score != null && (
            <div style={{
              marginLeft: 4,
              fontFamily: 'm6x11plus, monospace', fontSize: 9,
              padding: '1px 5px', background: Col.RED, color: Col.WHITE,
              borderRadius: 3, letterSpacing: 0.5, lineHeight: 1,
            }}>+{clause.score}</div>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          width: 22, height: 22, flexShrink: 0,
          border: `2px solid ${Col.BLACK}`, borderRadius: 4,
          background: Col.RED, color: Col.WHITE,
          fontFamily: 'm6x11plus, monospace', fontSize: 12, lineHeight: 1,
          cursor: 'pointer', padding: 0,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.2), 0 2px 0 ${Col.BLACK}`,
        }}
      >×</button>
    </div>
  );
}

// ── MysteryAddTile — the "?" placeholder ──
function MysteryAddTile({ zoneKey, onTap }) {
  const z = ZONES[zoneKey];
  return (
    <div
      onClick={onTap}
      style={{
        cursor: 'pointer',
        border: `2px dashed ${z.color}`,
        borderRadius: 6,
        padding: '12px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: `${z.color}0d`,
        minHeight: 60,
      }}
    >
      <div style={{
        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: Col.DARKEST, border: `2px solid ${z.color}`, borderRadius: 6,
        fontFamily: 'm6x11plus, monospace', fontSize: 24, color: z.color,
      }}>?</div>
      <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 12, color: z.accent, letterSpacing: 2 }}>
        ADD TO {z.label}
      </div>
    </div>
  );
}

// ── ZoneRail ──
function ZoneRail({ zoneKey, clauses, onAdd, onRemove, onEdit }) {
  const z = ZONES[zoneKey];
  return (
    <div>
      {/* Zone header: colored pill + hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          fontFamily: 'm6x11plus, monospace', fontSize: 11,
          padding: '2px 8px',
          background: z.color, color: Col.WHITE,
          borderRadius: 3, letterSpacing: 2,
          boxShadow: `0 2px 0 ${Col.BLACK}`,
        }}>{z.label}</div>
        <div style={{ flex: 1, height: 2, background: `${z.color}55`, borderRadius: 1 }} />
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: Col.GREY }}>
          {clauses.length}
        </div>
      </div>
      <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: Col.GREY, letterSpacing: 0.5, marginBottom: 8 }}>
        {z.hint}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {clauses.map(c => (
          <ClauseCard
            key={c.id}
            clause={c}
            zoneKey={zoneKey}
            onRemove={() => onRemove(c.id)}
            onEdit={() => onEdit(c)}
          />
        ))}
        <MysteryAddTile zoneKey={zoneKey} onTap={onAdd} />
      </div>
    </div>
  );
}

// ── PICKER: cascade bottom sheet ──
function PickerSheet({ open, zoneKey, editing, onClose, onCommit }) {
  // Steps: 'cat' (category) → 'item' (sprite grid) → 'settings' (antes/score/commit)
  const [step, setStep] = bUS('cat');
  const [cat, setCat] = bUS(null);     // selected CATEGORIES entry
  const [item, setItem] = bUS(null);   // selected item name
  const [antes, setAntes] = bUS([1]);
  const [score, setScore] = bUS(1);

  bUE(() => {
    if (open) {
      if (editing) {
        setCat(CATEGORIES.find(c => c.id === editing.type));
        setItem(editing.value);
        setAntes(editing.antes || [1]);
        setScore(editing.score ?? 1);
        setStep('settings');
      } else {
        setStep('cat');
        setCat(null);
        setItem(null);
        setAntes([1]);
        setScore(1);
      }
    }
  }, [open, editing]);

  if (!open) return null;

  const z = ZONES[zoneKey];
  const toggleAnte = (a) => setAntes(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a].sort((x,y)=>x-y));

  const commit = () => {
    onCommit({
      id: editing?.id || `c${Math.random().toString(36).slice(2,7)}`,
      type: cat.id,
      value: item,
      antes: antes.length ? antes : [1],
      score: zoneKey === 'should' ? score : undefined,
      label: item,
    });
  };

  // Build item list for the current category
  const items = bUM(() => {
    if (!cat) return [];
    if (cat.filter) return cat.filter;
    const map = window.SPRITE_MAPS?.[cat.sheet];
    if (map) return Object.keys(map);
    return [];
  }, [cat]);

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 80,
          animation: 'fadeIn 180ms ease-out',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 81,
        background: Col.DARKEST,
        borderTop: `3px solid ${z.color}`,
        borderRadius: '14px 14px 0 0',
        boxShadow: `0 -8px 24px rgba(0,0,0,.5)`,
        animation: 'slideUp 220ms cubic-bezier(.2,.8,.2,1)',
        maxHeight: '80%', display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
          <div style={{ width: 36, height: 4, background: Col.GREY, borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 8px', borderBottom: `2px solid ${Col.BLACK}` }}>
          {step !== 'cat' && (
            <button onClick={() => setStep(step === 'settings' ? 'item' : 'cat')} style={{
              background: Col.DARK_GREY, border: `2px solid ${Col.BLACK}`, borderRadius: 4,
              width: 26, height: 26, color: Col.WHITE, cursor: 'pointer', padding: 0,
              fontFamily: 'm6x11plus, monospace', fontSize: 14,
            }}>◂</button>
          )}
          <div style={{
            fontFamily: 'm6x11plus, monospace', fontSize: 11,
            padding: '2px 8px', background: z.color, color: Col.WHITE,
            borderRadius: 3, letterSpacing: 2,
          }}>{z.label}</div>
          <div style={{ flex: 1, fontFamily: 'm6x11plus, monospace', fontSize: 13, color: Col.WHITE, letterSpacing: 1 }}>
            {step === 'cat' && 'Pick type'}
            {step === 'item' && cat?.label}
            {step === 'settings' && (item || '—')}
          </div>
          <button onClick={onClose} style={{
            background: Col.DARK_GREY, border: `2px solid ${Col.BLACK}`, borderRadius: 4,
            width: 26, height: 26, color: Col.WHITE, cursor: 'pointer', padding: 0,
            fontFamily: 'm6x11plus, monospace', fontSize: 12,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {step === 'cat' && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
            }}>
              {CATEGORIES.map(c => (
                <div
                  key={c.id}
                  onClick={() => { setCat(c); setStep('item'); }}
                  style={{
                    padding: 12, background: Col.DARK_GREY, borderRadius: 6,
                    border: `2px solid ${Col.PANEL_EDGE}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer',
                    boxShadow: `0 2px 0 ${Col.BLACK}`,
                  }}
                >
                  <div style={{ width: 32, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.render(
                      c.id === 'joker' ? 'joker' :
                      c.id === 'souljoker' ? 'perkeo' :
                      c.id === 'voucher' ? 'overstock' :
                      c.id === 'smallblindtag' || c.id === 'bigblindtag' ? 'uncommontag' :
                      c.id === 'boss' ? 'thehook' :
                      c.id === 'tarot' ? 'thefool' : '',
                      28,
                    )}
                  </div>
                  <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 12, color: Col.WHITE, letterSpacing: 1.5 }}>
                    {c.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'item' && cat && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
            }}>
              {items.map(name => (
                <div
                  key={name}
                  onClick={() => { setItem(name); setStep('settings'); }}
                  style={{
                    padding: 4,
                    background: item === name ? `${z.color}33` : Col.DARK_GREY,
                    border: `2px solid ${item === name ? z.color : Col.PANEL_EDGE}`,
                    borderRadius: 5,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    cursor: 'pointer', minHeight: 60,
                    boxShadow: `0 2px 0 ${Col.BLACK}`,
                  }}
                >
                  {cat.render(name, 36)}
                </div>
              ))}
              {!items.length && (
                <div style={{ gridColumn: '1/-1', color: Col.GREY, fontSize: 11, fontFamily: 'm6x11plus, monospace', textAlign: 'center', padding: 20 }}>
                  Loading sprites…
                </div>
              )}
            </div>
          )}

          {step === 'settings' && cat && item && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Preview */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, background: Col.DARK_GREY, borderRadius: 6,
                border: `2px solid ${z.color}`,
              }}>
                {cat.render(item, 52)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 15, color: Col.WHITE, letterSpacing: 0.5 }}>{item}</div>
                  <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Col.GREY, letterSpacing: 1 }}>{cat.label}</div>
                </div>
              </div>

              {/* Antes */}
              <div>
                <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 11, color: Col.GREY, letterSpacing: 2, marginBottom: 6 }}>
                  SEARCH ANTES
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <AnteChip key={n} n={n} active={antes.includes(n)} onToggle={() => toggleAnte(n)} />
                  ))}
                </div>
              </div>

              {/* Score (should only) */}
              {zoneKey === 'should' && (
                <div>
                  <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 11, color: Col.GREY, letterSpacing: 2, marginBottom: 6 }}>
                    SCORE ON MATCH
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setScore(Math.max(0, score - 1))} style={stepperBtn}>–</button>
                    <div style={{
                      fontFamily: 'm6x11plus, monospace', fontSize: 22, color: Col.RED,
                      minWidth: 52, textAlign: 'center',
                      border: `2px solid ${Col.RED}`, borderRadius: 6,
                      padding: '4px 10px', background: Col.DARKEST,
                    }}>+{score}</div>
                    <button onClick={() => setScore(score + 1)} style={stepperBtn}>+</button>
                  </div>
                </div>
              )}

              {/* Commit button — color matches zone */}
              <window.BalButton
                fullWidth
                color={z.color}
                shadow={zoneKey === 'must' ? Col.DARK_BLUE : zoneKey === 'should' ? Col.DARK_RED : Col.DARK_ORANGE}
                onClick={commit}
              >{editing ? 'Update' : 'Add'}</window.BalButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const stepperBtn = {
  width: 38, height: 38,
  background: Col.DARK_GREY, border: `2px solid ${Col.BLACK}`, borderRadius: 6,
  color: Col.WHITE, fontFamily: 'm6x11plus, monospace', fontSize: 20, cursor: 'pointer',
  boxShadow: `inset 0 1px 0 rgba(255,255,255,.15), 0 2px 0 ${Col.BLACK}`,
  padding: 0,
};

// ── Top matter: filter name / author / description ──
function TopMatter({ name, author, desc }) {
  return (
    <div style={{
      background: Col.DARK_GREY, borderRadius: 6, padding: 10,
      border: `2px solid ${Col.PANEL_EDGE}`,
      boxShadow: `0 2px 0 ${Col.BLACK}`,
    }}>
      <input
        defaultValue={name}
        style={{
          display: 'block', width: '100%', background: 'transparent', border: 'none', outline: 'none',
          fontFamily: 'm6x11plus, monospace', fontSize: 18, color: Col.WHITE, letterSpacing: 1,
          padding: 0, marginBottom: 4,
        }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 9, color: Col.GREY, letterSpacing: 2 }}>BY</div>
        <input
          defaultValue={author}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'm6x11plus, monospace', fontSize: 12, color: Col.GOLD_TEXT, letterSpacing: 1,
            padding: 0,
          }}
        />
      </div>
      <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 10, color: Col.GREY, marginTop: 6, lineHeight: 1.35 }}>
        {desc}
      </div>
    </div>
  );
}

// ── Main ──
function JamlBuilderV2({ initial }) {
  const base = initial || window.FILTER_V2;
  const [must, setMust]       = bUS(() => (base.must || []).map(c => ({ ...c })));
  const [should, setShould]   = bUS(() => (base.should || []).map(c => ({ ...c })));
  const [mustnot, setMustNot] = bUS([]);

  const [picker, setPicker] = bUS({ open: false, zone: null, editing: null });

  const openAdd  = (zone) => setPicker({ open: true, zone, editing: null });
  const openEdit = (zone, c) => setPicker({ open: true, zone, editing: c });
  const close    = () => setPicker({ open: false, zone: null, editing: null });

  const commit = (clause) => {
    const setters = { must: setMust, should: setShould, mustnot: setMustNot };
    const current = { must, should, mustnot }[picker.zone];
    const next = picker.editing
      ? current.map(c => c.id === clause.id ? clause : c)
      : [...current, clause];
    setters[picker.zone](next);
    close();
  };

  const remove = (zone, id) => {
    const setters = { must: setMust, should: setShould, mustnot: setMustNot };
    const current = { must, should, mustnot }[zone];
    setters[zone](current.filter(c => c.id !== id));
  };

  return (
    <div style={{
      width: '100%', height: '100%', background: Col.DARKEST,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'm6x11plus, monospace', color: Col.WHITE,
    }}>
      {/* Scroll body — NO top bar; Back docks to bottom */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TopMatter name={base.name} author={base.author} desc={base.description} />

        <ZoneRail zoneKey="must"    clauses={must}    onAdd={() => openAdd('must')}    onRemove={(id) => remove('must', id)}    onEdit={(c) => openEdit('must', c)} />
        <ZoneRail zoneKey="should"  clauses={should}  onAdd={() => openAdd('should')}  onRemove={(id) => remove('should', id)}  onEdit={(c) => openEdit('should', c)} />
        <ZoneRail zoneKey="mustnot" clauses={mustnot} onAdd={() => openAdd('mustnot')} onRemove={(id) => remove('mustnot', id)} onEdit={(c) => openEdit('mustnot', c)} />

        <div style={{ height: 20 }} />
      </div>

      {/* Bottom: SEARCH (green, full-width) then BACK (orange, full-width, BOTTOM-MOST, thumb zone) */}
      <div style={{ padding: '8px 10px 10px', borderTop: `2px solid ${Col.BLACK}`, background: Col.DARK_GREY, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <window.BalButton tone="green" fullWidth size="md">Search</window.BalButton>
        <window.BalButton tone="orange" fullWidth size="md">Back</window.BalButton>
      </div>

      <PickerSheet
        open={picker.open}
        zoneKey={picker.zone || 'must'}
        editing={picker.editing}
        onClose={close}
        onCommit={commit}
      />
    </div>
  );
}

// Keyframes
(function injectBuilderKf(){
  if (document.getElementById('v2-builder-kf')) return;
  const s = document.createElement('style');
  s.id = 'v2-builder-kf';
  s.textContent = `
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  `;
  document.head.appendChild(s);
})();

window.JamlBuilderV2 = JamlBuilderV2;
