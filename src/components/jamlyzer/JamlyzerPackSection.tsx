"use client";

import type { MotelyJamlyzerAnteResult } from "motely-wasm";
import { JimboText } from "../../ui/jimboText.js";
import { JimboBox } from "../../ui/JimboBox.js";
import { packDisplayName } from "./names.js";
import { JamlyzerItemCard } from "./JamlyzerItemCard.js";

export interface JamlyzerPackSectionProps {
  pack: MotelyJamlyzerAnteResult["packs"][number];
}

export function JamlyzerPackSection({ pack }: JamlyzerPackSectionProps) {
  return (
    <JimboBox className="j-jamlyzer-pack-line">
      <JimboText size="xs" tone="grey">
        {packDisplayName(pack.pack)}:
      </JimboText>
      <JimboBox className="j-shop-belt hide-scrollbar">
        {pack.items.map((item, i) => (
          <JamlyzerItemCard key={i} item={item} />
        ))}
      </JimboBox>
    </JimboBox>
  );
}
