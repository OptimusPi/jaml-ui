// Owned preview for JamlGameCard. The generated wrapper imports the story
// MODULE (@ds-stories/src/components/GameCard.stories), whose relative
// `./GameCard.js` import bundles GameCard.tsx from SOURCE (the file basename
// "GameCard" matches no exported component name, so the ds-import-policy shim
// does not claim it) — dragging the real motely-wasm -> dotnet.js ->
// node:process into the preview bundle, which cannot resolve. Importing the
// components from the package barrel shims them to the DS global (built from
// the motely-patched ds-dist), so the render is the shipped code path.
// Story JSX mirrored 1:1 from src/components/GameCard.stories.tsx.
import * as React from "react";
import { JamlGameCard, JamlVoucher, JamlTag, JamlBoss } from "jaml-ui";

export const Joker = () => (
  <JamlGameCard card={{ name: "Joker", scale: 2 }} type="joker" />
);

export const Consumable = () => (
  <JamlGameCard card={{ name: "The Fool" }} type="consumable" />
);

export const PlayingCard = /* Playing Card */ () => (
  <JamlGameCard card={{ name: "Ace of Spades" }} type="playing" />
);

export const Editions = () => (
  <div style={{ display: "grid", gap: 16, gridAutoFlow: "column", justifyContent: "start" }}>
    <JamlGameCard card={{ name: "Joker", scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", edition: "Foil", scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", edition: "Holographic", scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", edition: "Polychrome", scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", edition: "Negative", scale: 2 }} type="joker" />
  </div>
);

export const Stickers = () => (
  <div style={{ display: "grid", gap: 16, gridAutoFlow: "column", justifyContent: "start" }}>
    <JamlGameCard card={{ name: "Joker", isEternal: true, scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", isPerishable: true, scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", isRental: true, scale: 2 }} type="joker" />
    <JamlGameCard
      card={{ name: "Joker", isEternal: true, isPerishable: true, isRental: true, scale: 2 }}
      type="joker"
    />
  </div>
);

export const EnhancementsAndSeals = /* Enhancements And Seals */ () => (
  <div style={{ display: "grid", gap: 16, gridAutoFlow: "column", justifyContent: "start" }}>
    <JamlGameCard card={{ name: "Ace of Hearts", rank: "Ace", suit: "Hearts", scale: 2 }} type="playing" />
    <JamlGameCard
      card={{ name: "Ace of Hearts", rank: "Ace", suit: "Hearts", enhancements: ["Glass"], scale: 2 }}
      type="playing"
    />
    <JamlGameCard
      card={{ name: "Ace of Hearts", rank: "Ace", suit: "Hearts", seal: "Red Seal", scale: 2 }}
      type="playing"
    />
    <JamlGameCard
      card={{ name: "Ace of Hearts", rank: "Ace", suit: "Hearts", enhancements: ["Steel"], seal: "Gold Seal", scale: 2 }}
      type="playing"
    />
  </div>
);

export const NameParsing = /* Name Parsing */ () => (
  <div style={{ display: "grid", gap: 16, gridAutoFlow: "column", justifyContent: "start" }}>
    <JamlGameCard card={{ name: "King of Clubs", scale: 2 }} type="playing" />
    <JamlGameCard card={{ name: "KC", scale: 2 }} type="playing" />
    <JamlGameCard card={{ name: "10 of Diamonds", scale: 2 }} type="playing" />
    <JamlGameCard card={{ name: "ignored", rank: "Queen", suit: "Spades", scale: 2 }} type="playing" />
  </div>
);

export const Scales = () => (
  <div style={{ display: "grid", gap: 16, gridAutoFlow: "column", justifyContent: "start", alignItems: "end" }}>
    <JamlGameCard card={{ name: "Joker", scale: 1 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", scale: 2 }} type="joker" />
    <JamlGameCard card={{ name: "Joker", scale: 3 }} type="joker" />
  </div>
);

export const HoverTilt = /* Hover Tilt */ () => (
  <JamlGameCard card={{ name: "Joker", scale: 2 }} type="joker" hoverTilt />
);

export const UnknownName = /* Unknown Name */ () => (
  <JamlGameCard card={{ name: "Not A Real Joker", scale: 2 }} type="joker" />
);

export const Voucher = () => <JamlVoucher voucherName="Overstock" scale={2} />;

export const Tag = () => <JamlTag tagName="Rare Tag" scale={2} />;

export const Boss = () => <JamlBoss bossName="The Wall" scale={2} />;
