/**
 * Deterministic Daily Challenges engine for Balatro & Erratic Deck rituals.
 * 
 * Each day has a deterministic challenge based on the date.
 * Like Wordle, everyone gets the same challenge on the same day.
 * 
 * Challenges cycle through fun Balatro themes with Erratic Deck
 * twists — specific card ranks, joker combos, and synergies.
 */

export interface DailyChallenge {
  dayNumber: number;
  dateString: string;
  title: string;
  emoji: string;
  description: string;
  flavor: string;
  jaml: string;
  focusRank?: string;
  targetJoker: string;
  hint: string;
}

export type DailyChallengeTemplate = Omit<DailyChallenge, "dayNumber" | "dateString">;

export const DAILY_CHALLENGE_TEMPLATES: readonly DailyChallengeTemplate[] = Object.freeze([
  {
    title: "The Daily Wee",
    emoji: "🐭",
    description: "WeeJoker wants tiny cards. Find seeds where rank 2 shines!",
    flavor: '"Wee" means small — not the British slang! Though this joker IS rather cute.',
    jaml: `deck: Erratic
stake: White
must:
  - joker: WeeJoker
    antes: [1, 2, 3]
should:
  - joker: Hack
    antes: [1, 2, 3]
    score: 50
  - joker: HangingChad
    antes: [1, 2, 3]
    score: 40
  - standardcard:
      rank: Two
    antes: [1]
    score: 30`,
    focusRank: "2",
    targetJoker: "WeeJoker",
    hint: "WeeJoker gives +20 Chips for every 2 in your deck. More 2s = bigger wee!",
  },
  {
    title: "Cloud Nine",
    emoji: "☁️",
    description: "Cloud 9 gives $1 for every 9. Fill that deck with nines!",
    flavor: "Walking on cloud nine — literally, you have so much money from all those 9s.",
    jaml: `deck: Erratic
stake: White
must:
  - joker: Cloud9
    antes: [1, 2, 3]
should:
  - joker: ToTheMoon
    antes: [1, 2, 3]
    score: 45
  - joker: Rocket
    antes: [1, 2, 3]
    score: 40
  - standardcard:
      rank: Nine
    antes: [1]
    score: 35`,
    focusRank: "9",
    targetJoker: "Cloud9",
    hint: "Cloud 9 pays $1 per 9 held in deck. Pair with To The Moon for interest scaling!",
  },
  {
    title: "Hack the Planet",
    emoji: "💻",
    description: "Hack retriggers each played 2, 3, 4, 5. Stack those small ranks!",
    flavor: "Mr. Robot who? Hack is the REAL cyberpunk hero.",
    jaml: `deck: Erratic
stake: White
must:
  - joker: Hack
    antes: [1, 2, 3]
should:
  - joker: WeeJoker
    antes: [1, 2, 3]
    score: 50
  - joker: Seltzer
    antes: [1, 2, 3]
    score: 40
  - joker: Dusk
    antes: [1, 2, 3]
    score: 35`,
    focusRank: "2",
    targetJoker: "Hack",
    hint: "Hack retriggers 2,3,4,5. Pair with WeeJoker so those small cards hit HARD.",
  },
  {
    title: "Blueprint Bonanza",
    emoji: "📋",
    description: "The ultimate copycat. Copy your best joker every single hand!",
    flavor: "Copying someone else's homework? In Balatro, that's called optimal strategy.",
    jaml: `deck: Erratic
stake: White
must:
  - joker: Blueprint
    antes: [1, 2, 3]
should:
  - joker: Brainstorm
    antes: [1, 2, 3]
    score: 50
  - joker: Baron
    antes: [1, 2, 3]
    score: 45
  - voucher: Overstock
    antes: [1, 2]
    score: 30`,
    targetJoker: "Blueprint",
    hint: "Blueprint copies the ability of the Joker to its right. Move it around!",
  },
  {
    title: "Baron's Bloodbath",
    emoji: "👑",
    description: "Kings in hand give 1.5x Mult each. Long live the King!",
    flavor: "Off with their heads! Wait, no — keep the heads, we need the Kings.",
    jaml: `deck: Erratic
stake: White
must:
  - joker: Baron
    antes: [1, 2, 3]
should:
  - joker: Mime
    antes: [1, 2, 3]
    score: 50
  - joker: Blueprint
    antes: [1, 2, 3]
    score: 45
  - standardcard:
      rank: King
    antes: [1]
    score: 40`,
    focusRank: "K",
    targetJoker: "Baron",
    hint: "Baron gives 1.5x Mult for EACH King held in hand. Pair with Mime to trigger held-in-hand effects twice!",
  },
  {
    title: "Oops! All Aces",
    emoji: "🎯",
    description: "Scholar gives +20 Chips and +4 Mult for every played Ace!",
    flavor: "Ace in the hole? How about 20 Aces in the deck!",
    jaml: `deck: Erratic
stake: White
must:
  - joker: Scholar
    antes: [1, 2, 3]
should:
  - joker: Fibonacci
    antes: [1, 2, 3]
    score: 45
  - standardcard:
      rank: Ace
    antes: [1]
    score: 50`,
    focusRank: "A",
    targetJoker: "Scholar",
    hint: "Scholar boosts every played Ace with chips and mult. Stack your Erratic Deck with Aces!",
  },
  {
    title: "The Fibonacci Spiral",
    emoji: "🌀",
    description: "Ace, 2, 3, 5, 8 give +8 Mult each. Nature's golden ratio in poker form.",
    flavor: "1, 1, 2, 3, 5, 8, 13... Math has never scored so many points.",
    jaml: `deck: Erratic
stake: White
must:
  - joker: Fibonacci
    antes: [1, 2, 3]
should:
  - joker: Hack
    antes: [1, 2, 3]
    score: 45
  - joker: WeeJoker
    antes: [1, 2, 3]
    score: 40
  - joker: Scholar
    antes: [1, 2, 3]
    score: 35`,
    focusRank: "8",
    targetJoker: "Fibonacci",
    hint: "Fibonacci gives +8 Mult for every played Ace, 2, 3, 5, 8. Small-to-mid rank dream.",
  },
]);

/** Epoch start date for day number calculations (Jan 1, 2026) */
const EPOCH = new Date("2026-01-01T00:00:00Z").getTime();
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDayNumber(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return Math.max(1, Math.floor((utcDate.getTime() - EPOCH) / MS_PER_DAY) + 1);
}

export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  const dayNumber = getDayNumber(date);
  const templateIndex = (dayNumber - 1) % DAILY_CHALLENGE_TEMPLATES.length;
  const template = DAILY_CHALLENGE_TEMPLATES[templateIndex];
  const dateString = date.toISOString().split("T")[0];

  return {
    ...template,
    dayNumber,
    dateString,
  };
}
