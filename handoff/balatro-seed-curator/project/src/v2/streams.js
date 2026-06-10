// streams.js — stream catalog + JAML→streams compiler.
//
// PHILOSOPHY (per pifreak):
//   The JAML defines the WHAT and the WHERE.
//   The compiler derives WHICH PRNG STREAMS to render — only the streams
//   the filter actually queries. If the filter wants "Negative Tag ante 6",
//   we render the small-blind-tag stream for ante 6, not all streams.
//
// PIPELINE:
//   filter (must[] + should[])  →  compileFilter(filter)  →  streamSpec[]
//   streamSpec is per-ante, in clause-priority order, deduped.
//
// STREAM KINDS (the catalog):
//   shop          — infinite shop queue, slot index = "shop slot N of ante A"
//   voucher       — single voucher per ante
//   smallTag      — small-blind tag per ante
//   bigTag        — big-blind tag per ante
//   boss          — big-blind boss per ante
//   pack          — booster pack contents (arcana/buffoon/standard/celestial/spectral)
//   souljoker     — soul-pull stream (one per ante max; legendary jokers)
//   standardpack  — playing cards inside standard packs (separate stream, distinct PRNG feel)
//
// Each stream entry the renderer consumes:
//   {
//     id: 'a2.shop',           // unique key
//     kind: 'shop',
//     ante: 2,
//     label: 'Ante 2 · Shop',
//     clauses: [m3, s1, s2, …] // which JAML clauses query this stream
//     slotsOfInterest: Set<number> // slot indices the clauses care about (for highlighting)
//     priority: number         // lower = render earlier; must beats should
//   }

(function () {
  'use strict';

  // ── 1. Map a clause's `type` to the stream kind it queries ─────────
  function clauseStreamKind(clause) {
    const t = String(clause.type || '').toLowerCase();
    if (t === 'joker' && clause.sources?.shopSlots) return 'shop';
    if (t === 'joker' && clause.sources?.packSlots) return 'pack';
    if (t === 'joker') return 'shop'; // default joker location
    if (t === 'souljoker') return 'souljoker';
    if (t === 'voucher') return 'voucher';
    if (t === 'smallblindtag' || t === 'smalltag') return 'smallTag';
    if (t === 'bigblindtag' || t === 'bigtag') return 'bigTag';
    if (t === 'boss') return 'boss';
    if (t === 'tarot' || t === 'planet' || t === 'spectral') return 'pack';
    if (t === 'playingcard') return 'standardpack';
    return 'shop'; // fallback
  }

  // ── 2. Given a clause, produce the (ante, kind) pairs it touches ─
  function clauseStreamRefs(clause) {
    const kind = clauseStreamKind(clause);
    const antes = Array.isArray(clause.antes) && clause.antes.length
      ? clause.antes
      : [1, 2, 3, 4, 5, 6, 7, 8]; // unscoped → all antes
    return antes.map((ante) => ({ ante, kind, clause }));
  }

  // ── 3. Compile a full filter → ordered, deduped stream list ──────
  function compileFilter(filter) {
    if (!filter) return [];
    const must = Array.isArray(filter.must) ? filter.must : [];
    const should = Array.isArray(filter.should) ? filter.should : [];

    // Walk must[] first (priority 0), then should[] (priority 1).
    // Build a map keyed by `${ante}.${kind}` so multiple clauses on the same
    // stream merge into one render spec.
    const byKey = new Map();
    const pushClauses = (clauses, basePri) => {
      clauses.forEach((c, idx) => {
        for (const ref of clauseStreamRefs(c)) {
          const key = `${ref.ante}.${ref.kind}`;
          let spec = byKey.get(key);
          if (!spec) {
            spec = {
              id: key,
              kind: ref.kind,
              ante: ref.ante,
              clauses: [],
              slotsOfInterest: new Set(),
              priority: basePri * 1000 + idx, // stable order within tier
            };
            byKey.set(key, spec);
          }
          spec.clauses.push(ref.clause);
          // Collect slot indices for shop/pack streams so we can highlight them
          const slots = ref.clause.sources?.shopSlots
            || ref.clause.sources?.packSlots
            || [];
          slots.forEach((s) => spec.slotsOfInterest.add(s));
        }
      });
    };
    pushClauses(must, 0);
    pushClauses(should, 1);

    // Sort: by priority, then by ante asc, then by kind for stable layout.
    const KIND_ORDER = {
      smallTag: 0, bigTag: 1, boss: 2, voucher: 3,
      shop: 4, pack: 5, standardpack: 6, souljoker: 7,
    };
    const out = [...byKey.values()].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.ante !== b.ante) return a.ante - b.ante;
      return (KIND_ORDER[a.kind] ?? 99) - (KIND_ORDER[b.kind] ?? 99);
    });

    // Attach a human label for the lane header.
    const KIND_LABEL = {
      shop: 'Shop',
      pack: 'Packs',
      standardpack: 'Standard Pack',
      souljoker: 'Soul',
      voucher: 'Voucher',
      smallTag: 'Small Tag',
      bigTag: 'Big Tag',
      boss: 'Boss',
    };
    out.forEach((s) => {
      s.label = `Ante ${s.ante} · ${KIND_LABEL[s.kind] || s.kind}`;
    });
    return out;
  }

  // ── 4. Group streams by ante for the renderer ───────────────────
  function groupByAnte(streamSpecs) {
    const byAnte = new Map();
    for (const spec of streamSpecs) {
      if (!byAnte.has(spec.ante)) byAnte.set(spec.ante, []);
      byAnte.get(spec.ante).push(spec);
    }
    return [...byAnte.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ante, streams]) => ({ ante, streams }));
  }

  window.JAMLStreams = { compileFilter, groupByAnte, clauseStreamKind };
})();
