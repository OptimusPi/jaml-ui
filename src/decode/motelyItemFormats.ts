import { MotelyItemType, MotelyItemTypeCategory } from "motely-wasm";

/**
 * Display vocabulary for MotelyItemType values.
 *
 * Everything except the presentation aliases below is DERIVED from the
 * motely-wasm runtime enums at module load: each member's numeric value comes
 * straight from MotelyItemType and its category from
 * `value & 0xf000 -> MotelyItemTypeCategory` (category @bit12, 4 bits — the
 * layout motelyItemDecoder.ts documents for the packed value). An engine
 * release that adds or renames items therefore cannot silently mislabel
 * cards: the table picks new members up automatically and falls back to the
 * enum key as the display name until an alias is added.
 *
 * What remains hand-maintained is presentation only: DISPLAY_NAME_ALIASES,
 * the Balatro display names that differ from prettifying the enum key
 * ("EightBall" -> "8 Ball", "ChaostheClown" -> "Chaos the Clown", the 52
 * standard playing cards, ...). `pnpm decode:check`
 * (scripts/check-decoder.mjs) pins the whole contract against the installed
 * motely-wasm: for every runtime enum member the derived value, category and
 * enum name must match the enum, and a display name is only legal if it is
 * the prettified enum key or a registered alias.
 */

export type MotelyItemCategoryName =
  | "Standardcard"
  | "SpectralCard"
  | "TarotCard"
  | "PlanetCard"
  | "Joker"
  | "Invalid";

export interface MotelyItemFormat {
  readonly value: number;
  readonly enumName: string;
  readonly displayName: string;
  readonly category: MotelyItemCategoryName;
}

/**
 * Presentation-only display-name aliases, keyed by MotelyItemType enum key.
 * These are the names the Balatro UI shows that differ from prettifying the
 * enum key (see spaceSplit below); every key here must be a real
 * MotelyItemType member and every value is pinned by decode:check.
 */
export const MOTELY_ITEM_DISPLAY_NAME_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  TwoOfClubs: "2 of Clubs",
  ThreeOfClubs: "3 of Clubs",
  FourOfClubs: "4 of Clubs",
  FiveOfClubs: "5 of Clubs",
  SixOfClubs: "6 of Clubs",
  SevenOfClubs: "7 of Clubs",
  EightOfClubs: "8 of Clubs",
  NineOfClubs: "9 of Clubs",
  TenOfClubs: "10 of Clubs",
  JackOfClubs: "Jack of Clubs",
  QueenOfClubs: "Queen of Clubs",
  KingOfClubs: "King of Clubs",
  AceOfClubs: "Ace of Clubs",
  TwoOfDiamonds: "2 of Diamonds",
  ThreeOfDiamonds: "3 of Diamonds",
  FourOfDiamonds: "4 of Diamonds",
  FiveOfDiamonds: "5 of Diamonds",
  SixOfDiamonds: "6 of Diamonds",
  SevenOfDiamonds: "7 of Diamonds",
  EightOfDiamonds: "8 of Diamonds",
  NineOfDiamonds: "9 of Diamonds",
  TenOfDiamonds: "10 of Diamonds",
  JackOfDiamonds: "Jack of Diamonds",
  QueenOfDiamonds: "Queen of Diamonds",
  KingOfDiamonds: "King of Diamonds",
  AceOfDiamonds: "Ace of Diamonds",
  TwoOfHearts: "2 of Hearts",
  ThreeOfHearts: "3 of Hearts",
  FourOfHearts: "4 of Hearts",
  FiveOfHearts: "5 of Hearts",
  SixOfHearts: "6 of Hearts",
  SevenOfHearts: "7 of Hearts",
  EightOfHearts: "8 of Hearts",
  NineOfHearts: "9 of Hearts",
  TenOfHearts: "10 of Hearts",
  JackOfHearts: "Jack of Hearts",
  QueenOfHearts: "Queen of Hearts",
  KingOfHearts: "King of Hearts",
  AceOfHearts: "Ace of Hearts",
  TwoOfSpades: "2 of Spades",
  ThreeOfSpades: "3 of Spades",
  FourOfSpades: "4 of Spades",
  FiveOfSpades: "5 of Spades",
  SixOfSpades: "6 of Spades",
  SevenOfSpades: "7 of Spades",
  EightOfSpades: "8 of Spades",
  NineOfSpades: "9 of Spades",
  TenOfSpades: "10 of Spades",
  JackOfSpades: "Jack of Spades",
  QueenOfSpades: "Queen of Spades",
  KingOfSpades: "King of Spades",
  AceOfSpades: "Ace of Spades",
  TheWheelOfFortune: "The Wheel of Fortune",
  EightBall: "8 Ball",
  ChaostheClown: "Chaos the Clown",
  RideTheBus: "Ride the Bus",
  RiffRaff: "Riff-raff",
  ShootTheMoon: "Shoot the Moon",
  Cloud9: "Cloud 9",
  ToTheMoon: "To the Moon",
  MrBones: "Mr. Bones",
  SockAndBuskin: "Sock and Buskin",
  OopsAll6s: "Oops! All 6s",
  HitTheRoad: "Hit the Road",
  DriversLicense: "Driver's License",
});

function spaceSplit(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

function runtimeEnumNames(enumObject: Record<string, unknown>): string[] {
  return Object.keys(enumObject).filter((key) => Number.isNaN(Number(key)));
}

function deriveCategoryName(value: number): MotelyItemCategoryName | undefined {
  const name = MotelyItemTypeCategory[value & 0xf000] as string | undefined;
  return name as MotelyItemCategoryName | undefined;
}

function buildFormats(): {
  byValue: Record<number, MotelyItemFormat>;
  byName: Record<string, MotelyItemFormat>;
} {
  const byValue: Record<number, MotelyItemFormat> = {};
  const byName: Record<string, MotelyItemFormat> = {};
  for (const enumName of runtimeEnumNames(MotelyItemType as unknown as Record<string, unknown>)) {
    const value = (MotelyItemType as unknown as Record<string, number>)[enumName];
    if (typeof value !== "number" || !Number.isInteger(value)) continue;
    const category = deriveCategoryName(value);
    if (category === undefined) continue;
    const format: MotelyItemFormat = Object.freeze({
      value,
      enumName,
      displayName: MOTELY_ITEM_DISPLAY_NAME_ALIASES[enumName] ?? spaceSplit(enumName),
      category,
    });
    byValue[value] = format;
    byName[enumName] = format;
  }
  return { byValue, byName };
}

const { byValue, byName } = buildFormats();

export const MOTELY_ITEM_FORMATS_BY_VALUE: Readonly<Record<number, MotelyItemFormat>> = Object.freeze(byValue);
export const MOTELY_ITEM_FORMATS_BY_ENUM_NAME: Readonly<Record<string, MotelyItemFormat>> = Object.freeze(byName);
