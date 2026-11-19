export type JimboZoneKey = "must" | "should" | "mustnot";
export type JimboZoneInput = JimboZoneKey | "mustNot";

export interface JimboZoneMeta {
  key: JimboZoneKey;
  label: string;
  hint: string;
}

export const JIMBO_ZONE_META: Record<JimboZoneKey, JimboZoneMeta> = {
  must: {
    key: "must",
    label: "Must",
    hint: "Seed must contain all of these.",
  },
  should: {
    key: "should",
    label: "Should",
    hint: "Bonus points per match.",
  },
  mustnot: {
    key: "mustnot",
    label: "Must Not",
    hint: "Rejected if any appear.",
  },
};

export function normalizeJimboZone(zone: JimboZoneInput): JimboZoneKey {
  return zone === "mustNot" ? "mustnot" : zone;
}
