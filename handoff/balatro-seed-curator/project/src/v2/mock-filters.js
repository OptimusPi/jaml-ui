// Mock filter library data for JAML Browser / Finder / Jamlyzer.

window.FILTERS = [
  {
    id: 'neg-skip-a2',
    name: 'negative skip tag a2',
    author: 'pifreak',
    deck: 'Red',
    stake: 'White',
    updatedAt: '2 days ago',
    description: 'negative skip tag lands on a perkeo',
    streams: ['smallBlindTag', 'souljoker'],
    antes: [2, 3, 4, 5],
    must: [
      { id: 'm1', type: 'smallblindtag', value: 'negativetag', antes: [2], label: 'Negative Tag' },
      { id: 'm2', type: 'souljoker', value: 'perkeo', antes: [3, 4, 5], label: 'Perkeo' },
    ],
    should: [
      { id: 's1', type: 'joker', value: 'blueprint', antes: [2], sources: { shopSlots: [2, 3] }, score: 2, label: 'Blueprint' },
    ],
    hitRate: 0.012,
  },
  {
    id: 'observatory-engine',
    name: 'observatory engine',
    author: 'pifreak',
    deck: 'Blue',
    stake: 'Red',
    updatedAt: '1 week ago',
    description: 'observatory voucher + telescope before ante 4',
    streams: ['voucher', 'shopQueue'],
    antes: [1, 2, 3],
    must: [
      { id: 'm1', type: 'voucher', value: 'telescope', antes: [1, 2] },
      { id: 'm2', type: 'voucher', value: 'observatory', antes: [3] },
    ],
    should: [],
    hitRate: 0.004,
  },
  {
    id: 'perkeo-bp',
    name: 'perkeo + blueprint',
    author: 'pifreak',
    deck: 'Magic',
    stake: 'Gold',
    updatedAt: '3 weeks ago',
    description: 'perkeo by ante 3, blueprint in shop by ante 4',
    streams: ['souljoker', 'shopQueue'],
    antes: [2, 3, 4],
    must: [
      { id: 'm1', type: 'souljoker', value: 'perkeo', antes: [2, 3] },
      { id: 'm2', type: 'joker', value: 'blueprint', antes: [4], sources: { shopSlots: [0, 1, 2, 3, 4, 5] } },
    ],
    should: [],
    hitRate: 0.0008,
  },
  {
    id: 'showman-rush',
    name: 'showman rush',
    author: 'wee_joker',
    deck: 'Green',
    stake: 'Green',
    updatedAt: 'last month',
    description: 'showman in shop ante 2, any rare ante 3',
    streams: ['shopQueue'],
    antes: [2, 3],
    must: [
      { id: 'm1', type: 'joker', value: 'showman', antes: [2], sources: { shopSlots: [0, 1, 2, 3] } },
    ],
    should: [
      { id: 's1', type: 'joker', value: 'any', rarity: 'Rare', antes: [3], sources: { shopSlots: [0, 1, 2, 3, 4, 5] }, score: 1 },
    ],
    hitRate: 0.085,
  },
  {
    id: 'soul-collect',
    name: 'soul collector',
    author: 'pifreak',
    deck: 'Ghost',
    stake: 'Purple',
    updatedAt: 'just now',
    description: 'any legendary soul joker before ante 5',
    streams: ['souljoker'],
    antes: [1, 2, 3, 4],
    must: [
      { id: 'm1', type: 'souljoker', value: 'any', antes: [1, 2, 3, 4] },
    ],
    should: [],
    hitRate: 0.018,
  },
];

window.findFilter = function findFilter(id) {
  return window.FILTERS.find((f) => f.id === id);
};

// Mock seed results — used by the Finder to "stream in" results.
window.MOCK_RESULTS = [
  { seed: 'X1B8TW4J', score: 12, hands: 4, ante: 8 },
  { seed: 'ALEPH999', score: 9,  hands: 4, ante: 8 },
  { seed: 'BETAZ3RO', score: 8,  hands: 4, ante: 8 },
  { seed: 'KYRIE001', score: 7,  hands: 4, ante: 8 },
  { seed: 'OMEGA42X', score: 7,  hands: 4, ante: 8 },
  { seed: 'PHIZULU0', score: 6,  hands: 4, ante: 8 },
  { seed: 'RECTUM55', score: 5,  hands: 4, ante: 8 },
  { seed: 'VPH79EQ9', score: 5,  hands: 4, ante: 8 },
  { seed: 'QTAQ777Q', score: 4,  hands: 4, ante: 8 },
  { seed: 'ZZ99ABBA', score: 4,  hands: 4, ante: 8 },
  { seed: 'COSMOSXX', score: 3,  hands: 4, ante: 8 },
  { seed: 'MELLOW01', score: 3,  hands: 4, ante: 8 },
];
