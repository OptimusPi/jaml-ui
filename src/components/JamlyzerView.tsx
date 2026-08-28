"use client";

import { useMemo, useState } from "react";
import type { MotelyJamlyzerSeedResult } from "motely-wasm";
import { MotelyDeck, MotelyStake } from "motely-wasm";
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboStack, JimboRow } from "../ui/JimboLayout.js";
import { JimboSeedCopyChip } from "../ui/JimboSeedCopyChip.js";
import { JimboSpinner } from "../ui/JimboSpinner.js";
import { JamlVoucher, JamlTag, JamlBoss } from "./GameCard.js";
import {
  bossDisplayName,
  tagDisplayName,
  voucherDisplayName,
  deckDisplayName,
  stakeDisplayName,
} from "./jamlyzer/names.js";
import { JamlyzerItemCard } from "./jamlyzer/JamlyzerItemCard.js";
import { JamlyzerPackSection } from "./jamlyzer/JamlyzerPackSection.js";

export interface JamlyzerViewProps {
  result: MotelyJamlyzerSeedResult;
  deck?: MotelyDeck;
  stake?: MotelyStake;
  maxAnte?: number;
}

export function JamlyzerView({
  result,
  deck,
  stake,
  maxAnte: maxAnteProp,
}: JamlyzerViewProps) {
  const maxAnte = maxAnteProp ?? 39;
  const [selectedAnte, setSelectedAnte] = useState<number>(() => result.antes[0]?.ante ?? 1);

  const ante = useMemo(
    () => result.antes.find((a) => a.ante === selectedAnte) ?? result.antes[0],
    [result.antes, selectedAnte],
  );

  if (!ante) {
    return (
      <JimboPanel body>
        <JimboText tone="grey">No ante data for seed {result.seed}.</JimboText>
      </JimboPanel>
    );
  }

  const smallTag = tagDisplayName(ante.smallBlindTag);
  const bigTag = tagDisplayName(ante.bigBlindTag);
  const boss = bossDisplayName(ante.boss);
  const voucher = voucherDisplayName(ante.voucher);

  return (
    <JimboPanel body={false} className="j-jamlyzer-view">
      <JimboStack gap="md" align="stretch">
        <JimboSpinner
          value={`Ante ${selectedAnte}`}
          onPrev={() => setSelectedAnte(Math.max(0, selectedAnte - 1))}
          onNext={() => setSelectedAnte(Math.min(maxAnte, selectedAnte + 1))}
          canPrev={selectedAnte > 0}
          canNext={selectedAnte < maxAnte}
        />

        <JimboRow gap="md" align="center">
          <JimboSeedCopyChip value={result.seed} />
          <JimboText size="xs" tone="gold">
            {result.score}
          </JimboText>
          {deck !== undefined && (
            <JimboText size="xs" tone="grey">
              {deckDisplayName(deck)}
            </JimboText>
          )}
          {stake !== undefined && (
            <JimboText size="xs" tone="grey">
              {stakeDisplayName(stake)}
            </JimboText>
          )}
        </JimboRow>

        <JimboBox className="j-jamlyzer-ante-head">
          <JimboStack gap="xs" align="center">
            <JimboText size="micro" tone="grey">Voucher</JimboText>
            <JamlVoucher voucherName={voucher} scale={0.7} />
            <JimboText size="micro" className="j-text-center">{voucher}</JimboText>
          </JimboStack>
          <JimboStack gap="xs" align="center">
            <JimboText size="micro" tone="grey">Boss</JimboText>
            <JamlBoss bossName={boss} scale={0.55} />
            <JimboText size="micro" className="j-text-center">{boss}</JimboText>
          </JimboStack>
          <JimboStack gap="xs" align="center">
            <JimboText size="micro" tone="grey">Tags</JimboText>
            <JimboRow gap="sm" align="end">
              <JimboStack gap="xs" align="center">
                <JamlTag tagName={smallTag} scale={0.55} />
                <JimboText size="micro" className="j-text-center">{smallTag}</JimboText>
              </JimboStack>
              <JimboStack gap="xs" align="center">
                <JamlTag tagName={bigTag} scale={0.55} />
                <JimboText size="micro" className="j-text-center">{bigTag}</JimboText>
              </JimboStack>
            </JimboRow>
          </JimboStack>
        </JimboBox>

        {ante.shopItems.length > 0 ? (
          <JimboBox className="j-shop-belt hide-scrollbar">
            {ante.shopItems.map((item, i) => (
              <JamlyzerItemCard key={i} item={item} />
            ))}
          </JimboBox>
        ) : null}

        {ante.packs.length > 0 ? (
          <JimboStack gap="sm" align="stretch">
            <JimboText size="sm" tone="white">Packs</JimboText>
            {ante.packs.map((pack, i) => (
              <JamlyzerPackSection key={i} pack={pack} />
            ))}
          </JimboStack>
        ) : null}
      </JimboStack>
    </JimboPanel>
  );
}
