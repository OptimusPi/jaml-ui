import { parseJamlDocument } from "./jaml.js";
import { Vocab } from "jaml-lang";
import { RARITY_DATA } from "./rarityData.generated.js";

// Static rarity estimator for JAML seed filters.
//
// Answers "is this filter a 1-in-a-thousand or a 1-in-a-billion ask?" from
// the filter text alone — no search, no engine boot. Every game number comes
// from rarityData.generated.ts (file:line-cited corpus data, v1.0.1o-FULL);
// every engine-behaviour assumption was verified empirically against
// motely-wasm 25.1.0:
//   - bare `tag:` matches EITHER blind's skip tag (union of both draws);
//     smallBlindTag/bigBlindTag are blind-exclusive.
//   - `sources.shopItems` indexes the MIXED per-ante shop queue (jokers,
//     tarots, planets interleaved), not a per-type stream.
//   - a key omitted inside an explicit `sources:` block means EMPTY, not
//     default; defaults (shopItems 0-7 + boosterPacks 0-5) apply only when
//     the whole block is absent.
//   - must clauses are an order-invariant conjunction.
//
// Model: each clause's expected hit count λ is summed over its sources and
// ante window, then P(clause) = P(Poisson(λ) ≥ min) — for min 1 that is the
// familiar 1-(1-p)^n shape. The combined figure multiplies must/mustNot
// clause probabilities as if independent, which they are not (shared queues,
// no-repeat boss rule, resample streams), so it carries an explicit ±10x
// error band. Per the handoff spec, throughput is NEVER hardcoded: ETA
// helpers take a caller-benchmarked seeds/second (browser SIMD128 and native
// AVX-512 differ by orders of magnitude — measure a real batch first).

const D = RARITY_DATA;

export type RarityClauseKind = "must" | "should" | "mustNot";
export type RaritySeverity = "error" | "warn" | "flag" | "info";

export interface RarityFlag {
  id: string;
  severity: RaritySeverity;
  reason: string;
}

export interface ClauseRarityEstimate {
  kind: RarityClauseKind;
  /** Engine discriminator as written (e.g. "legendaryJoker"). */
  discriminator: string;
  names: string[];
  /** Ante window used for the estimate (defaulted to 1-8 when unspecified). */
  antes: number[];
  label: string;
  /** Probability a uniformly random seed satisfies this clause. */
  pPerSeed: number;
  /** 1 / pPerSeed; null when the clause is certain or impossible. */
  oneIn: number | null;
  /** Expected hit count per seed before the ≥min tail (diagnostic). */
  lambda: number;
  flags: RarityFlag[];
  /** One-line description of the math used, for UI tooltips. */
  model: string;
  raw: Record<string, unknown>;
}

export interface JamlRarityEstimate {
  deck?: string;
  stake?: string;
  clauses: ClauseRarityEstimate[];
  combined: {
    /** Naive product over must/mustNot clauses (should clauses rank, not gate). */
    pPerSeed: number;
    oneIn: number | null;
    /** The independence assumption is coarse — treat oneIn as an order of magnitude. */
    errorBand: "±10x";
    /** pPerSeed × the 35^8 length-8 keyspace motely-wasm batches cover. */
    expectedMatchesLength8: number;
  };
  flags: RarityFlag[];
}

// ---------------------------------------------------------------------------
// Derived constants (computed from the data table, never retyped)

const PACKS = D.packs.kinds;
const PACK_WEIGHT_DENOM = D.packs.totalShopSlotWeight;

type PackKind = keyof typeof PACKS;

/** Expected cards of a kind revealed per booster-pack slot (all sizes weighted). */
function cardsPerPackSlot(kind: PackKind): number {
  const s = PACKS[kind].sizes;
  return (
    (s.normal.shopSlotWeight * s.normal.cardsShown +
      s.jumbo.shopSlotWeight * s.jumbo.cardsShown +
      s.mega.shopSlotWeight * s.mega.cardsShown) /
    PACK_WEIGHT_DENOM
  );
}

/** Expected pack offers of a kind per booster-pack slot. */
function packsPerSlot(kind: PackKind): number {
  const s = PACKS[kind].sizes;
  return (s.normal.shopSlotWeight + s.jumbo.shopSlotWeight + s.mega.shopSlotWeight) / PACK_WEIGHT_DENOM;
}

/** Average cards shown per offered pack of a kind. */
function cardsPerPack(kind: PackKind): number {
  return cardsPerPackSlot(kind) / packsPerSlot(kind);
}

// Default source windows when a clause has no `sources:` block at all
// (verified engine defaults for jokers; assumed analogous elsewhere).
const DEFAULT_SHOP_ITEMS = 8; // shopItems [0-7] — mixed shop queue positions per ante
const DEFAULT_PACK_SLOTS = 6; // boosterPacks [0-5] — 2 packs × 3 shops per ante
const DEFAULT_ANTES = [1, 2, 3, 4, 5, 6, 7, 8];

/** Per-slot type share of the mixed shop card queue, deck-aware. */
function shopTypeShares(deck?: string): { joker: number; tarot: number; planet: number; spectral: number } {
  const dk = (deck ?? "").toLowerCase();
  const w = { joker: 20, tarot: 4, planet: 4, spectral: 0 };
  if (dk.includes("ghost")) w.spectral = D.deckModifiers.Ghost.spectralShopWeight;
  if (dk.includes("zodiac")) {
    w.tarot = D.deckModifiers.Zodiac.tarotWeight;
    w.planet = D.deckModifiers.Zodiac.planetWeight;
  }
  const denom = w.joker + w.tarot + w.planet + w.spectral;
  return { joker: w.joker / denom, tarot: w.tarot / denom, planet: w.planet / denom, spectral: w.spectral / denom };
}

// ---------------------------------------------------------------------------
// Joker rarity membership — straight from jaml-lang's engine-generated vocab
// (same source JokerPicker uses), so classification can never drift.

const normalizeKey = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const keySet = (names: readonly string[]): Set<string> => new Set(names.map(normalizeKey));

const COMMON_KEYS = keySet(Vocab.Enums.MotelyJokerCommon);
const UNCOMMON_KEYS = keySet(Vocab.Enums.MotelyJokerUncommon);
const RARE_KEYS = keySet(Vocab.Enums.MotelyJokerRare);
const LEGENDARY_KEYS = new Set(
  Vocab.Enums.MotelyJoker.map(normalizeKey).filter(
    (k) => !COMMON_KEYS.has(k) && !UNCOMMON_KEYS.has(k) && !RARE_KEYS.has(k),
  ),
);

type JokerRarityName = "common" | "uncommon" | "rare" | "legendary";

function jokerRarityOf(name: string): JokerRarityName {
  const key = normalizeKey(name);
  if (LEGENDARY_KEYS.has(key)) return "legendary";
  if (RARE_KEYS.has(key)) return "rare";
  if (UNCOMMON_KEYS.has(key)) return "uncommon";
  return "common";
}

/** P(one shop-rarity joker roll yields this specific joker). */
function specificJokerShare(name: string): number {
  const rarity = jokerRarityOf(name);
  if (rarity === "legendary") return 0; // never in shop/buffoon rolls
  const share = D.shop.jokerRarity[rarity];
  const pool = D.pools.jokers.byRarity[rarity];
  return share / pool;
}

// ---------------------------------------------------------------------------
// Math helpers

/** P(Poisson(λ) ≥ min). For min=1 this is 1-e^-λ ≈ 1-(1-p)^n. */
function poissonAtLeast(lambda: number, min: number): number {
  if (lambda <= 0) return 0;
  if (min <= 0) return 1;
  let term = Math.exp(-lambda); // k = 0
  let below = term;
  for (let k = 1; k < min; k++) {
    term *= lambda / k;
    below += term;
  }
  const p = 1 - below;
  if (p >= 1e-12) return Math.min(1, p);
  // The direct sum underflows for deep tails (large min, small λ). The
  // leading tail term in log space keeps astronomically-rare distinct from
  // impossible: ln P(X=min) = -λ + min·lnλ − ln(min!).
  let lnFactorial = 0;
  for (let k = 2; k <= min; k++) lnFactorial += Math.log(k);
  return Math.exp(-lambda + min * Math.log(lambda) - lnFactorial);
}

function isAnyName(name: string): boolean {
  return normalizeKey(name) === "any";
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((n): n is number => typeof n === "number").map((n) => Math.floor(n));
}

function toNameArray(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.filter((v): v is string => typeof v === "string" && v.trim() !== "");
}

// ---------------------------------------------------------------------------
// Clause extraction (engine discriminators, not the UI-highlight dialect)

const ENGINE_DISCRIMINATORS = [
  "legendaryJoker",
  "joker",
  "voucher",
  "boss",
  "tag",
  "smallBlindTag",
  "bigBlindTag",
  "tarotCard",
  "spectralCard",
  "planetCard",
  "standardCard",
  "erraticRank",
  "erraticSuit",
  "erraticCard",
] as const;

type EngineDiscriminator = (typeof ENGINE_DISCRIMINATORS)[number];

interface RawClause {
  kind: RarityClauseKind;
  discriminator: EngineDiscriminator;
  names: string[];
  antes: number[];
  anteFlags: RarityFlag[];
  min: number;
  sources?: Record<string, unknown>;
  raw: Record<string, unknown>;
  label: string;
}

function extractClauses(kind: RarityClauseKind, list: unknown): RawClause[] {
  if (!Array.isArray(list)) return [];
  const out: RawClause[] = [];
  for (const entry of list) {
    if (entry === null || typeof entry !== "object") continue;
    const raw = entry as Record<string, unknown>;
    const discriminator = ENGINE_DISCRIMINATORS.find((k) => k in raw);
    if (!discriminator) continue;
    const names = toNameArray(raw[discriminator]);
    const anteFlags: RarityFlag[] = [];
    let antes = toNumberArray(raw.antes ?? raw.ante);
    if (antes.length === 0) antes = DEFAULT_ANTES;
    const inRange = antes.filter((a) => a >= 0 && a <= 39);
    if (inRange.length !== antes.length) {
      anteFlags.push({
        id: "ante-out-of-range",
        severity: "warn",
        reason: "Antes outside 0-39 dropped from the estimate (ante 0 is real via Hieroglyph; 39 overflows).",
      });
    }
    const min = typeof raw.min === "number" && raw.min > 0 ? Math.floor(raw.min) : 1;
    const label =
      typeof raw.label === "string" && raw.label.trim()
        ? raw.label
        : `${discriminator}: ${names.join(", ") || "(bare)"}`;
    out.push({
      kind,
      discriminator,
      names,
      antes: inRange.length > 0 ? inRange : antes.length > 0 ? [] : DEFAULT_ANTES,
      anteFlags,
      min,
      sources: raw.sources && typeof raw.sources === "object" ? (raw.sources as Record<string, unknown>) : undefined,
      raw,
      label,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-discriminator λ models (expected hits per seed)

interface LambdaResult {
  lambda: number;
  flags: RarityFlag[];
  model: string;
}

function sourceLen(sources: Record<string, unknown> | undefined, key: string, fallback: number): number {
  if (!sources) return fallback;
  const v = sources[key];
  // Inside an explicit sources block an omitted key means EMPTY (verified).
  return Array.isArray(v) ? v.length : 0;
}

function editionMultiplier(raw: Record<string, unknown>, flags: RarityFlag[]): number {
  const edition = typeof raw.edition === "string" ? normalizeKey(raw.edition) : undefined;
  if (!edition) return 1;
  const base = D.shop.jokerEditions.base;
  if (edition === "any") return base.foil + base.holographic + base.polychrome + base.negative;
  if (edition in base) return base[edition as keyof typeof base];
  flags.push({ id: "unknown-edition", severity: "flag", reason: `Edition '${raw.edition as string}' not modeled; ignored.` });
  return 1;
}

function jokerLambda(c: RawClause, deck?: string): LambdaResult {
  const flags: RarityFlag[] = [];
  const shares = shopTypeShares(deck);
  const legendaries = c.names.filter((n) => jokerRarityOf(n) === "legendary" && !isAnyName(n));
  if (legendaries.length > 0) {
    flags.push({
      id: "legendary-under-joker-discriminator",
      severity: "warn",
      reason: `${legendaries.join(", ")} never appears in shops or Buffoon packs — use legendaryJoker: with arcanaPacks/spectralPacks sources.`,
    });
  }
  const perRoll = c.names.some(isAnyName)
    ? 1
    : c.names.reduce((sum, n) => sum + specificJokerShare(n), 0);
  const edition = editionMultiplier(c.raw, flags);
  const nShop = sourceLen(c.sources, "shopItems", DEFAULT_SHOP_ITEMS);
  const nPackSlots = sourceLen(c.sources, "boosterPacks", DEFAULT_PACK_SLOTS);
  const unmodeled = c.sources
    ? Object.keys(c.sources).filter((k) => k !== "shopItems" && k !== "boosterPacks")
    : [];
  if (unmodeled.length > 0) {
    flags.push({
      id: "unmodeled-sources",
      severity: "flag",
      reason: `Source keys not modeled (estimate may be low): ${unmodeled.join(", ")}.`,
    });
  }
  const perAnte =
    nShop * shares.joker * perRoll * edition +
    nPackSlots * cardsPerPackSlot("Buffoon") * perRoll * edition;
  return {
    lambda: perAnte * c.antes.length,
    flags,
    model: `${nShop} mixed shop-queue draws + ~${(nPackSlots * cardsPerPackSlot("Buffoon")).toFixed(2)} Buffoon-pack cards per ante × ${c.antes.length} antes; rarity-weighted pool share per roll.`,
  };
}

function legendaryLambda(c: RawClause): LambdaResult {
  const flags: RarityFlag[] = [];
  const soulPerCard = D.packs.soul.chancePerCardSlot;
  const identityShare = c.names.some(isAnyName) || c.names.length === 0
    ? 1
    : c.names.length / D.pools.jokers.byRarity.legendary;
  if (c.sources && "shopItems" in c.sources) {
    return {
      lambda: 0,
      flags: [
        {
          id: "legendary-with-shop-only-sources",
          severity: "error",
          reason: "shopItems is not a valid legendaryJoker source (engine rejects it); legendaries come only from The Soul in Arcana/Spectral packs.",
        },
      ],
      model: "unsatisfiable: legendary joker with shop sources",
    };
  }
  // Pack-position lists cover min(len, expected offered packs) of that kind.
  const coveredCards = (kind: PackKind, positions: number): number =>
    Math.min(positions, packsPerSlot(kind) * DEFAULT_PACK_SLOTS) * cardsPerPack(kind);
  let cardsPerAnte: number;
  if (!c.sources) {
    cardsPerAnte = DEFAULT_PACK_SLOTS * (cardsPerPackSlot("Arcana") + cardsPerPackSlot("Spectral"));
  } else {
    const nArc = sourceLen(c.sources, "arcanaPacks", 0);
    const nSpe = sourceLen(c.sources, "spectralPacks", 0);
    const nBoo = sourceLen(c.sources, "boosterPacks", 0);
    cardsPerAnte = coveredCards("Arcana", nArc) + coveredCards("Spectral", nSpe);
    if (nBoo > 0) {
      // boosterPacks for legendaryJoker: treat as generic pack positions over both soul-bearing kinds.
      cardsPerAnte += coveredCards("Arcana", nBoo) + coveredCards("Spectral", nBoo);
      flags.push({ id: "unmodeled-sources", severity: "flag", reason: "boosterPacks on legendaryJoker approximated as Arcana+Spectral positions." });
    }
    if (cardsPerAnte === 0 && "soulCard" in c.sources) {
      cardsPerAnte = DEFAULT_PACK_SLOTS * (cardsPerPackSlot("Arcana") + cardsPerPackSlot("Spectral"));
    }
    if (cardsPerAnte === 0) {
      flags.push({
        id: "legendary-with-shop-only-sources",
        severity: "error",
        reason: "Explicit sources block lists no arcanaPacks/spectralPacks/soulCard — an omitted key means empty, so no Soul can ever be seen.",
      });
    }
  }
  return {
    lambda: cardsPerAnte * soulPerCard * identityShare * c.antes.length,
    flags,
    model: `~${cardsPerAnte.toFixed(2)} Arcana/Spectral pack cards per ante × ${c.antes.length} antes × ${soulPerCard} Soul chance × identity ${identityShare === 1 ? "any" : `${c.names.length}/5`}.`,
  };
}

const UPGRADED_VOUCHERS = keySet(D.pools.vouchers.pairs.map((p) => p.upgraded));

function voucherLambda(c: RawClause): LambdaResult {
  const flags: RarityFlag[] = [];
  let perAnte = 0;
  for (const name of c.names) {
    if (UPGRADED_VOUCHERS.has(normalizeKey(name))) {
      flags.push({
        id: "upgraded-voucher-conditional",
        severity: "flag",
        reason: `${name} only enters the pool after its base voucher is redeemed (a player decision); estimated as 1/${D.pools.vouchers.count}.`,
      });
      perAnte += 1 / D.pools.vouchers.count;
    } else {
      perAnte += 1 / D.pools.vouchers.baseCount;
    }
  }
  return {
    lambda: perAnte * c.antes.length,
    flags,
    model: `1 voucher slot per ante × ${c.antes.length} antes; uniform over the ${D.pools.vouchers.baseCount} base vouchers.`,
  };
}

const FINISHER_KEYS = keySet(D.pools.bosses.finishers);
const FINISHER_ANTES = new Set<number>(D.pools.bosses.finisherAntes);

function bossLambda(c: RawClause): LambdaResult {
  const flags: RarityFlag[] = [];
  let lambda = 0;
  const finisherNames = c.names.filter((n) => FINISHER_KEYS.has(normalizeKey(n)));
  const regularNames = c.names.filter((n) => !FINISHER_KEYS.has(normalizeKey(n)));
  const regularAntes = c.antes.filter((a) => !FINISHER_ANTES.has(a));
  const finisherAntes = c.antes.filter((a) => FINISHER_ANTES.has(a));
  if (finisherNames.length > 0) {
    if (finisherAntes.length === 0) {
      flags.push({
        id: "finisher-boss-before-ante-8",
        severity: "error",
        reason: `${finisherNames.join(", ")} only appears on antes 8/16/24/32 — none are in this clause's window.`,
      });
    }
    lambda += finisherAntes.length * (finisherNames.length / D.pools.bosses.finisherCount);
  }
  if (regularNames.length > 0) {
    let satisfiableSomewhere = false;
    for (const ante of regularAntes) {
      const pool = D.pools.bosses.regular.filter((b) => b.minAnte <= ante);
      const eligible = regularNames.filter((n) =>
        pool.some((b) => normalizeKey(b.name) === normalizeKey(n)),
      );
      if (eligible.length > 0) satisfiableSomewhere = true;
      if (pool.length > 0) lambda += eligible.length / pool.length;
    }
    if (!satisfiableSomewhere) {
      flags.push({
        id: "regular-boss-below-min-ante",
        severity: "error",
        reason: `${regularNames.join(", ")} cannot appear in any ante of this window (min-ante gating; antes 8/16/24/32 always roll a finisher).`,
      });
    }
  }
  return {
    lambda,
    flags,
    model: `1 boss per ante; regular bosses uniform over the min-ante-eligible pool, finishers uniform over 5 on antes 8/16/24/32 (no-repeat rule ignored).`,
  };
}

const ANTE1_EXCLUDED_TAGS = keySet(D.tags.cannotSpawnAnte1);

function tagLambda(c: RawClause): LambdaResult {
  const flags: RarityFlag[] = [];
  const drawsPerAnte = c.discriminator === "tag" ? 2 : 1;
  let lambda = 0;
  let satisfiableSomewhere = false;
  for (const ante of c.antes) {
    if (ante < 1) continue; // ante 0 has no skippable blinds
    const pool = ante === 1 ? D.tags.count - D.tags.cannotSpawnAnte1Count : D.tags.count;
    const eligible = c.names.filter(
      (n) => isAnyName(n) || ante >= 2 || !ANTE1_EXCLUDED_TAGS.has(normalizeKey(n)),
    );
    if (eligible.length > 0) satisfiableSomewhere = true;
    const perDraw = eligible.some(isAnyName) ? 1 : eligible.length / pool;
    lambda += drawsPerAnte * perDraw;
  }
  if (!satisfiableSomewhere && c.names.length > 0) {
    const anteZeroOnly = c.antes.every((a) => a < 1);
    flags.push({
      id: "ante1-excluded-tag-gated-to-ante-1",
      severity: "error",
      reason: anteZeroOnly
        ? "Ante 0 grants no skip tags — there are no skippable blinds before ante 1."
        : `${c.names.join(", ")} cannot spawn in ante 1 (and ante 0 grants no tags) — the window never reaches ante 2.`,
    });
  }
  const blindNote =
    c.discriminator === "tag"
      ? "bare tag: matches EITHER blind (2 draws per ante, verified union semantics)"
      : `${c.discriminator} is blind-exclusive (1 draw per ante)`;
  return { lambda, flags, model: `${blindNote}; uniform over the per-ante tag pool (15 in ante 1, 24 after).` };
}

function tarotLambda(c: RawClause, deck?: string): LambdaResult {
  const shares = shopTypeShares(deck);
  const perName = c.names.some(isAnyName) || c.names.length === 0 ? 1 : c.names.length / D.pools.tarot.count;
  const nShop = sourceLen(c.sources, "shopItems", DEFAULT_SHOP_ITEMS);
  const nPackSlots = sourceLen(c.sources, "boosterPacks", DEFAULT_PACK_SLOTS);
  const perAnte = nShop * shares.tarot * perName + nPackSlots * cardsPerPackSlot("Arcana") * perName;
  return {
    lambda: perAnte * c.antes.length,
    flags: [],
    model: `${nShop} shop draws (tarot share ${(shares.tarot * 100).toFixed(1)}%) + ~${(nPackSlots * cardsPerPackSlot("Arcana")).toFixed(2)} Arcana cards per ante × ${c.antes.length} antes; uniform over ${D.pools.tarot.count} tarots.`,
  };
}

const SECRET_PLANETS = keySet(D.pools.planet.secret);

function planetLambda(c: RawClause, deck?: string): LambdaResult {
  const flags: RarityFlag[] = [];
  const shares = shopTypeShares(deck);
  const secrets = c.names.filter((n) => SECRET_PLANETS.has(normalizeKey(n)));
  if (secrets.length > 0) {
    flags.push({
      id: "secret-planet-precondition",
      severity: "flag",
      reason: `${secrets.join(", ")} only spawns after its secret hand has been played that run — a player decision the seed alone does not determine.`,
    });
  }
  // Secrets resample away until unlocked, so the live pool is the 9 non-secret
  // planets; secret names are estimated against the full 12 and flagged.
  const perName =
    c.names.some(isAnyName) || c.names.length === 0
      ? 1
      : c.names.reduce(
          (sum, n) =>
            sum + (SECRET_PLANETS.has(normalizeKey(n)) ? 1 / D.pools.planet.count : 1 / D.pools.planet.nonSecretCount),
          0,
        );
  const nShop = sourceLen(c.sources, "shopItems", DEFAULT_SHOP_ITEMS);
  const nPackSlots = sourceLen(c.sources, "boosterPacks", DEFAULT_PACK_SLOTS);
  const perAnte = nShop * shares.planet * perName + nPackSlots * cardsPerPackSlot("Celestial") * perName;
  return {
    lambda: perAnte * c.antes.length,
    flags,
    model: `${nShop} shop draws (planet share ${(shares.planet * 100).toFixed(1)}%) + ~${(nPackSlots * cardsPerPackSlot("Celestial")).toFixed(2)} Celestial cards per ante × ${c.antes.length} antes; uniform over the ${D.pools.planet.nonSecretCount} live planets.`,
  };
}

function spectralLambda(c: RawClause, deck?: string): LambdaResult {
  const flags: RarityFlag[] = [];
  const shares = shopTypeShares(deck);
  const nShop = sourceLen(c.sources, "shopItems", DEFAULT_SHOP_ITEMS);
  const nPackSlots = sourceLen(c.sources, "boosterPacks", DEFAULT_PACK_SLOTS);
  const soulLike = c.names.filter((n) => {
    const k = normalizeKey(n);
    return k === "thesoul" || k === "soul" || k === "blackhole";
  });
  let lambda = 0;
  if (soulLike.length > 0) {
    // Soul: Arcana+Spectral card slots; Black Hole: Celestial+Spectral. Both 0.3%/card.
    for (const n of soulLike) {
      const k = normalizeKey(n);
      const kinds: PackKind[] = k === "blackhole" ? ["Celestial", "Spectral"] : ["Arcana", "Spectral"];
      const cardsPerAnte = nPackSlots * kinds.reduce((s, kind) => s + cardsPerPackSlot(kind), 0);
      lambda += cardsPerAnte * D.packs.soul.chancePerCardSlot * c.antes.length;
    }
  }
  const regular = c.names.filter((n) => !soulLike.includes(n));
  if (regular.length > 0 || c.names.length === 0) {
    const perName =
      regular.some(isAnyName) || c.names.length === 0 ? 1 : regular.length / D.pools.spectral.shopEligibleCount;
    const perAnte =
      nShop * shares.spectral * perName + nPackSlots * cardsPerPackSlot("Spectral") * perName;
    lambda += perAnte * c.antes.length;
    if (shares.spectral === 0 && nShop > 0) {
      flags.push({
        id: "spectral-shop-needs-ghost",
        severity: "info",
        reason: "Spectrals only appear in the shop on Ghost Deck; on this deck the estimate uses pack cards only.",
      });
    }
  }
  const unmodeled = c.sources
    ? Object.keys(c.sources).filter((k) => k !== "shopItems" && k !== "boosterPacks")
    : [];
  if (unmodeled.length > 0) {
    flags.push({ id: "unmodeled-sources", severity: "flag", reason: `Source keys not modeled (estimate may be low): ${unmodeled.join(", ")}.` });
  }
  return {
    lambda,
    flags,
    model: `~${(nPackSlots * cardsPerPackSlot("Spectral")).toFixed(2)} Spectral pack cards per ante${shares.spectral > 0 ? ` + ${nShop} Ghost-Deck shop draws (${(shares.spectral * 100).toFixed(1)}%)` : ""} × ${c.antes.length} antes; Soul/Black Hole at 0.3% per eligible pack card.`,
  };
}

const RANK_COUNT = 13;
const SUIT_COUNT = 4;

function standardCardMatchP(raw: Record<string, unknown>, flags: RarityFlag[]): number {
  let p = 1;
  if (typeof raw.rank === "string" && !isAnyName(raw.rank)) p *= 1 / RANK_COUNT;
  if (typeof raw.suit === "string" && !isAnyName(raw.suit)) p *= 1 / SUIT_COUNT;
  const m = D.shop.standardPackCardModifiers;
  if (typeof raw.enhancement === "string") {
    p *= isAnyName(raw.enhancement) ? m.enhancedChance : m.perEnhancementChance;
  }
  if (typeof raw.seal === "string") {
    p *= isAnyName(raw.seal) ? m.sealedChance : m.perSealChance;
  }
  if (typeof raw.edition === "string") {
    const e = D.shop.playingCardEditions;
    const key = normalizeKey(raw.edition);
    if (key === "any") p *= e.foil + e.holographic + e.polychrome;
    else if (key === "foil") p *= e.foil;
    else if (key === "holographic") p *= e.holographic;
    else if (key === "polychrome") p *= e.polychrome;
    else {
      p *= 0;
      flags.push({ id: "unknown-edition", severity: "warn", reason: `Playing cards cannot roll edition '${raw.edition as string}' in Standard packs.` });
    }
  }
  return p;
}

function standardCardLambda(c: RawClause): LambdaResult {
  const flags: RarityFlag[] = [];
  const nPackSlots = sourceLen(c.sources, "boosterPacks", DEFAULT_PACK_SLOTS);
  const perCard = standardCardMatchP(c.raw, flags);
  const lambda = nPackSlots * cardsPerPackSlot("Standard") * perCard * c.antes.length;
  return {
    lambda,
    flags,
    model: `~${(nPackSlots * cardsPerPackSlot("Standard")).toFixed(2)} Standard-pack cards per ante × ${c.antes.length} antes; per-card match = product of rank/suit/enhancement/edition/seal odds (Magic Trick shop cards not modeled).`,
  };
}

const ERRATIC_DECK_SIZE = 52;

function erraticLambda(c: RawClause, deck?: string): LambdaResult {
  const flags: RarityFlag[] = [];
  if (!(deck ?? "").toLowerCase().includes("erratic")) {
    flags.push({
      id: "erratic-clause-off-erratic-deck",
      severity: "error",
      reason: "erraticRank/erraticSuit/erraticCard only apply to the Erratic Deck's randomized decklist — set deck: Erratic.",
    });
  }
  const perCard =
    c.discriminator === "erraticRank"
      ? 1 / RANK_COUNT
      : c.discriminator === "erraticSuit"
        ? 1 / SUIT_COUNT
        : 1 / (RANK_COUNT * SUIT_COUNT);
  const perName = c.names.some(isAnyName) || c.names.length === 0 ? 1 : c.names.length;
  return {
    lambda: ERRATIC_DECK_SIZE * perCard * perName,
    flags,
    model: `52 independently randomized deck cards × ${perCard.toFixed(4)} per-card chance; min: raises the required copy count.`,
  };
}

function clauseLambda(c: RawClause, deck?: string): LambdaResult {
  switch (c.discriminator) {
    case "joker":
      return jokerLambda(c, deck);
    case "legendaryJoker":
      return legendaryLambda(c);
    case "voucher":
      return voucherLambda(c);
    case "boss":
      return bossLambda(c);
    case "tag":
    case "smallBlindTag":
    case "bigBlindTag":
      return tagLambda(c);
    case "tarotCard":
      return tarotLambda(c, deck);
    case "planetCard":
      return planetLambda(c, deck);
    case "spectralCard":
      return spectralLambda(c, deck);
    case "standardCard":
      return standardCardLambda(c);
    case "erraticRank":
    case "erraticSuit":
    case "erraticCard":
      return erraticLambda(c, deck);
  }
}

// ---------------------------------------------------------------------------
// Public API

export function estimateJamlRarity(jaml: string): JamlRarityEstimate {
  let doc: Record<string, unknown> = {};
  try {
    doc = parseJamlDocument(jaml);
  } catch {
    // Unparseable JAML → no clauses; the engine's validate() owns syntax errors.
  }
  const deck = typeof doc.deck === "string" ? doc.deck : undefined;
  const stake = typeof doc.stake === "string" ? doc.stake : undefined;

  const rawClauses = [
    ...extractClauses("must", doc.must),
    ...extractClauses("should", doc.should),
    ...extractClauses("mustNot", doc.mustNot),
  ];

  const clauses: ClauseRarityEstimate[] = rawClauses.map((c) => {
    const { lambda, flags, model } = clauseLambda(c, deck);
    const allFlags = [...c.anteFlags, ...flags];
    const hasError = allFlags.some((f) => f.severity === "error");
    const pHit = hasError ? 0 : poissonAtLeast(lambda, c.min);
    // mustNot clauses are satisfied when the item is ABSENT.
    const pPerSeed = c.kind === "mustNot" ? (hasError ? 1 : Math.exp(-lambda)) : pHit;
    return {
      kind: c.kind,
      discriminator: c.discriminator,
      names: c.names,
      antes: c.antes,
      label: c.label,
      pPerSeed,
      oneIn: pPerSeed > 0 && pPerSeed < 1 ? 1 / pPerSeed : null,
      lambda,
      flags: allFlags,
      model,
      raw: c.raw,
    };
  });

  const flags: RarityFlag[] = [];
  const stakeKey = normalizeKey(stake ?? "");
  if (["black", "blue", "purple", "orange", "gold"].includes(stakeKey)) {
    flags.push({
      id: "high-stake-stream-shift",
      severity: "info",
      reason: "Black stake and above add sticker rolls to every shop/booster joker, shifting the RNG stream — probabilities are approximate across stakes.",
    });
  }

  // should clauses shape score and ordering; only must/mustNot gate a match.
  const gating = clauses.filter((c) => c.kind !== "should");
  const pPerSeed = gating.reduce((prod, c) => prod * c.pPerSeed, 1);
  for (const c of clauses) {
    for (const f of c.flags) {
      // Errors always bubble; so does any flag on a gating clause it zeroed.
      if (f.severity === "error" || (c.pPerSeed === 0 && c.kind !== "should")) {
        flags.push({ ...f, reason: `${c.label}: ${f.reason}` });
      }
    }
  }

  return {
    deck,
    stake,
    clauses,
    combined: {
      pPerSeed,
      oneIn: pPerSeed > 0 && pPerSeed < 1 ? 1 / pPerSeed : null,
      errorBand: "±10x",
      expectedMatchesLength8: pPerSeed * D.seedSpace.length8Space,
    },
    flags,
  };
}

/** "1 in ~1.8B" style formatting; p=0 renders as unsatisfiable infinity. */
export function formatOneIn(oneIn: number | null): string {
  if (oneIn === null) return "1 in ∞";
  if (!Number.isFinite(oneIn)) return "1 in ∞";
  if (oneIn < 1.5) return "~every seed";
  if (oneIn >= 1e15) return `1 in ~10^${Math.round(Math.log10(oneIn))}`;
  const units: Array<[number, string]> = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [scale, suffix] of units) {
    if (oneIn >= scale) {
      const v = oneIn / scale;
      return `1 in ~${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}${suffix}`;
    }
  }
  return `1 in ~${Math.round(oneIn)}`;
}

/**
 * Expected seconds to find `targetMatches` seeds at a MEASURED throughput.
 * Benchmark seedsPerSecond against a real batch on the target hardware first —
 * browser (WASM SIMD128) and native (AVX-512) rates differ by orders of
 * magnitude, so this module never supplies a default.
 */
export function estimateEtaSeconds(pPerSeed: number, seedsPerSecond: number, targetMatches = 1): number {
  if (pPerSeed <= 0) return Infinity;
  if (seedsPerSecond <= 0) return NaN;
  return targetMatches / pPerSeed / seedsPerSecond;
}

/** "≈3d 4h" / "≈12min" style duration formatting for ETA display. */
export function formatEta(seconds: number): string {
  if (Number.isNaN(seconds)) return "unknown (benchmark first)";
  if (!Number.isFinite(seconds)) return "never (unsatisfiable)";
  if (seconds < 1) return "≈instant";
  if (seconds < 90) return `≈${Math.round(seconds)}s`;
  const minutes = seconds / 60;
  if (minutes < 90) return `≈${Math.round(minutes)}min`;
  const hours = minutes / 60;
  if (hours < 36) return `≈${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 365) return `≈${Math.round(days)}d`;
  const years = days / 365;
  return years > 1000 ? "≈forever" : `≈${Math.round(years)}y`;
}
