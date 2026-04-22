// Mock data: a "Blueprint + Brainstorm + Telescope" filter + one seed.
// Schema matches JAML should/must clauses. Each hit on the seed carries a
// clauseId so the card can attribute per-clause score.

window.MOCK_FILTER = {
  name: 'Blueprint Parade',
  mustClauses: [
    { id: 'm1', kind: 'Joker', target: 'Blueprint', antes: [1, 2, 3, 4, 5, 6, 7, 8] },
  ],
  shouldClauses: [
    { id: 's1', kind: 'Joker', target: 'Blueprint',  antes: [1, 2, 3, 4, 5, 6, 7, 8], color: '#ff4c40' },
    { id: 's2', kind: 'Joker', target: 'Brainstorm', antes: [1, 2, 3, 4, 5, 6, 7, 8], color: '#0093ff' },
    { id: 's3', kind: 'Voucher', target: 'Telescope', antes: [1, 2, 3, 4, 5, 6, 7, 8], color: '#e4b643' },
  ],
};

// ── Helper for seed generation ────────────────────────────────
// Each ante has: voucher (or null), tags [2], smallBlindPack,
// bigBlindPack, boss, and 4 shops (small, big, boss — each has 6 items
// in 2 rows of 3, but Balatro shops cycle, so we just show a few reroll
// batches). For simplicity: one shop per blind, 4 items per shop slot row.

// Each item: { kind:'Joker'|'Tarot'|'Voucher'|'Pack', name, edition?, hits?:[clauseId] }
// hits = array of clauseIds this item satisfies. Renderer stamps a badge
// per hit and builds the per-clause score by counting.

const seed1 = {
  seed: 'GR0XQVCF',
  deck: 'Red Deck',
  stake: 'Blue Stake',
  score: { total: 7, perClause: { s1: 3, s2: 3, s3: 1, m1: 3 } },
  antes: [
    // Ante 0 is pre-game (just deck/stake summary)
    { ante: 0, voucher: null, tags: [], blinds: [], isPre: true },

    // Ante 1
    {
      ante: 1,
      voucher: { name: 'Overstock', hits: [] },
      tags: [{ name: 'RareTag', hits: [] }, { name: 'UncommonTag', hits: [] }],
      blinds: [
        { kind: 'small', boss: 'SmallBlind',
          shop: [
            { kind: 'Joker', name: 'Joker', hits: [] },
            { kind: 'Joker', name: 'GreedyJoker', hits: [] },
            { kind: 'Joker', name: 'Blueprint', edition: 'Foil', hits: ['m1', 's1'] },
            { kind: 'Tarot', name: 'TheFool', hits: [] },
            { kind: 'Tarot', name: 'TheEmpress', hits: [] },
            { kind: 'Joker', name: 'JollyJoker', hits: [] },
          ],
          packs: [{ kind: 'ArcanaPack', contents: [
            { kind: 'Tarot', name: 'TheMagician', hits: [] },
            { kind: 'Tarot', name: 'TheHighPriestess', hits: [] },
            { kind: 'Tarot', name: 'TheEmperor', hits: [] },
          ] }],
        },
        { kind: 'big', boss: 'BigBlind',
          shop: [
            { kind: 'Joker', name: 'WrathfulJoker', hits: [] },
            { kind: 'Joker', name: 'ZanyJoker', hits: [] },
            { kind: 'Tarot', name: 'TheLovers', hits: [] },
            { kind: 'Joker', name: 'GrosMichel', hits: [] },
            { kind: 'Joker', name: 'EvenSteven', hits: [] },
            { kind: 'Joker', name: 'OddTodd', hits: [] },
          ],
          packs: [{ kind: 'BuffoonPack', contents: [
            { kind: 'Joker', name: 'Brainstorm', hits: ['s2'] },
            { kind: 'Joker', name: 'Fibonacci', hits: [] },
          ] }],
        },
        { kind: 'boss', boss: 'TheOx',
          shop: [
            { kind: 'Voucher', name: 'Telescope', hits: ['s3'] },
            { kind: 'Joker', name: 'Scholar', hits: [] },
            { kind: 'Joker', name: 'Supernova', hits: [] },
            { kind: 'Tarot', name: 'TheHierophant', hits: [] },
            { kind: 'Joker', name: 'Ceremonial', hits: [] },
            { kind: 'Joker', name: 'Banner', hits: [] },
          ],
          packs: [{ kind: 'StandardPack', contents: [] }],
        },
      ],
    },

    // Ante 2
    {
      ante: 2,
      voucher: { name: 'ClearanceSale', hits: [] },
      tags: [{ name: 'TopUpTag', hits: [] }, { name: 'FoilTag', hits: [] }],
      blinds: [
        { kind: 'small', boss: 'SmallBlind',
          shop: [
            { kind: 'Joker', name: 'Joker', hits: [] },
            { kind: 'Joker', name: 'MadJoker', hits: [] },
            { kind: 'Joker', name: 'CrazyJoker', hits: [] },
            { kind: 'Tarot', name: 'Strength', hits: [] },
            { kind: 'Joker', name: 'DrollJoker', hits: [] },
            { kind: 'Joker', name: 'HalfJoker', hits: [] },
          ],
          packs: [{ kind: 'CelestialPack', contents: [] }],
        },
        { kind: 'big', boss: 'BigBlind',
          shop: [
            { kind: 'Joker', name: 'Blueprint', edition: 'Holographic', hits: ['m1', 's1'] },
            { kind: 'Joker', name: 'SlyJoker', hits: [] },
            { kind: 'Tarot', name: 'TheHermit', hits: [] },
            { kind: 'Joker', name: 'WilyJoker', hits: [] },
            { kind: 'Joker', name: 'CleverJoker', hits: [] },
            { kind: 'Joker', name: 'DeviousJoker', hits: [] },
          ],
          packs: [{ kind: 'MegaArcanaPack', contents: [
            { kind: 'Tarot', name: 'Justice', hits: [] },
            { kind: 'Tarot', name: 'Death', hits: [] },
            { kind: 'Tarot', name: 'Temperance', hits: [] },
            { kind: 'Tarot', name: 'TheDevil', hits: [] },
            { kind: 'Tarot', name: 'TheTower', hits: [] },
          ] }],
        },
        { kind: 'boss', boss: 'TheHouse',
          shop: [
            { kind: 'Joker', name: 'Brainstorm', edition: 'Polychrome', hits: ['s2'] },
            { kind: 'Joker', name: 'Banner', hits: [] },
            { kind: 'Joker', name: 'MysticSummit', hits: [] },
            { kind: 'Joker', name: 'MarbleJoker', hits: [] },
            { kind: 'Joker', name: 'LoyaltyCard', hits: [] },
            { kind: 'Joker', name: 'EightBall', hits: [] },
          ],
          packs: [{ kind: 'SpectralPack', contents: [] }],
        },
      ],
    },

    // Ante 3
    {
      ante: 3,
      voucher: null,
      tags: [{ name: 'HolographicTag', hits: [] }, { name: 'NegativeTag', hits: [] }],
      blinds: [
        { kind: 'small', boss: 'SmallBlind',
          shop: [
            { kind: 'Joker', name: 'Brainstorm', edition: 'Foil', hits: ['s2'] },
            { kind: 'Joker', name: 'Misprint', hits: [] },
            { kind: 'Tarot', name: 'TheStar', hits: [] },
            { kind: 'Joker', name: 'RaisedFist', hits: [] },
            { kind: 'Joker', name: 'Chaos', hits: [] },
            { kind: 'Joker', name: 'Fibonacci', hits: [] },
          ],
          packs: [{ kind: 'ArcanaPack', contents: [] }],
        },
        { kind: 'big', boss: 'BigBlind',
          shop: [
            { kind: 'Joker', name: 'SteelJoker', hits: [] },
            { kind: 'Joker', name: 'ScaryFace', hits: [] },
            { kind: 'Joker', name: 'AbstractJoker', hits: [] },
            { kind: 'Joker', name: 'DelayedGratification', hits: [] },
            { kind: 'Joker', name: 'Pareidolia', hits: [] },
            { kind: 'Joker', name: 'Hack', hits: [] },
          ],
          packs: [{ kind: 'JumboBuffoonPack', contents: [
            { kind: 'Joker', name: 'Blueprint', hits: ['m1', 's1'] },
            { kind: 'Joker', name: 'Cartomancer', hits: [] },
            { kind: 'Joker', name: 'Astronomer', hits: [] },
          ] }],
        },
        { kind: 'boss', boss: 'TheClub',
          shop: [
            { kind: 'Joker', name: 'Gros Michel', hits: [] },
            { kind: 'Joker', name: 'EvenSteven', hits: [] },
            { kind: 'Joker', name: 'OddTodd', hits: [] },
            { kind: 'Joker', name: 'Scholar', hits: [] },
            { kind: 'Joker', name: 'BusinessCard', hits: [] },
            { kind: 'Joker', name: 'Supernova', hits: [] },
          ],
          packs: [{ kind: 'StandardPack', contents: [] }],
        },
      ],
    },
  ],
};

// Two more placeholder seeds so the horizontal swipe has somewhere to go.
const seed2 = { ...seed1, seed: 'ALEPH999', score: { total: 4, perClause: { s1: 2, s2: 1, s3: 1, m1: 2 } } };
const seed3 = { ...seed1, seed: 'BETAZERO', score: { total: 6, perClause: { s1: 3, s2: 2, s3: 1, m1: 3 } } };

window.MOCK_SEEDS = [seed1, seed2, seed3];
