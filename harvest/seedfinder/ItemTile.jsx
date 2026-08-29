/**
 * Real Balatro sprite art (jaml-ui) for a clause's {kind, name}. Falls back
 * to plain text only on an actual render error or an empty name — that's
 * error handling, not a way to paper over an unverified assumption. Same
 * pattern as the existing X-Ray's ItemSprite in mcp-app.jsx, generalized to
 * also cover boss/voucher/tag (which the X-Ray never needed sprites for).
 */
import React, { useState, useRef, useLayoutEffect } from "react";
import { JamlBoss, JamlVoucher, JamlTag, JamlGameCard } from "jaml-ui";

// jaml-ui's sprite catalogs key on spaced display names ("The Head", "Seed
// Money", "Abstract Joker") vs. JAML's PascalCase clause values ("TheHead",
// "SeedMoney", "AbstractJoker") — verified live for boss/voucher in the
// existing X-Ray (mcp-app.jsx), and confirmed live here for joker/tarot/
// planet/spectral too: pixel-sampled the Picker's item grid and found every
// blank tile was a multi-word PascalCase name (AbstractJoker, BlueJoker,
// BaseballCard, ...) while every single-word name (Acrobat, Blueprint, ...)
// rendered fine — a JamlGameCard sprite-lookup miss on the concatenated
// form, not a render error (no exception, so the error-boundary fallback
// never engaged; jaml-ui just draws an empty 300x150 placeholder canvas).
// spaced() is idempotent on already-spaced input (regex only matches a
// lowercase/digit immediately followed by uppercase — a no-op across an
// existing space), so applying it everywhere is safe for both PascalCase
// catalog names and pre-spaced decodeMotelyItemName() output alike.
// TAG IS STILL NOT INDEPENDENTLY VERIFIED: no prior code in this repo has
// tested a tag sprite specifically, so "Handy Tag" remains an unverified
// guess by analogy to the now-confirmed boss/voucher/joker convention.
//
// A handful of names don't survive the regex even after that: it only
// finds a word boundary at a lowercase-to-uppercase transition, so a
// lowercase mid-name word ("Chaos THE Clown", "Wheel OF Fortune" — real
// display name keeps "the"/"of" lowercase) reads as one unbroken run. Two
// others are display-name substitutions, not spacing at all ("Eight Ball"
// is shown as "8 Ball"; "Cloud 9" needs a space before a digit the regex
// doesn't handle at all). Confirmed via pixel-sampling every catalog name —
// these four are the only ones left unresolved out of 292.
const NAME_OVERRIDES = {
  ChaostheClown: "Chaos the Clown",
  Cloud9: "Cloud 9",
  EightBall: "8 Ball",
  TheWheelOfFortune: "The Wheel of Fortune",
};
function spaced(name) {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name];
  return String(name).replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

// Maps a clause `kind` onto JamlGameCard's `type` prop. Two different
// callers feed two different vocabularies through the same `kind` param:
// the picker/Filter/MapEditor use JAML's clause-kind spelling (joker,
// legendaryJoker, tarotCard, planetCard, spectralCard); the Jamlyze panel's
// shop/pack items instead pass motelyItemRenderCategory()'s own spelling
// (joker, consumable, playing, tarot, planet, spectral, unknown) straight
// through as `kind`. JamlGameCardProps.type only actually accepts "joker" |
// "consumable" | "playing" — NOT "tarot"/"planet"/"spectral" in EITHER
// spelling. Confirmed live: passing any of "tarotCard"/"planetCard"/
// "spectralCard"/"tarot"/"planet"/"spectral" unmapped renders 100% blank (a
// 300x150 placeholder canvas, no error). Both vocabularies' three
// consumable-type spellings need to land on "consumable" — mapping only one
// of them left the other one blank.
const GAME_CARD_TYPE = {
  joker: "joker",
  legendaryJoker: "joker",
  tarotCard: "consumable",
  planetCard: "consumable",
  spectralCard: "consumable",
  tarot: "consumable",
  planet: "consumable",
  spectral: "consumable",
};

/**
 * The slot is the size authority. jaml-ui 4.3.x half-applies its `scale`
 * prop — the wrapper lays out at 71px×scale but the canvas paints a full
 * 71x95 and hangs out the wrapper's right edge (seedlab.css's
 * .j-card-renderer grid-auto-columns:100% patch makes the box honest
 * again). So ItemTile renders every sprite at base size (scale 1) and
 * FitBox shrinks it — whole, centered — into whatever box the parent
 * gives it. FitBox measures layout size (offsetWidth/Height ignore
 * transforms, so measurement stays stable across re-scales) and fits with
 * a CSS transform, never by cropping.
 */
function FitBox({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      // jaml-ui's wrapper div can report a layout width far narrower than
      // the canvas it contains (measured live: 12px-wide div holding a
      // 71px-wide static canvas), so take the max of the wrapper's layout
      // size, its scroll size, and the painted canvas itself.
      const canvas = inner.querySelector("canvas, img");
      const iw = Math.max(inner.offsetWidth, inner.scrollWidth, canvas ? canvas.offsetWidth : 0);
      const ih = Math.max(inner.offsetHeight, inner.scrollHeight, canvas ? canvas.offsetHeight : 0);
      const ow = outer.clientWidth;
      const oh = outer.clientHeight;
      if (iw > 0 && ih > 0 && ow > 0 && oh > 0) {
        const s = Math.min(ow / iw, oh / ih, 1);
        setFit((prev) => (Math.abs(prev - s) > 0.01 ? s : prev));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    ro.observe(outer);
    // ...but the wrapper's own box frequently does NOT change when the sprite
    // finally paints (see above: a 12px div holding a 71px canvas), so the two
    // observers above can miss the only resize that matters and leave fit at 1
    // — a full-size card cropped by the slot. Watch the canvas itself, both
    // for when it is inserted and for when its size settles after the sheet
    // loads. This is why the picker grid still rendered cards cut off.
    const watchCanvas = () => {
      const c = inner.querySelector("canvas, img");
      if (c) ro.observe(c);
      return c;
    };
    watchCanvas();
    const mo = new MutationObserver(() => { watchCanvas(); measure(); });
    mo.observe(inner, { childList: true, subtree: true });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, []);
  return (
    <span
      ref={outerRef}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}
    >
      <span
        ref={innerRef}
        style={{ display: "inline-block", flexShrink: 0, transform: `scale(${fit})`, transformOrigin: "center" }}
      >
        {children}
      </span>
    </span>
  );
}

class TileErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError && this.props.onError(); }
  render() { return this.state.hasError ? null : this.props.children; }
}

// The `scale` prop is accepted for caller compatibility but deliberately NOT
// forwarded: fractional scales are exactly what desynced wrapper and canvas
// (see module header). Sprites render at base size; FitBox fits the slot.
export function ItemTile({ kind, name, scale = 1, className }) {
  void scale;
  const [broke, setBroke] = useState(false);
  if (broke || !name) {
    return <span className={"lab-tile-fallback " + (className || "")}>{name || "?"}</span>;
  }
  let content = null;
  if (kind === "boss") content = <JamlBoss bossName={spaced(name)} scale={1} />;
  else if (kind === "voucher") content = <JamlVoucher voucherName={spaced(name)} scale={1} />;
  else if (kind === "tag" || kind === "smallBlindTag" || kind === "bigBlindTag") {
    content = <JamlTag tagName={spaced(name)} scale={1} />;
  } else {
    const type = GAME_CARD_TYPE[kind] || kind || "joker";
    content = <JamlGameCard type={type} card={{ name: spaced(name), scale: 1 }} />;
  }
  return (
    <span className={className} title={name}>
      <TileErrorBoundary onError={() => setBroke(true)}>
        <FitBox>{content}</FitBox>
      </TileErrorBoundary>
    </span>
  );
}
