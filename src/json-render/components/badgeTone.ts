import type { JimboBadgeTone } from "../../ui/JimboBadge.js";

export type BadgeTone = "red" | "blue" | "green" | "orange" | "gold" | "purple" | "grey";

// JimboBadge has no gold tone on purpose — gold is reserved for text, not pill
// surfaces — so gold folds to the nearest warm badge, orange.
const BADGE_TONE: Record<BadgeTone, JimboBadgeTone> = {
  red: "red",
  blue: "blue",
  green: "green",
  orange: "orange",
  gold: "orange",
  purple: "purple",
  grey: "grey",
};

export function badgeToneToJimbo(tone: BadgeTone): JimboBadgeTone {
  return BADGE_TONE[tone];
}
