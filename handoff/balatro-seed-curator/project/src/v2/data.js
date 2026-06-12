// v2 data — flat ante model (matches BSO's AnteAnalysisModel).
// Each ante: boss, voucher, smallBlindTag, bigBlindTag, shopQueue[], boosterPacks[].
// Each item carries hits: [{clauseId, score}] computed against the filter.
// (We pre-compute hits here for the mock; in the real app, a matcher does it.)

// ── Helpers (must be defined before anything else) ────
function normalizeStr(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
const RARITY = {
  blueprint: 'Legendary', brainstorm: 'Rare', baseball: 'Rare', perkeo: 'Legendary',
  yorick: 'Legendary', chicot: 'Legendary', triboulet: 'Legendary', canio: 'Legendary',
  hangingchad: 'Common', photograph: 'Common', scholar: 'Common', supernova: 'Common',
  showman: 'Uncommon', ceremonialdagger: 'Uncommon', fibonacci: 'Uncommon',
  bull: 'Uncommon', banner: 'Common', steeljoker: 'Uncommon',
  hologram: 'Rare', invisible: 'Rare', campfire: 'Rare', bootstraps: 'Rare',
  stuntdouble: 'Rare', obelisk: 'Rare', throwback: 'Rare', matador: 'Rare',
};
function jokerRarity(name) { return RARITY[normalizeStr(name)] || 'Common'; }
window.jokerRarity = jokerRarity;
window.normalizeStr = normalizeStr;

// ── Filter: "Blueprint in shop slots 2-3 of Ante 2, +2 points" etc.
window.FILTER_V2 = {
  name: 'SkipTagAnte2BlueprintAnte2',
  author: 'pifreak',
  description: 'Negative Skip Tag Ante 2 lands on a Blueprint',
  must: [
    { id: 'm1', type: 'smallblindtag', value: 'negativetag', antes: [2], label: 'Negative Tag' },
    { id: 'm2', type: 'souljoker', value: 'perkeo', antes: [3,4,5], label: 'Perkeo' },
    { id: 'm3', type: 'joker', value: 'showman', antes: [2], sources: { shopSlots: [0,1], packSlots: [0,1] }, label: 'Showman' },
  ],
  should: [
    { id: 's1', type: 'joker', value: 'hangingchad',  antes: [2], sources: { shopSlots: [2,3] }, score: 1, label: 'Hanging Chad' },
    { id: 's2', type: 'joker', value: 'photograph',   antes: [2], sources: { shopSlots: [2,3] }, score: 1, label: 'Photograph' },
    { id: 's3', type: 'joker', value: 'blueprint',    antes: [2], sources: { shopSlots: [2,3] }, score: 2, label: 'Blueprint' },
    { id: 's4', type: 'joker', value: 'brainstorm',   antes: [2], sources: { shopSlots: [2,3] }, score: 2, label: 'Brainstorm' },
    // Wildcard: "any Rare Joker in ante 3 shop" — the analyzer picks the specific
    // joker from each seed to satisfy this.
    { id: 's5', type: 'joker', value: 'any', rarity: 'Rare', antes: [3], sources: { shopSlots: [0,1,2,3,4,5] }, score: 1, label: 'Any Rare' },
  ],
  deck: 'Red',
  stake: 'White',
};

// ── Helpers to build a shop item in mock data ────
function s(value, type = 'joker', { edition = null, slot = null } = {}) {
  return { type, value, edition, _slot: slot };
}

// ── Seed 1: a strong match (hits Negative Tag A2, Blueprint A2 shop#2, Perkeo A3)
const seed1 = {
  seed: 'X1B8TW4J',
  deck: 'Red',
  stake: 'White',
  antes: [
    {
      ante: 1,
      boss: 'TheArm',
      voucher: 'Overstock',
      smallBlindTag: 'UncommonTag',
      bigBlindTag: 'RareTag',
      shopQueue: [
        s('joker', 'joker'), s('greedyjoker'), s('lustyjoker'),
        s('jollyjoker'), s('halfjoker'), s('evensteven'),
        s('scholar'), s('supernova'), s('banner'),
      ],
      boosterPacks: [
        { type: 'arcanapack', items: ['themagician', 'thehighpriestess', 'theemperor'] },
        { type: 'buffoonpack', items: ['fibonacci', 'cartomancer'] },
      ],
    },
    {
      ante: 2,
      boss: 'TheHouse',
      voucher: 'ClearanceSale',
      smallBlindTag: 'NegativeTag',   // ← hits m1
      bigBlindTag: 'FoilTag',
      shopQueue: [
        s('showman', 'joker'),        // slot 0 → hits m3
        s('bull'),                     // slot 1
        s('blueprint', 'joker', { edition: 'Foil' }), // slot 2 → hits s3 (×2)
        s('hangingchad'),              // slot 3 → hits s1
        s('scaryface'),                // slot 4
        s('abstractjoker'),            // slot 5
        s('delayedgratification'),
        s('hack'),
      ],
      boosterPacks: [
        { type: 'arcanapack', items: ['thetower', 'strength', 'justice'] },
        { type: 'buffoonpack', items: ['brainstorm', 'ceremonialdagger'] },
      ],
    },
    {
      ante: 3,
      boss: 'TheClub',
      voucher: null,
      smallBlindTag: 'HolographicTag',
      bigBlindTag: 'PolychromeTag',
      shopQueue: [
        s('hologram'), s('zanyjoker'), s('madjoker'),
        s('crazyjoker'), s('drolljoker'), s('slyjoker'),
        s('wilyjoker'), s('cleverjoker'),
      ],
      boosterPacks: [
        { type: 'spectralpack', items: ['thesoul'] }, // spawns SoulJoker
        { type: 'celestialpack', items: ['mercury', 'venus'] },
      ],
      soulJoker: { value: 'perkeo', edition: 'Negative' }, // ← hits m2
    },
    {
      ante: 4,
      boss: 'TheFish',
      voucher: 'Telescope',
      smallBlindTag: 'StandardTag',
      bigBlindTag: 'CharmTag',
      shopQueue: [
        s('gros michel'), s('fibonacci'), s('steeljoker'),
        s('scaryface'), s('abstractjoker'), s('delayedgratification'),
      ],
      boosterPacks: [
        { type: 'arcanapack', items: ['death', 'temperance', 'thedevil'] },
      ],
    },
    {
      ante: 5,
      boss: 'ThePsychic',
      voucher: 'Grabber',
      smallBlindTag: 'TopUpTag',
      bigBlindTag: 'MeteorTag',
      shopQueue: [
        s('raisedfist'), s('chaos'), s('fibonacci'),
        s('steeljoker'), s('scaryface'), s('abstractjoker'),
      ],
      boosterPacks: [
        { type: 'megaarcanapack', items: ['justice','death','temperance','thedevil','thetower'] },
      ],
    },
    {
      ante: 6,
      boss: 'TheWater',
      voucher: 'Hone',
      smallBlindTag: 'CouponTag',
      bigBlindTag: 'BossTag',
      shopQueue: [
        s('joker', 'joker'), s('greedyjoker'), s('lustyjoker'),
        s('wrathfuljoker'), s('gluttonousjoker'), s('jollyjoker'),
      ],
      boosterPacks: [
        { type: 'standardpack', items: ['kh', 'qd', '10s'] },
      ],
    },
    {
      ante: 7,
      boss: 'TheWheel',
      voucher: null,
      smallBlindTag: 'OrbitalTag',
      bigBlindTag: 'EtherealTag',
      shopQueue: [
        s('ceremonial'), s('banner'), s('mysticsummit'),
        s('marblejoker'), s('loyaltycard'), s('eightball'),
      ],
      boosterPacks: [
        { type: 'jumbobuffoonpack', items: ['blueprint','cartomancer','astronomer'] },
      ],
    },
    {
      ante: 8,
      boss: 'ThePillar',
      voucher: null,
      smallBlindTag: 'DoubleTag',
      bigBlindTag: 'JuggleTag',
      shopQueue: [
        s('blueprint', 'joker'), s('brainstorm'),
        s('blueprint', 'joker', { edition: 'Polychrome' }),
        s('blueprint', 'joker'), s('scholar'), s('supernova'),
      ],
      boosterPacks: [
        { type: 'buffoonpack', items: ['blueprint','blueprint'] },
      ],
    },
  ],
};

// ── Compute hits: walk every ante's items and match against filter clauses.
// Wildcard match: clause.value === 'any' means "any joker matching filters"
//   (e.g. rarity). The specific matching joker is recorded in `matches[clauseId]`
//   so the UI can render it in wildcard columns.
function computeHits(seed, filter) {
  const clauses = [...filter.must.map(c => ({...c, _kind:'must'})), ...filter.should.map(c => ({...c, _kind:'should'}))];
  const totals = {}; clauses.forEach(c => totals[c.id] = 0);
  const matches = {}; clauses.forEach(c => matches[c.id] = []); // [{value, ante, where}]
  let totalScore = 0;

  const wildcardOK = (c, itemName) => {
    if (c.value !== 'any') return normalizeStr(c.value) === normalizeStr(itemName);
    if (c.rarity && jokerRarity(itemName) !== c.rarity) return false;
    return true;
  };

  for (const ante of seed.antes) {
    ante.shopQueue.forEach((item, slot) => {
      item._slot = slot;
      item.hits = [];
      for (const c of clauses) {
        if (!c.antes.includes(ante.ante)) continue;
        if (c.type === 'joker' && item.type === 'joker' && wildcardOK(c, item.value)) {
          if (c.sources?.shopSlots && !c.sources.shopSlots.includes(slot)) continue;
          if (c.edition && item.edition !== c.edition) continue;
          item.hits.push({ id: c.id, kind: c._kind, score: c.score || 0 });
          totals[c.id]++;
          matches[c.id].push({ value: item.value, edition: item.edition, ante: ante.ante, where: `Shop #${slot+1}` });
          totalScore += c.score || 0;
        }
      }
    });
    ante.boosterPacks.forEach((pack, pidx) => {
      pack.hits = [];
      pack.itemHits = pack.items.map(() => []);
      pack.items.forEach((itemName, islot) => {
        for (const c of clauses) {
          if (!c.antes.includes(ante.ante)) continue;
          if (c.type === 'joker' && wildcardOK(c, itemName)) {
            if (c.sources?.packSlots && !c.sources.packSlots.includes(pidx)) continue;
            pack.itemHits[islot].push({ id: c.id, kind: c._kind, score: c.score || 0 });
            totals[c.id]++;
            matches[c.id].push({ value: itemName, ante: ante.ante, where: `Pack ${pidx+1}` });
            totalScore += c.score || 0;
          }
        }
      });
      if (pack.itemHits.some(h => h.length)) pack.hits = ['match'];
    });
    if (ante.voucher) {
      for (const c of clauses) {
        if (c.type === 'voucher' && c.antes.includes(ante.ante) && normalizeStr(c.value) === normalizeStr(ante.voucher)) {
          ante._voucherHits = (ante._voucherHits || []).concat({ id: c.id, kind: c._kind, score: c.score || 0 });
          totals[c.id]++;
          matches[c.id].push({ value: ante.voucher, ante: ante.ante, where: 'Voucher' });
        }
      }
    }
    ante._smallTagHits = [];
    ante._bigTagHits = [];
    for (const c of clauses) {
      if (!c.antes.includes(ante.ante)) continue;
      if (c.type === 'smallblindtag' && normalizeStr(c.value) === normalizeStr(ante.smallBlindTag)) {
        ante._smallTagHits.push({id:c.id,kind:c._kind}); totals[c.id]++;
        matches[c.id].push({ value: ante.smallBlindTag, ante: ante.ante, where: 'Small Tag' });
      }
      if (c.type === 'bigblindtag' && normalizeStr(c.value) === normalizeStr(ante.bigBlindTag)) {
        ante._bigTagHits.push({id:c.id,kind:c._kind}); totals[c.id]++;
        matches[c.id].push({ value: ante.bigBlindTag, ante: ante.ante, where: 'Big Tag' });
      }
    }
    if (ante.soulJoker) {
      ante._soulHits = [];
      for (const c of clauses) {
        if (c.type === 'souljoker' && c.antes.includes(ante.ante) && (c.value === 'any' || normalizeStr(c.value) === normalizeStr(ante.soulJoker.value))) {
          if (c.edition && ante.soulJoker.edition !== c.edition) continue;
          ante._soulHits.push({id:c.id,kind:c._kind});
          totals[c.id]++;
          matches[c.id].push({ value: ante.soulJoker.value, edition: ante.soulJoker.edition, ante: ante.ante, where: 'Soul' });
        }
      }
    }
    if (ante.boss) {
      ante._bossHits = [];
      for (const c of clauses) {
        if (c.type === 'boss' && c.antes.includes(ante.ante) && normalizeStr(c.value) === normalizeStr(ante.boss)) {
          ante._bossHits.push({id:c.id,kind:c._kind});
          totals[c.id]++;
          matches[c.id].push({ value: ante.boss, ante: ante.ante, where: 'Boss' });
        }
      }
    }
  }

  return { totals, matches, totalScore };
}

// Minimal rarity lookup for a handful of jokers used in the mock data.
const _RARITY_DUP = null; // rarity was hoisted above computeHits

const summary1 = computeHits(seed1, window.FILTER_V2);
seed1.score = summary1;

// two lean siblings for swipe nav
const seed2 = JSON.parse(JSON.stringify(seed1)); seed2.seed = 'ALEPH999';
seed2.score = computeHits(seed2, window.FILTER_V2);
const seed3 = JSON.parse(JSON.stringify(seed1)); seed3.seed = 'BETAZ3RO';
seed3.score = computeHits(seed3, window.FILTER_V2);

window.SEEDS_V2 = [seed1, seed2, seed3];
window.computeHits = computeHits;
window.normalizeStr = normalizeStr;
