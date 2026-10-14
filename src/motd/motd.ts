// What JAML stands for, this time.
//
// Minecraft's title screen never settled on one joke and neither does this.
// The corpus lives in the JAML.motds repo; motdData.generated.ts is emitted
// from it by scripts/emit-motds.mjs. Server-safe: no React, no DOM, no engine.

import { JAML_MOTDS } from "./motdData.generated.js";

export { JAML_MOTDS };

/**
 * Pick a meaning for JAML.
 *
 * Pass a `key` — a seed, a run id, a date string — and it always gives the same
 * answer, so a seed can have *its* meaning instead of a new one every render.
 * Pass nothing and it's a fresh roll.
 */
export function pickMotd(key?: string): string {
  if (key === undefined) {
    return JAML_MOTDS[Math.floor(Math.random() * JAML_MOTDS.length)]!;
  }
  let h = 0x811c9dc5; // FNV-1a: stable across runs, spreads short strings well
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return JAML_MOTDS[(h >>> 0) % JAML_MOTDS.length]!;
}
