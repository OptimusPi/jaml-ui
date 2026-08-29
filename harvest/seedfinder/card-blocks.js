/**
 * card-blocks.js — the ante view as DATA.
 *
 * Every row of the Jamlyze ante view becomes an ordered array of serializable
 * block objects ("where does this card come from" as a first-class answer).
 * Pure functions, no React, no imports — safe to run in Node for future
 * server-side share links / OG cards.
 */

/** Block type identifiers. */
export const BLOCK_TYPES = Object.freeze({
  META: "meta",
  SOULS: "souls",
  LEGENDARY_STREAM: "legendaryStream",
  SHOP: "shop",
  PACK: "pack",
});

/**
 * @typedef {Object} ItemRef
 * @property {string} name
 * @property {string} [type]
 */

/**
 * @typedef {Object} MetaBlock
 * @property {"meta"} type
 * @property {string|null} boss
 * @property {string|null} voucher
 * @property {string|null} smallBlindTag
 * @property {string|null} bigBlindTag
 */

/**
 * @typedef {Object} SoulEntry
 * @property {string} pack        pack name where TheSoul appeared
 * @property {number} packIndex   0-based pack slot
 * @property {number} cardIndex   0-based card position inside the pack
 * @property {string|null} yield  legendary name this Soul yields (legendaries[k])
 */

/**
 * @typedef {Object} SoulsBlock
 * @property {"souls"} type
 * @property {SoulEntry[]} entries
 */

/**
 * @typedef {Object} LegendaryStreamItem
 * @property {string} name
 * @property {number} position  1-based pull order
 */

/**
 * @typedef {Object} LegendaryStreamBlock
 * @property {"legendaryStream"} type
 * @property {LegendaryStreamItem[]} items
 */

/**
 * @typedef {Object} ShopBlock
 * @property {"shop"} type
 * @property {ItemRef[]} items
 */

/**
 * @typedef {Object} PackBlock
 * @property {"pack"} type
 * @property {string} name
 * @property {number} pick  how many cards you may take (Mega → 2, else 1)
 * @property {number} of    total cards offered (items.length)
 * @property {ItemRef[]} items
 */

/**
 * @typedef {MetaBlock|SoulsBlock|LegendaryStreamBlock|ShopBlock|PackBlock} AnteBlock
 */

/** Balatro booster rule: name containing "Mega" → pick 2, otherwise pick 1. */
export function packPickCount(packName) {
  return /mega/i.test(String(packName || "")) ? 2 : 1;
}

/**
 * Convert one ante record (as mapped by SeedLab.jsx) into an ordered array
 * of render blocks. Empty sections are omitted, except meta which is only
 * included when it has at least one non-null field.
 *
 * @param {Object} ante
 * @param {number} ante.ante
 * @param {string|null} ante.boss
 * @param {string|null} ante.voucher
 * @param {string|null} ante.smallBlindTag
 * @param {string|null} ante.bigBlindTag
 * @param {ItemRef[]} [ante.shop]
 * @param {{name:string, items:ItemRef[]}[]} [ante.packs]
 * @param {ItemRef[]} [ante.legendaries]
 * @param {{pack:string, packIndex:number, cardIndex:number}[]} [ante.souls]
 * @returns {AnteBlock[]}
 */
export function anteToBlocks(ante) {
  if (!ante) return [];
  const blocks = [];
  const legendaries = ante.legendaries || [];
  const souls = ante.souls || [];
  const shop = ante.shop || [];
  const packs = ante.packs || [];

  if (ante.boss || ante.voucher || ante.smallBlindTag || ante.bigBlindTag) {
    blocks.push({
      type: BLOCK_TYPES.META,
      boss: ante.boss || null,
      voucher: ante.voucher || null,
      smallBlindTag: ante.smallBlindTag || null,
      bigBlindTag: ante.bigBlindTag || null,
    });
  }

  if (souls.length) {
    blocks.push({
      type: BLOCK_TYPES.SOULS,
      entries: souls.map((s, k) => ({
        pack: s.pack,
        packIndex: s.packIndex,
        cardIndex: s.cardIndex,
        yield: legendaries[k] ? legendaries[k].name : null,
      })),
    });
  }

  if (legendaries.length) {
    blocks.push({
      type: BLOCK_TYPES.LEGENDARY_STREAM,
      items: legendaries.map((l, i) => ({ name: l.name, position: i + 1 })),
    });
  }

  if (shop.length) {
    blocks.push({
      type: BLOCK_TYPES.SHOP,
      items: shop.map((it) => ({ name: it.name, type: it.type })),
    });
  }

  for (const p of packs) {
    if (!p || !p.items || !p.items.length) continue;
    blocks.push({
      type: BLOCK_TYPES.PACK,
      name: p.name || "Pack",
      pick: packPickCount(p.name),
      of: p.items.length,
      items: p.items.map((it) => ({ name: it.name, type: it.type })),
    });
  }

  return blocks;
}
