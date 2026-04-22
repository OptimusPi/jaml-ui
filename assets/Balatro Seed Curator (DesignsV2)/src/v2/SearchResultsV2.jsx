// SearchResultsV2 — vault/results table.
// Each row is: [seed] [deck] [ scoreCols (same as SeedDetail top bar) ] [total]
// Tap a row → expands inline into the full SeedDetailV2 for that seed.
// Header row shows the SAME score columns as column headers — the filter, the
// column headers, and the per-row chips are all the same visual object.

const { useState: rUS, useMemo: rUM } = React;
const Cr = window.JimboColor;

// Generate a handful of pseudo-seeds by mutating the base one so the list
// has varied scores.
function makeResults(base, filter, count = 12) {
  const out = [];
  const pool = [
    'blueprint','brainstorm','hangingchad','photograph','showman','baseball',
    'fibonacci','ceremonialdagger','bull','scholar','banner','supernova',
  ];
  for (let i = 0; i < count; i++) {
    const seed = JSON.parse(JSON.stringify(base));
    seed.seed = randSeed();
    // Mutate some ante 2 shop slots to produce different hit distributions
    for (const a of seed.antes) {
      a.shopQueue.forEach(s => { delete s.hits; });
      a.boosterPacks.forEach(p => { delete p.itemHits; delete p.hits; });
      delete a._voucherHits; delete a._smallTagHits; delete a._bigTagHits; delete a._bossHits; delete a._soulHits;
    }
    const a2 = seed.antes[1];
    if (i % 3 === 1) a2.shopQueue[2] = { type: 'joker', value: pool[(i * 7) % pool.length] };
    if (i % 4 === 2) a2.shopQueue[3] = { type: 'joker', value: pool[(i * 3) % pool.length] };
    if (i === 3) a2.smallBlindTag = 'RareTag'; // break must
    if (i === 7) seed.antes[2].soulJoker = { value: 'yorick', edition: null }; // break must
    seed.score = window.computeHits(seed, filter);
    out.push(seed);
  }
  // Always put the perfect base seed first
  out.unshift(base);
  return out;
}
function randSeed() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ── MiniScoreChip — smaller variant of the SeedDetail ScoreCol for table cells.
function MiniScoreChip({ clause, hits, kind }) {
  const lit = hits > 0;
  const must = kind === 'must';
  const color = must ? Cr.BLUE : lit ? Cr.RED : Cr.GREY;

  const spriteKind =
    clause.type === 'joker' || clause.type === 'souljoker' ? 'jokers' :
    clause.type === 'voucher' ? 'vouchers' :
    clause.type === 'smallblindtag' || clause.type === 'bigblindtag' ? 'tags' :
    clause.type === 'boss' ? 'blinds' : null;

  const w = 22, h = spriteKind === 'tags' || spriteKind === 'blinds' ? 22 : 30;
  const sprite =
    spriteKind === 'jokers'   ? <Sprite sheet="jokers" name={clause.value} width={w} height={h} /> :
    spriteKind === 'vouchers' ? <Sprite sheet="vouchers" name={clause.value} width={w} height={h} /> :
    spriteKind === 'tags'     ? <Sprite sheet="tags" name={clause.value} width={h} height={h} /> :
    spriteKind === 'blinds'   ? <BossChip name={clause.value} size={h} /> : null;

  if (must) {
    return (
      <div style={{
        position: 'relative', padding: '2px 3px', borderRadius: 3,
        border: `1.5px solid ${lit ? color : Cr.DARK_GREY}`,
        background: lit ? `${color}22` : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: lit ? 1 : 0.5,
        minWidth: 28,
      }}>{sprite}
        {!lit && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: Cr.DARK_RED, fontSize: 22, lineHeight: 1, textShadow: '0 0 4px #000' }}>✗</div>
        )}
      </div>
    );
  }
  return (
    <div style={{
      position: 'relative',
      opacity: lit ? 1 : 0.35, filter: lit ? 'none' : 'grayscale(0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minWidth: 28,
    }}>
      {sprite}
      {lit && (
        <div style={{
          position: 'absolute', bottom: -3, right: -4,
          minWidth: 14, height: 13, padding: '0 2px',
          background: Cr.DARKEST,
          fontFamily: 'm6x11plus, monospace', fontSize: 9, lineHeight: '13px',
          color, textAlign: 'center', borderRadius: 6,
        }}>×{hits}</div>
      )}
    </div>
  );
}

// ── ColumnHeader — shows just the tiny sprite in grey (column identity)
function ColumnHeader({ clause, kind }) {
  const color = kind === 'must' ? Cr.BLUE : Cr.RED;
  const spriteKind =
    clause.type === 'joker' || clause.type === 'souljoker' ? 'jokers' :
    clause.type === 'voucher' ? 'vouchers' :
    clause.type === 'smallblindtag' || clause.type === 'bigblindtag' ? 'tags' :
    clause.type === 'boss' ? 'blinds' : null;
  const w = 18, h = spriteKind === 'tags' || spriteKind === 'blinds' ? 18 : 24;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 28 }}>
      <div style={{ opacity: 0.8 }}>
        {spriteKind === 'jokers'   && <Sprite sheet="jokers" name={clause.value} width={w} height={h} />}
        {spriteKind === 'vouchers' && <Sprite sheet="vouchers" name={clause.value} width={w} height={h} />}
        {spriteKind === 'tags'     && <Sprite sheet="tags" name={clause.value} width={h} height={h} />}
        {spriteKind === 'blinds'   && <BossChip name={clause.value} size={h} />}
      </div>
      <div style={{ width: 16, height: 2, background: color, borderRadius: 1 }} />
    </div>
  );
}

// ── ResultRow — one seed
function ResultRow({ seed, filter, expanded, onToggle, onCopy }) {
  const must = filter.must, should = filter.should;
  const score = seed.score?.totalScore ?? 0;
  const [copied, setCopied] = rUS(false);

  // Top hit line: the matched clause worth the most points — what the user is bragging about.
  let topHit = null;
  let topScore = -1;
  for (const c of [...must, ...should]) {
    const n = seed.score?.totals[c.id] || 0;
    if (!n) continue;
    const s = (c.score || 1) * n;
    if (s > topScore) {
      topScore = s;
      const m = seed.score.matches[c.id]?.[0];
      topHit = m ? `${c.label || m.value} · A${m.ante}` : (c.label || c.value);
    }
  }

  const copy = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) navigator.clipboard.writeText(seed.seed).catch(() => {});
    setCopied(true);
    onCopy && onCopy(seed.seed);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div style={{ borderBottom: `1px solid ${Cr.PANEL_EDGE}`, background: expanded ? Cr.DARK_GREY : (copied ? `${Cr.GOLD}22` : 'transparent'), transition: 'background 180ms' }}>
      <div
        onClick={copy}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', cursor: 'pointer',
          borderLeft: `3px solid ${copied ? Cr.GOLD : Cr.BLUE}`,
        }}
      >
        {/* Seed + top hit (replaces useless deck/stake repetition) */}
        <div style={{ minWidth: 88 }}>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 13, color: copied ? Cr.GOLD : Cr.WHITE, letterSpacing: 2, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>
            {copied ? 'COPIED!' : seed.seed}
          </div>
          {topHit && !copied && (
            <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: Cr.GOLD_TEXT, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>♪ {topHit}</div>
          )}
        </div>
        {/* Should chips only — musts are assumed to have matched */}
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {should.map(c => <MiniScoreChip key={c.id} clause={c} hits={seed.score?.totals[c.id] || 0} kind="should" />)}
        </div>
        {/* Score */}
        <div style={{
          fontFamily: 'm6x11plus, monospace', fontSize: 16, color: Cr.RED, letterSpacing: 1,
          minWidth: 28, textAlign: 'right',
        }}>{score}</div>
        {/* chevron — opens detail (stops propagation so tap still copies) */}
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ padding: '6px 4px' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{
            color: Cr.GREY, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 180ms',
          }}><path d="M3 1 L7 5 L3 9" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </div>
      </div>

      {expanded && (
        <div style={{
          borderTop: `2px solid ${Cr.BLACK}`,
          background: Cr.DARKEST,
          height: 640, overflow: 'hidden',
        }}>
          <SeedDetailV2 seeds={[seed]} filter={filter} embedded />
        </div>
      )}
    </div>
  );
}

// ── SearchHeader — top chrome: filter name + count + column header row
function SearchHeader({ filter, count }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: Cr.DARKEST, borderBottom: `2px solid ${Cr.BLACK}`,
      boxShadow: `0 2px 0 ${Cr.BLACK}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px 6px' }}>
        <div>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: Cr.GREY, letterSpacing: 1.5 }}>FILTER</div>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 13, color: Cr.WHITE, letterSpacing: 1 }}>{filter.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 8, color: Cr.GREY, letterSpacing: 1.5 }}>RESULTS</div>
          <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 13, color: Cr.WHITE }}>{count}</div>
        </div>
      </div>
      {/* Column header row: aligned to match ResultRow's column structure */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8, padding: '6px 10px 8px',
        background: `linear-gradient(180deg, ${Cr.DARKEST}, ${Cr.DARK_GREY})`,
        borderTop: `1px solid ${Cr.BLACK}`,
      }}>
        <div style={{ minWidth: 88, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ fontSize: 8, color: Cr.GREY, letterSpacing: 1.5 }}>SEED</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {filter.should.map(c => <ColumnHeader key={c.id} clause={c} kind="should" />)}
        </div>
        <div style={{ fontSize: 8, color: Cr.RED, letterSpacing: 1.5, minWidth: 28, textAlign: 'right' }}>SCORE</div>
        <div style={{ width: 10 }} />
      </div>
    </div>
  );
}

function SearchResultsV2({ filter }) {
  const results = rUM(() => makeResults(window.SEEDS_V2[0], filter, 12), [filter]);
  const [sortBy, setSortBy] = rUS('score');
  const [openId, setOpenId] = rUS(null);
  const [toast, setToast] = rUS(null);

  const sorted = rUM(() => {
    const a = [...results];
    if (sortBy === 'score') a.sort((x, y) => y.score.totalScore - x.score.totalScore);
    return a;
  }, [results, sortBy]);

  const onCopy = (seed) => {
    setToast(seed);
    setTimeout(() => setToast(t => t === seed ? null : t), 1400);
  };

  return (
    <div style={{
      height: '100%', width: '100%', background: Cr.DARKEST,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'm6x11plus, monospace', color: Cr.WHITE, position: 'relative',
    }}>
      <SearchHeader filter={filter} count={results.length} />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {sorted.map(s => (
          <ResultRow
            key={s.seed}
            seed={s}
            filter={filter}
            expanded={openId === s.seed}
            onToggle={() => setOpenId(openId === s.seed ? null : s.seed)}
            onCopy={onCopy}
          />
        ))}
      </div>
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)',
          background: Cr.GOLD, color: Cr.BLACK, padding: '8px 16px', borderRadius: 6,
          fontSize: 13, letterSpacing: 2, boxShadow: '0 4px 0 rgba(0,0,0,.6)',
          border: `2px solid ${Cr.GOLD_TEXT}`, zIndex: 50,
        }}>✓ {toast} COPIED</div>
      )}
    </div>
  );
}

window.SearchResultsV2 = SearchResultsV2;
