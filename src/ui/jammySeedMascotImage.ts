// The real Jammy mascot artwork (hand-drawn) — a big brown seed with a
// green sprout and a jester/joker character peeking out from behind it.
//
// This used to be a 257 kB base64 string literal pasted straight into this
// module, on the reasoning that the published npm package should be
// self-contained. It stayed self-contained without the cost: the PNG now lives
// in assets/ alongside the sprite sheets, ships via the `assets/*.png` entry in
// package.json "files", and the build emits it to dist/assets/ (see
// emitAssetsAsFiles in vite.config.ts). A data URI in a JS module cannot be
// cached as an image, decoded off the main thread, or skipped by a consumer
// that never renders the mascot — a real file is all three.
import mascotUrl from "../../assets/jammy-seed-mascot.png";

export const JAMMY_SEED_MASCOT_URL: string = mascotUrl;
