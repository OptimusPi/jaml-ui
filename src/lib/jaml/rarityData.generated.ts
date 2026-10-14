// AUTO-GENERATED — do not hand-edit.
//
// Numeric ground truth for the JAML rarity estimator (rarity.ts).
// Generated 2026-08-18 from the seedfinder.app Balatro corpus
// (v1.0.1o-FULL) plus live probes against motely-wasm 25.0.3; the
// `sources` map at the bottom cites a file:line in seedfinder.app for
// every number above it. Where corpus files disagree, both readings are
// kept and `conflict: true` is set.
//
// Regenerate by re-running the rarity research probe against a newer
// corpus/engine and re-emitting this file (gen-rarity-data.mjs in the
// research workspace) — never edit numbers in place.

export const RARITY_DATA = {
  "meta": {
    "generatedAt": "2026-08-18",
    "gameVersion": "1.0.1o-FULL (latest live patch; Update 1.1 announced, unreleased)",
    "purpose": "Numeric data table for the JAML seed-filter rarity estimator. Every number is cited in the parallel `sources` map (file:line into /home/user/seedfinder.app).",
    "engineNamesFrom": "lib/mcp/client/seedlab/catalog.generated.json",
    "caveat": "Where corpus files disagree, both readings are recorded and `conflict: true` is set; see the handoff report for details."
  },
  "pools": {
    "jokers": {
      "total": 150,
      "byRarity": {
        "common": 61,
        "uncommon": 64,
        "rare": 20,
        "legendary": 5
      },
      "legendaryNames": [
        "Canio",
        "Chicot",
        "Perkeo",
        "Triboulet",
        "Yorick"
      ],
      "legendarySourceRule": "Legendary jokers come ONLY from The Soul (arcana/spectral packs); never in shop or Buffoon packs. JAML must use legendaryJoker:, never joker:, with arcanaPacks/spectralPacks sources.",
      "catalogNameCount": 150,
      "catalogNote": "seedlab catalog.generated.json lists 150 joker names (145 regular + the 5 legendaries, which also appear under joker: in corpus filters). Estimator pool math for shop-rarity rolls should use 61/64/20 (145 shop-poolable) and treat legendaries as Soul-only."
    },
    "tarot": {
      "count": 22
    },
    "planet": {
      "count": 12,
      "secret": [
        "PlanetX",
        "Ceres",
        "Eris"
      ],
      "secretCount": 3,
      "secretPreconditions": {
        "PlanetX": "Five of a Kind played this run",
        "Ceres": "Flush House played this run",
        "Eris": "Flush Five played this run"
      },
      "nonSecretCount": 9,
      "fallback": "Pluto"
    },
    "spectral": {
      "count": 18,
      "shopEligibleCount": 16,
      "packOnly": [
        "TheSoul",
        "BlackHole"
      ],
      "shopEligibleEqualWeight": true,
      "fallback": "Incantation",
      "note": "Shop eligibility only matters on Ghost Deck (spectral shop weight 2); on other decks spectrals are pack/joker-generated only."
    },
    "vouchers": {
      "count": 32,
      "baseCount": 16,
      "upgradedCount": 16,
      "pairs": [
        {
          "base": "Overstock",
          "upgraded": "OverstockPlus"
        },
        {
          "base": "ClearanceSale",
          "upgraded": "Liquidation"
        },
        {
          "base": "Hone",
          "upgraded": "GlowUp"
        },
        {
          "base": "RerollSurplus",
          "upgraded": "RerollGlut"
        },
        {
          "base": "CrystalBall",
          "upgraded": "OmenGlobe"
        },
        {
          "base": "Telescope",
          "upgraded": "Observatory"
        },
        {
          "base": "Grabber",
          "upgraded": "NachoTong"
        },
        {
          "base": "Wasteful",
          "upgraded": "Recyclomancy"
        },
        {
          "base": "TarotMerchant",
          "upgraded": "TarotTycoon"
        },
        {
          "base": "PlanetMerchant",
          "upgraded": "PlanetTycoon"
        },
        {
          "base": "SeedMoney",
          "upgraded": "MoneyTree"
        },
        {
          "base": "Blank",
          "upgraded": "Antimatter"
        },
        {
          "base": "MagicTrick",
          "upgraded": "Illusion"
        },
        {
          "base": "Hieroglyph",
          "upgraded": "Petroglyph"
        },
        {
          "base": "DirectorsCut",
          "upgraded": "Retcon"
        },
        {
          "base": "PaintBrush",
          "upgraded": "Palette"
        }
      ],
      "pairingRule": "One voucher slot per shop ($10), restocks after each boss; upgraded voucher only offered after its base is redeemed (base/upgrade ordering respected by the voucher stream).",
      "fallback": "Blank"
    },
    "tags": {
      "count": 24,
      "fallback": "HandyTag"
    },
    "bosses": {
      "regularCount": 23,
      "regular": [
        {
          "name": "TheHook",
          "minAnte": 1
        },
        {
          "name": "TheClub",
          "minAnte": 1
        },
        {
          "name": "TheGoad",
          "minAnte": 1
        },
        {
          "name": "TheHead",
          "minAnte": 1
        },
        {
          "name": "TheWindow",
          "minAnte": 1
        },
        {
          "name": "TheManacle",
          "minAnte": 1
        },
        {
          "name": "ThePsychic",
          "minAnte": 1
        },
        {
          "name": "ThePillar",
          "minAnte": 1
        },
        {
          "name": "TheArm",
          "minAnte": 2
        },
        {
          "name": "TheFish",
          "minAnte": 2
        },
        {
          "name": "TheFlint",
          "minAnte": 2
        },
        {
          "name": "TheHouse",
          "minAnte": 2
        },
        {
          "name": "TheMark",
          "minAnte": 2
        },
        {
          "name": "TheMouth",
          "minAnte": 2
        },
        {
          "name": "TheNeedle",
          "minAnte": 2
        },
        {
          "name": "TheWall",
          "minAnte": 2
        },
        {
          "name": "TheWater",
          "minAnte": 2
        },
        {
          "name": "TheWheel",
          "minAnte": 2
        },
        {
          "name": "TheEye",
          "minAnte": 3
        },
        {
          "name": "TheTooth",
          "minAnte": 3
        },
        {
          "name": "ThePlant",
          "minAnte": 4
        },
        {
          "name": "TheSerpent",
          "minAnte": 5
        },
        {
          "name": "TheOx",
          "minAnte": 6
        }
      ],
      "ante1PoolSize": 8,
      "allRegularAvailableFromAnte": 6,
      "finishers": [
        "AmberAcorn",
        "VerdantLeaf",
        "VioletVessel",
        "CrimsonHeart",
        "CeruleanBell"
      ],
      "finisherCount": 5,
      "finisherAntes": [
        8,
        16,
        24,
        32
      ],
      "noRepeatRule": "A boss cannot reappear until all eligible bosses have appeared once."
    }
  },
  "shop": {
    "cardSlots": {
      "base": 2,
      "overstock": 3,
      "overstockPlus": 4
    },
    "boosterPackSlots": 2,
    "voucherSlots": 1,
    "firstShopGuaranteedNormalBuffoonPack": true,
    "typeWeights": {
      "joker": 20,
      "tarot": 4,
      "planet": 4
    },
    "baseTypeProbabilities": {
      "joker": 0.7143,
      "tarot": 0.1429,
      "planet": 0.1429
    },
    "typeWeightModifiers": {
      "ghostDeckSpectral": 2,
      "magicTrickPlayingCard": 4,
      "tarotMerchantTarotWeight": 9.6,
      "tarotTycoonTarotWeight": 32,
      "planetMerchantPlanetWeight": 9.6,
      "planetTycoonPlanetWeight": 32,
      "note": "Chance per slot = weight / sum(active weights). Merchant vouchers raise their own type's weight and thereby dilute all others (incl. Ghost spectral frequency)."
    },
    "jokerRarity": {
      "common": 0.7,
      "uncommon": 0.25,
      "rare": 0.05,
      "legendary": 0,
      "rollThresholds": {
        "rare": ">0.95",
        "uncommon": ">0.7"
      },
      "appliesTo": "shop and all joker sources (Buffoon packs, Judgement, Riff-Raff, ...)"
    },
    "jokerEditions": {
      "rollThresholds": {
        "negative": ">0.997",
        "polychrome": ">0.994",
        "holographic": ">0.98",
        "foil": ">0.96"
      },
      "base": {
        "foil": 0.02,
        "holographic": 0.014,
        "polychrome": 0.003,
        "negative": 0.003
      },
      "honeGlowUpMultipliers": {
        "conflict": true,
        "mechanicsMdReading": {
          "foil": [
            0.04,
            0.08
          ],
          "holographic": [
            0.028,
            0.056
          ],
          "polychrome": [
            0.006,
            0.012
          ],
          "negative": [
            0.006,
            0.012
          ],
          "rule": "all editions x2 (Hone) / x4 (Glow Up), Negative included"
        },
        "consumablesMdReading": {
          "foil": [
            0.04,
            0.08
          ],
          "holographic": [
            0.028,
            0.056
          ],
          "polychrome": [
            0.009,
            0.021
          ],
          "negative": [
            0.003,
            0.003
          ],
          "rule": "Foil/Holo x2/x4; Polychrome on jokers actually x3/x7; Negative 0.3% unaffected by vouchers"
        },
        "recommendation": "Prefer the consumablesMd reading (more specific, matches community data); flag Hone/GlowUp-modified estimates as approximate."
      }
    },
    "playingCardEditions": {
      "context": "Standard Pack cards (and shop playing cards via Magic Trick base rates)",
      "foil": 0.04,
      "holographic": 0.028,
      "polychrome": 0.012,
      "negative": 0,
      "rollThresholds": {
        "foil": ">0.92",
        "holographic": ">0.96",
        "polychrome": ">0.988"
      },
      "scaledByHoneGlowUp": true
    },
    "standardPackCardModifiers": {
      "enhancedChance": 0.4,
      "perEnhancementChance": 0.05,
      "enhancementCount": 8,
      "sealedChance": 0.2,
      "perSealChance": 0.05,
      "sealCount": 4
    },
    "illusionShopPlayingCards": {
      "enhancedChance": 0.4,
      "editionedChance": 0.2,
      "editionSplit": {
        "foil": 0.1,
        "holographic": 0.07,
        "polychrome": 0.03
      },
      "neverSealed": true,
      "unaffectedByHoneGlowUp": true
    },
    "stickerOddsByStake": {
      "rule": "cumulative: each modifier persists on all higher stakes; rolled per shop/booster joker",
      "white": {},
      "red": {},
      "green": {},
      "black": {
        "eternal": 0.3
      },
      "blue": {
        "eternal": 0.3
      },
      "purple": {
        "eternal": 0.3
      },
      "orange": {
        "eternal": 0.3,
        "perishable": 0.3
      },
      "gold": {
        "eternal": 0.3,
        "perishable": 0.3,
        "rental": 0.3
      }
    },
    "reroll": {
      "startCost": 5,
      "increment": 1,
      "resetsEachShop": true,
      "rerollSurplusStart": 3,
      "rerollGlutStart": 1,
      "d6TagStart": 0,
      "deterministic": "rerolled cards draw from the same per-ante shop queue (deterministic per seed); rerolls do not restock packs or voucher"
    },
    "buffoonPackJokers": {
      "sameRarityAndEditionDistributionsAsShop": true,
      "stickersApply": true
    }
  },
  "packs": {
    "kinds": {
      "Arcana": {
        "contents": "tarotCard",
        "sizes": {
          "normal": {
            "cardsShown": 3,
            "picks": 1,
            "price": 4,
            "shopSlotWeight": 4,
            "shopSlotChance": 0.178412
          },
          "jumbo": {
            "cardsShown": 5,
            "picks": 1,
            "price": 6,
            "shopSlotWeight": 2,
            "shopSlotChance": 0.089206
          },
          "mega": {
            "cardsShown": 5,
            "picks": 2,
            "price": 8,
            "shopSlotWeight": 0.5,
            "shopSlotChance": 0.022302
          }
        }
      },
      "Celestial": {
        "contents": "planetCard",
        "sizes": {
          "normal": {
            "cardsShown": 3,
            "picks": 1,
            "price": 4,
            "shopSlotWeight": 4,
            "shopSlotChance": 0.178412
          },
          "jumbo": {
            "cardsShown": 5,
            "picks": 1,
            "price": 6,
            "shopSlotWeight": 2,
            "shopSlotChance": 0.089206
          },
          "mega": {
            "cardsShown": 5,
            "picks": 2,
            "price": 8,
            "shopSlotWeight": 0.5,
            "shopSlotChance": 0.022302
          }
        }
      },
      "Standard": {
        "contents": "standardCard",
        "sizes": {
          "normal": {
            "cardsShown": 3,
            "picks": 1,
            "price": 4,
            "shopSlotWeight": 4,
            "shopSlotChance": 0.178412
          },
          "jumbo": {
            "cardsShown": 5,
            "picks": 1,
            "price": 6,
            "shopSlotWeight": 2,
            "shopSlotChance": 0.089206
          },
          "mega": {
            "cardsShown": 5,
            "picks": 2,
            "price": 8,
            "shopSlotWeight": 0.5,
            "shopSlotChance": 0.022302
          }
        }
      },
      "Buffoon": {
        "contents": "joker",
        "sizes": {
          "normal": {
            "cardsShown": 2,
            "picks": 1,
            "price": 4,
            "shopSlotWeight": 1.2,
            "shopSlotChance": 0.053524
          },
          "jumbo": {
            "cardsShown": 4,
            "picks": 1,
            "price": 6,
            "shopSlotWeight": 0.6,
            "shopSlotChance": 0.026762
          },
          "mega": {
            "cardsShown": 4,
            "picks": 2,
            "price": 8,
            "shopSlotWeight": 0.15,
            "shopSlotChance": 0.00669
          }
        }
      },
      "Spectral": {
        "contents": "spectralCard",
        "sizes": {
          "normal": {
            "cardsShown": 2,
            "picks": 1,
            "price": 4,
            "shopSlotWeight": 0.6,
            "shopSlotChance": 0.026762
          },
          "jumbo": {
            "cardsShown": 4,
            "picks": 1,
            "price": 6,
            "shopSlotWeight": 0.3,
            "shopSlotChance": 0.013381
          },
          "mega": {
            "cardsShown": 4,
            "picks": 2,
            "price": 8,
            "shopSlotWeight": 0.07,
            "shopSlotChance": 0.003122
          }
        }
      }
    },
    "totalShopSlotWeight": 22.42,
    "packsPerShop": 2,
    "packsRestockOnReroll": false,
    "soul": {
      "chancePerCardSlot": 0.003,
      "packs": [
        "Arcana",
        "Spectral"
      ],
      "yields": "1 random legendary joker (uniform over the 5, non-ante soul_ stream)",
      "omenGlobeAmbiguity": "mechanics.md:200 states Soul appears in Arcana packs natively; consumables.md:615 has a parenthetical that could be read as requiring Omen Globe for Arcana access. Use the mechanics.md reading (native).",
      "conflict": true
    },
    "blackHole": {
      "chancePerCardSlot": 0.003,
      "packs": [
        "Celestial",
        "Spectral"
      ],
      "alsoArcanaWithOmenGlobe": true
    },
    "omenGlobeSpectralInArcanaChance": 0.2,
    "megaArcanaViaCharmTag": {
      "tag": "CharmTag",
      "cardsShown": 5,
      "minAnte": 1,
      "soulChanceInPack": 0.01491
    },
    "spectralViaEtherealTag": {
      "tag": "EtherealTag",
      "cardsShown": 2,
      "minAnte": 2,
      "soulChanceInPack": 0.005991
    },
    "deterministic": "pack contents are a fixed per-seed sequence; two identical packs opened in either order give the same cards"
  },
  "tags": {
    "all": [
      {
        "name": "UncommonTag",
        "minAnte": 1
      },
      {
        "name": "RareTag",
        "minAnte": 1
      },
      {
        "name": "NegativeTag",
        "minAnte": 2
      },
      {
        "name": "FoilTag",
        "minAnte": 1
      },
      {
        "name": "HolographicTag",
        "minAnte": 1
      },
      {
        "name": "PolychromeTag",
        "minAnte": 1
      },
      {
        "name": "InvestmentTag",
        "minAnte": 1
      },
      {
        "name": "VoucherTag",
        "minAnte": 1
      },
      {
        "name": "BossTag",
        "minAnte": 1
      },
      {
        "name": "StandardTag",
        "minAnte": 2
      },
      {
        "name": "CharmTag",
        "minAnte": 1
      },
      {
        "name": "MeteorTag",
        "minAnte": 2
      },
      {
        "name": "BuffoonTag",
        "minAnte": 2
      },
      {
        "name": "EtherealTag",
        "minAnte": 2
      },
      {
        "name": "CouponTag",
        "minAnte": 1
      },
      {
        "name": "DoubleTag",
        "minAnte": 1
      },
      {
        "name": "JuggleTag",
        "minAnte": 1
      },
      {
        "name": "D6Tag",
        "minAnte": 1
      },
      {
        "name": "TopupTag",
        "minAnte": 2
      },
      {
        "name": "SpeedTag",
        "minAnte": 1
      },
      {
        "name": "HandyTag",
        "minAnte": 2
      },
      {
        "name": "GarbageTag",
        "minAnte": 2
      },
      {
        "name": "OrbitalTag",
        "minAnte": 2
      },
      {
        "name": "EconomyTag",
        "minAnte": 1
      }
    ],
    "count": 24,
    "cannotSpawnAnte1": [
      "NegativeTag",
      "StandardTag",
      "MeteorTag",
      "BuffoonTag",
      "EtherealTag",
      "TopupTag",
      "HandyTag",
      "GarbageTag",
      "OrbitalTag"
    ],
    "cannotSpawnAnte1Count": 9,
    "fallback": "HandyTag",
    "grantRule": "one tag per skipped Small/Big blind, drawn from the per-ante Tag stream; the tag is visible before skipping"
  },
  "seedSpace": {
    "alphabet": "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "alphabetSize": 35,
    "lengths": [
      0,
      8
    ],
    "perLength": {
      "0": 1,
      "1": 35,
      "2": 1225,
      "3": 42875,
      "4": 1500625,
      "5": 52521875,
      "6": 1838265625,
      "7": 64339296875,
      "8": 2251875390625
    },
    "totalSpace": 2318107019761,
    "length8Space": 2251875390625,
    "seedsPerBatch": "35^batchChars",
    "batchesInKeyspace": "35^(8-batchChars)",
    "keyspaceCoversLength8Only": true,
    "determinismTuple": [
      "seed",
      "deck",
      "stake",
      "gameVersion",
      "unlockState"
    ]
  },
  "deckModifiers": {
    "Ghost": {
      "spectralShopWeight": 2,
      "spectralPerSlotChance": 0.0667,
      "shopWeightDenominator": 30,
      "soulBlackHoleExcludedFromShop": true,
      "startingConsumable": "Hex",
      "poolEffect": "adds a 16-spectral equal-weight pool to shop card slots; merchant vouchers dilute it"
    },
    "Zodiac": {
      "startingVouchers": [
        "TarotMerchant",
        "PlanetMerchant",
        "Overstock"
      ],
      "cardSlots": 3,
      "tarotWeight": 9.6,
      "planetWeight": 9.6,
      "empiricalJokersPerShop": 1.53,
      "voucherlessJokersPerShop": 1.43,
      "poolEffect": "tarot/planet weights raised, joker share per slot lowered, 3 card slots"
    },
    "Magic": {
      "startingVoucher": "CrystalBall",
      "startingConsumables": [
        "TheFool",
        "TheFool"
      ],
      "consumableSlots": 3,
      "poolEffect": "no shop-pool change; +1 consumable slot and 2 fixed Fools (front-loads value into first-shop tarot/planet rolls)"
    },
    "Nebula": {
      "startingVoucher": "Telescope",
      "consumableSlots": 1,
      "poolEffect": "Celestial packs always contain the planet for the most-played hand (pack contents constrained, not random); -1 consumable slot"
    },
    "Erratic": {
      "poolEffect": "decklist itself randomized per seed (each card's rank+suit independent); filter via erraticRank/erraticSuit/erraticCard clauses; shop pools unchanged",
      "mostSeedSensitive": true
    },
    "stakeNote": "Black/Orange/Gold stakes add sticker rolls to every shop/booster joker, shifting the RNG stream: identical clause probabilities do NOT transfer across stakes."
  },
  "unsatisfiable": [
    {
      "id": "finisher-boss-before-ante-8",
      "rule": "boss clause naming a finisher (AmberAcorn, VerdantLeaf, VioletVessel, CrimsonHeart, CeruleanBell) with antes entirely outside {8,16,24,32}",
      "severity": "error"
    },
    {
      "id": "regular-boss-below-min-ante",
      "rule": "boss clause whose antes all fall below the boss's minAnte (see pools.bosses.regular)",
      "severity": "error"
    },
    {
      "id": "ante1-excluded-tag-gated-to-ante-1",
      "rule": "tag / smallBlindTag / bigBlindTag clause naming one of tags.cannotSpawnAnte1 with antes: [1] only (or any ante set entirely below 2, noting ante 0 also cannot grant these)",
      "severity": "error"
    },
    {
      "id": "legendary-with-shop-only-sources",
      "rule": "legendaryJoker clause whose explicit sources block lists only shopItems (or shopItems + boosterPacks) with no arcanaPacks/spectralPacks — legendaries exist only via The Soul in arcana/spectral packs; an explicit sources block zeroes every unlisted key",
      "severity": "error"
    },
    {
      "id": "legendary-under-joker-discriminator",
      "rule": "joker: clause naming Canio/Chicot/Perkeo/Triboulet/Yorick with an explicit shopItems-bearing sources block — same as above; without sources the engine's defaults still cover only shop+boosterPacks, which legendaries never enter",
      "severity": "warn"
    },
    {
      "id": "secret-planet-precondition",
      "rule": "planetCard clause naming PlanetX/Ceres/Eris: these can only spawn after their hand (Five of a Kind / Flush House / Flush Five) has been played that run — a player-decision precondition the seed alone does not determine. FLAG as likely-zero/conditional; do not assume unsatisfiable.",
      "severity": "flag"
    },
    {
      "id": "ante-out-of-range",
      "rule": "antes outside 0-39 (ante 0 is real via Hieroglyph; do not clamp to 1-8). Jamlyzer analysis caps at antes 1-8 but search filters may target any ante.",
      "severity": "warn"
    }
  ],
  "sources": {
    "pools.jokers.total": "corpus/knowledge/jokers.md:3",
    "pools.jokers.byRarity": "corpus/knowledge/jokers.md:3 (verified by counting rarity: fields: 61/64/20/5, sum 150)",
    "pools.jokers.legendaryNames": "lib/mcp/client/seedlab/catalog.generated.json (legendaryJoker list); corpus/knowledge/legendaries.md:3",
    "pools.jokers.legendarySourceRule": "corpus/knowledge/mechanics.md:174; skills/jaml-authoring/SKILL.md:48-56; corpus/knowledge/legendaries.md:3",
    "pools.tarot.count": "corpus/knowledge/consumables.md:3 (verified: 22 'type: tarot' blocks; catalog tarotCard=22)",
    "pools.planet.count": "corpus/knowledge/consumables.md:3 (verified: 12 'type: planet' blocks; catalog planetCard=12)",
    "pools.planet.secretPreconditions.PlanetX": "corpus/knowledge/consumables.md:379-382",
    "pools.planet.secretPreconditions.Ceres": "corpus/knowledge/consumables.md:391-394",
    "pools.planet.secretPreconditions.Eris": "corpus/knowledge/consumables.md:403-406",
    "pools.planet.fallback": "corpus/knowledge/mechanics.md:225 (rng-streams consequence 5: Planet->Pluto)",
    "pools.spectral.count": "corpus/knowledge/consumables.md:3 (verified: 18 'type: spectral' blocks; catalog spectralCard=18)",
    "pools.spectral.shopEligibleCount": "corpus/knowledge/decks.md:101 ('All 16 shop-eligible Spectrals have equal weight; The Soul and Black Hole never appear in the shop')",
    "pools.spectral.fallback": "corpus/knowledge/mechanics.md:225 (Spectral->Incantation)",
    "pools.vouchers.count": "corpus/knowledge/consumables.md:3 ('all 32 vouchers (16 base + 16 upgraded)'; catalog voucher=32)",
    "pools.vouchers.pairs": "corpus/knowledge/consumables.md:657,669,681,694,706,718,730,742,754,766,778,790,802,814,826,838 (the 16 paired voucher blocks)",
    "pools.vouchers.fallback": "corpus/knowledge/mechanics.md:225 (Voucher->Blank)",
    "pools.tags.count": "corpus/knowledge/mechanics.md:130-157 (24-row tag table); catalog tag=24",
    "pools.bosses.regular": "corpus/knowledge/mechanics.md:83-105 (boss table with min ante column)",
    "pools.bosses.ante1PoolSize": "corpus/knowledge/mechanics.md:107",
    "pools.bosses.allRegularAvailableFromAnte": "corpus/knowledge/mechanics.md:107",
    "pools.bosses.finishers": "corpus/knowledge/mechanics.md:110-118",
    "pools.bosses.finisherAntes": "corpus/knowledge/mechanics.md:110 ('Showdown blinds (Ante 8, 16, 24, 32 only)'); corpus/knowledge/mechanics.md:34 (showdown recurrence at 16, 24, 32)",
    "pools.bosses.noRepeatRule": "corpus/knowledge/mechanics.md:79",
    "shop.cardSlots": "corpus/knowledge/mechanics.md:172 (base 2); corpus/knowledge/mechanics.md:173 ('Overstock/Overstock Plus: card slots 2 -> 3 -> 4')",
    "shop.boosterPackSlots": "corpus/knowledge/mechanics.md:172",
    "shop.voucherSlots": "corpus/knowledge/mechanics.md:172",
    "shop.firstShopGuaranteedNormalBuffoonPack": "corpus/knowledge/mechanics.md:172",
    "shop.typeWeights": "corpus/knowledge/mechanics.md:172 ('weighted Joker 20 / Tarot 4 / Planet 4 -> ~71.4% / 14.3% / 14.3%')",
    "shop.typeWeightModifiers": "corpus/knowledge/mechanics.md:173",
    "shop.jokerRarity": "corpus/knowledge/mechanics.md:174",
    "shop.jokerEditions.base+thresholds": "corpus/knowledge/mechanics.md:175",
    "shop.jokerEditions.honeGlowUpMultipliers.mechanicsMdReading": "corpus/knowledge/mechanics.md:175",
    "shop.jokerEditions.honeGlowUpMultipliers.consumablesMdReading": "corpus/knowledge/consumables.md:687-688",
    "shop.playingCardEditions": "corpus/knowledge/mechanics.md:175",
    "shop.standardPackCardModifiers": "corpus/knowledge/mechanics.md:201 ('Standard Pack playing cards: 40% enhanced ... 20% sealed ...')",
    "shop.illusionShopPlayingCards": "corpus/knowledge/mechanics.md:173; corpus/knowledge/consumables.md:808 (Illusion block; v1.0.1o bug: seals never appear)",
    "shop.stickerOddsByStake": "corpus/knowledge/decks.md:213,216,217 (stake table rows; cumulative per header corpus/knowledge/decks.md:208 and corpus/knowledge/decks.md:221-222)",
    "shop.reroll": "corpus/knowledge/mechanics.md:176",
    "packs.kinds.cardsShown+picks+price": "corpus/knowledge/mechanics.md:190-197 (pack size table)",
    "packs.kinds.shopSlotWeight+chance": "corpus/knowledge/mechanics.md:199 (weights and %); denominator 22.42 = sum of all 15 kind-size weights, reproduces the corpus percentages exactly",
    "packs.soul": "corpus/knowledge/mechanics.md:200; corpus/knowledge/consumables.md:611-618 (spectral_soul deep block)",
    "packs.blackHole": "corpus/knowledge/mechanics.md:200; corpus/knowledge/consumables.md:626-632 (spectral_black_hole deep block)",
    "packs.omenGlobeSpectralInArcanaChance": "corpus/knowledge/mechanics.md:200; corpus/knowledge/consumables.md:712 (Crystal Ball / Omen Globe block)",
    "packs.megaArcanaViaCharmTag": "corpus/knowledge/mechanics.md:144 (Charm Tag row), corpus/knowledge/mechanics.md:160 (best Soul farm note); soulChanceInPack = 1-(1-0.003)^5",
    "packs.spectralViaEtherealTag": "corpus/knowledge/mechanics.md:147 (Ethereal Tag row), corpus/knowledge/mechanics.md:160",
    "packs.deterministic": "corpus/knowledge/mechanics.md:189",
    "packs.packsRestockOnReroll": "corpus/knowledge/mechanics.md:176,189",
    "tags.all": "corpus/knowledge/mechanics.md:130-157 (tag table, min-ante column)",
    "tags.cannotSpawnAnte1": "corpus/knowledge/mechanics.md:159",
    "tags.fallback": "corpus/knowledge/mechanics.md:159; corpus/knowledge/mechanics.md:225 (Tag->Handy)",
    "seedSpace.alphabet": "corpus/knowledge/mechanics.md:253",
    "seedSpace.totalSpace": "corpus/knowledge/mechanics.md:254 (sum of 35^k for k=0..8; computed exactly here: 2318107019761)",
    "seedSpace.length8Space": "35^8 = 2251875390625, measured against motely-wasm 25.0.3 per lib/party/PROTOCOL.md:42-50",
    "seedSpace.seedsPerBatch": "lib/party/PROTOCOL.md:42-50 (Resolved 2026-08-12: SeedsPerBatch = 35^batchCharCount; keyspace holds 35^(8-batchChars) batches, length-8 seeds only)",
    "seedSpace.determinismTuple": "corpus/knowledge/mechanics.md:255; corpus/knowledge/decks.md:198-204 (stakes block intro)",
    "deckModifiers.Ghost": "corpus/knowledge/decks.md:100-101; corpus/knowledge/mechanics.md:173",
    "deckModifiers.Zodiac": "corpus/knowledge/decks.md:138-139",
    "deckModifiers.Magic": "corpus/knowledge/decks.md:74-78",
    "deckModifiers.Nebula": "corpus/knowledge/decks.md:87-88",
    "deckModifiers.Erratic": "corpus/knowledge/decks.md:191-193; skills/jaml-authoring/SKILL.md (erraticRank/erraticSuit/erraticCard discriminators)",
    "deckModifiers.stakeNote": "corpus/knowledge/decks.md:221-222",
    "unsatisfiable.finisher-boss-before-ante-8": "corpus/knowledge/mechanics.md:110",
    "unsatisfiable.regular-boss-below-min-ante": "corpus/knowledge/mechanics.md:83-105",
    "unsatisfiable.ante1-excluded-tag-gated-to-ante-1": "corpus/knowledge/mechanics.md:159",
    "unsatisfiable.legendary-with-shop-only-sources": "skills/jaml-authoring/SKILL.md:48-56 + sources semantics skills/jaml-authoring/SKILL.md:85-100 ('a sources: block that specifies shopItems but omits boosterPacks -> empty, not all packs'); corpus/knowledge/mechanics.md:174",
    "unsatisfiable.secret-planet-precondition": "corpus/knowledge/consumables.md:382,394,406; corpus/knowledge/mechanics.md:224 (resample preconditions: secret-hand planets require the hand played once)",
    "unsatisfiable.ante-out-of-range": "skills/jaml-authoring/SKILL.md:105-112 (antes run 0-39; ante 0 via Hieroglyph); Jamlyzer 1-8 cap skills/jaml-authoring/SKILL.md:114-121",
    "shop.buffoonPackJokers": "corpus/knowledge/mechanics.md:202 (same rarity/edition distributions as shop; stickers can appear in shop and Buffoon packs)"
  }
} as const;

export type RarityData = typeof RARITY_DATA;
