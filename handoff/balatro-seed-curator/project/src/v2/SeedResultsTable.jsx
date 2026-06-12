// SeedResultsTable — the user was right. The number-line "score 6" was meaningless.
// Real comparison needs a sortable table: one row per seed, one column per clause.
// Color-coded cells: dark-grey 0, dim red 1, brighter red >1; must-clauses get blue
// instead of red so visual weight tracks gate-vs-bonus. Click a header to sort.
//
// Layout fits the 390-wide mobile artboard:
//   ┌────────────────────────────────────────────┐
//   │ seed       │ ✦  │m1│m2│m3│s1│s2│s3│s4│s5│  │
//   │ X1B8TW4J   │ 12 │ ✓│ 3│ 1│ 1│ 0│ 2│ 0│ 1│  │
//   │ ...                                          │
//   └────────────────────────────────────────────┘
//
// Header is sticky. Tap a column header to sort by that column (desc → asc → off).
// The seed and ✦ (total) columns are pinned-left visually.
// Cell coloring: must-hits → blue, should-hits → red, zero → dark-grey, fail-must → red-X.

const Crt = window.JimboColor;
const saUM = React.useMemo;
const saUS = React.useState;

// deterministic small-int hash for demo variation — same input → same output
function rtHash(s, salt) {
  let h = 0; const k = String(s) + ':' + salt;
  for (let i = 0; i < k.length; i++) h = ((h << 5) - h + k.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// pull seed/score into a flat row keyed by clause id
function rtBuildRow(seed, filter) {
  const totals = seed.score?.totals || {};
  const must = filter.must.map(c => ({ id: c.id, label: c.label, kind: 'must', count: totals[c.id] || 0 }));
  const should = filter.should.map(c => ({ id: c.id, label: c.label, kind: 'should', count: totals[c.id] || 0 }));
  const total = seed.score?.totalScore ?? 0;
  return { seed: seed.seed, deck: seed.deck, stake: seed.stake, must, should, total };
}

// add demo variation across cloned seeds so the table looks real
function rtVariate(row, idx) {
  if (idx === 0) return row; // first seed is canonical
  const next = JSON.parse(JSON.stringify(row));
  next.must = next.must.map((m, i) => {
    const r = rtHash(row.seed, 'm' + i) % 5;
    // must clauses tend to be 0 or 1 (gate); occasionally a 0 to show the fail case
    return { ...m, count: r === 0 ? 0 : 1 };
  });
  next.should = next.should.map((s, i) => {
    const r = rtHash(row.seed, 's' + i) % 7;
    // should clauses can be 0..3
    return { ...s, count: r < 3 ? 0 : r - 3 };
  });
  // recompute total: must are pass/fail (1 each on hit), should sum hits
  const mt = next.must.reduce((a, m) => a + (m.count > 0 ? 1 : 0), 0);
  const st = next.should.reduce((a, s) => a + s.count, 0);
  next.total = mt + st;
  return next;
}

function rtCellColor(kind, count) {
  if (count === 0) return { bg: 'transparent', fg: Crt.GREY };
  if (kind === 'must') {
    return { bg: count >= 2 ? Crt.BLUE : '#0d4a82', fg: Crt.WHITE };
  }
  // should — red ramp
  if (count >= 3) return { bg: Crt.RED, fg: Crt.WHITE };
  if (count === 2) return { bg: '#a82a22', fg: Crt.WHITE };
  return { bg: '#5a1a16', fg: Crt.WHITE };
}

function SeedResultsTable({ seeds, filter }) {
  const baseRows = saUM(() => seeds.map((s, i) => rtVariate(rtBuildRow(s, filter), i)), [seeds, filter]);
  const [sortKey, setSortKey] = saUS('total'); // 'total' | 'seed' | clauseId
  const [sortDir, setSortDir] = saUS('desc');  // 'desc' | 'asc'

  const rows = saUM(() => {
    const out = [...baseRows];
    out.sort((a, b) => {
      let av, bv;
      if (sortKey === 'total') { av = a.total; bv = b.total; }
      else if (sortKey === 'seed') { av = a.seed; bv = b.seed; }
      else {
        const aHit = [...a.must, ...a.should].find(c => c.id === sortKey);
        const bHit = [...b.must, ...b.should].find(c => c.id === sortKey);
        av = aHit?.count ?? 0; bv = bHit?.count ?? 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return out;
  }, [baseRows, sortKey, sortDir]);

  const onHeaderClick = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // share columns shape
  const allClauses = [
    ...filter.must.map(c => ({ id: c.id, label: c.label, kind: 'must' })),
    ...filter.should.map(c => ({ id: c.id, label: c.label, kind: 'should' })),
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: Crt.DARKEST,
      fontFamily: 'm6x11plus, monospace', color: Crt.WHITE,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '10px 12px 6px', flexShrink: 0,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 14, color: Crt.WHITE, letterSpacing: 2 }}>results</div>
        <div style={{ fontSize: 10, color: Crt.GREY, letterSpacing: 2 }}>
          {rows.length} seeds · sort {sortKey === 'total' ? 'score' : sortKey === 'seed' ? 'seed' : sortKey} {sortDir === 'desc' ? '↓' : '↑'}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'none' }}>
        <table style={{
          width: '100%', borderCollapse: 'separate', borderSpacing: 0,
          fontFamily: 'm6x11plus, monospace',
        }}>
          <thead>
            <tr>
              <RtHeader sticky left={0} sortable onClick={() => onHeaderClick('seed')}
                       active={sortKey === 'seed'} dir={sortDir} title="seed">seed</RtHeader>
              <RtHeader sticky left={92} sortable onClick={() => onHeaderClick('total')}
                       active={sortKey === 'total'} dir={sortDir} title="total score" wide>✦</RtHeader>
              {allClauses.map(c => (
                <RtHeader key={c.id} sortable onClick={() => onHeaderClick(c.id)}
                         active={sortKey === c.id} dir={sortDir}
                         kind={c.kind} title={c.label}>
                  {c.id}
                </RtHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.seed} style={{ background: i % 2 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                <RtCell sticky left={0} bg={Crt.DARKEST}>
                  <span style={{ color: Crt.GOLD_TEXT, letterSpacing: 1.5, fontSize: 13 }}>{row.seed}</span>
                </RtCell>
                <RtCell sticky left={92} bg={Crt.DARKEST} center>
                  <span style={{
                    color: row.total > 0 ? Crt.GOLD_TEXT : Crt.GREY,
                    fontSize: 14, letterSpacing: 1,
                  }}>{row.total}</span>
                </RtCell>
                {allClauses.map(c => {
                  const hit = [...row.must, ...row.should].find(x => x.id === c.id);
                  const count = hit?.count ?? 0;
                  const isMustFail = c.kind === 'must' && count === 0;
                  const cellSty = isMustFail
                    ? { bg: 'rgba(255,76,64,0.15)', fg: Crt.RED }
                    : rtCellColor(c.kind, count);
                  return (
                    <RtCell key={c.id} center>
                      <div style={{
                        width: 26, height: 22, margin: '0 auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: cellSty.bg,
                        color: cellSty.fg,
                        fontSize: 12, letterSpacing: 0,
                        borderRadius: 3,
                      }}>
                        {isMustFail ? '✕' : (count === 0 ? '·' : count)}
                      </div>
                    </RtCell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer legend — single line, no fluff */}
      <div style={{
        padding: '8px 12px 10px', flexShrink: 0,
        display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 9, letterSpacing: 1.5,
        color: Crt.GREY, borderTop: `1px solid ${Crt.PANEL_EDGE}`,
      }}>
        <LegendDot bg={Crt.BLUE} label="must hit" />
        <LegendDot bg={Crt.RED} label="should hit" />
        <LegendDot bg="rgba(255,76,64,0.15)" label="must fail" border={Crt.RED} />
        <span>· tap header to sort</span>
      </div>
    </div>
  );
}

function RtHeader({ children, sortable, onClick, active, dir, kind, sticky, left, wide, title }) {
  const accent = kind === 'must' ? Crt.BLUE : kind === 'should' ? Crt.RED : Crt.GREY;
  return (
    <th
      onClick={sortable ? onClick : undefined}
      title={title}
      style={{
        position: sticky ? 'sticky' : 'static',
        left: sticky ? left : undefined,
        background: sticky ? Crt.DARKEST : Crt.DARK_GREY,
        color: active ? Crt.WHITE : Crt.GREY,
        padding: '6px 6px',
        fontSize: 10, fontWeight: 400, letterSpacing: 1.5,
        textAlign: 'center',
        cursor: sortable ? 'pointer' : 'default',
        borderBottom: `2px solid ${active ? accent : Crt.PANEL_EDGE}`,
        whiteSpace: 'nowrap',
        zIndex: sticky ? 2 : 1,
        minWidth: wide ? 36 : 32,
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        color: kind && !active ? accent : undefined,
        opacity: kind && !active ? 0.7 : 1,
      }}>
        {children}
        {active && <span style={{ fontSize: 9, opacity: 0.8 }}>{dir === 'desc' ? '↓' : '↑'}</span>}
      </span>
    </th>
  );
}

function RtCell({ children, sticky, left, bg, center }) {
  return (
    <td style={{
      position: sticky ? 'sticky' : 'static',
      left: sticky ? left : undefined,
      background: sticky ? bg : 'transparent',
      padding: '4px 6px',
      textAlign: center ? 'center' : 'left',
      borderBottom: `1px solid rgba(255,255,255,0.025)`,
      whiteSpace: 'nowrap',
      zIndex: sticky ? 1 : 0,
    }}>{children}</td>
  );
}

function LegendDot({ bg, label, border }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        display: 'inline-block', width: 10, height: 10, borderRadius: 2,
        background: bg, border: border ? `1px solid ${border}` : 'none',
      }} />
      {label}
    </span>
  );
}

window.SeedResultsTable = SeedResultsTable;
