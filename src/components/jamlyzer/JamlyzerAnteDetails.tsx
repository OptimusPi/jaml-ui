"use client";

import type { MotelyJamlyzerAnteResult } from "motely-wasm";
import { JimboInnerPanel } from "../../ui/panel.js";
import { JimboText } from "../../ui/jimboText.js";
import { JimboBadge } from "../../ui/JimboBadge.js";
import { JimboStack, JimboRow } from "../../ui/JimboLayout.js";
import { JimboBox } from "../../ui/JimboBox.js";
import { JimboSpinner } from "../../ui/JimboSpinner.js";
import { MOTELY_ITEM_FORMATS_BY_VALUE } from "../../decode/motelyItemFormats.js";
import {
  bossDisplayName,
  voucherDisplayName,
  tagDisplayName,
  packDisplayName,
} from "./names.js";
import {
  JamlBoss,
  JamlVoucher,
  JamlTag,
  JamlGameCard,
  resolveAnalyzerShopItem,
  type AnalyzerResolvedItem,
} from "../GameCard.js";

function getResolvedItem(value: number, scale = 0.5): AnalyzerResolvedItem {
  const format = MOTELY_ITEM_FORMATS_BY_VALUE[value as keyof typeof MOTELY_ITEM_FORMATS_BY_VALUE];
  if (format) {
    return resolveAnalyzerShopItem(
      {
        id: String(value),
        name: format.displayName,
        value: value,
      },
      scale
    );
  }
  return { kind: "unknown", label: `Unknown #${value}` };
}

function itemCaption(value: number): string {
  const format = MOTELY_ITEM_FORMATS_BY_VALUE[value as keyof typeof MOTELY_ITEM_FORMATS_BY_VALUE];
  return format?.displayName ?? `#${value}`;
}

export function LabeledItem({ value, scale }: { value: number; scale: number }) {
  return (
    <JimboStack gap="xs" align="center">
      <ResolvedItem value={value} scale={scale} />
      <JimboText size="micro" tone="white" className="j-text-center">
        {itemCaption(value)}
      </JimboText>
    </JimboStack>
  );
}

export function ResolvedItem({ value, scale }: { value: number; scale: number }) {
  const resolved = getResolvedItem(value, scale);
  if (resolved.kind === "voucher") {
    return <JamlVoucher voucherName={resolved.voucherName} scale={scale} />;
  }
  if (resolved.kind === "joker" || resolved.kind === "consumable" || resolved.kind === "playing") {
    return <JamlGameCard card={resolved.card} type={resolved.type} />;
  }
  if (resolved.kind === "unknown") {
    return (
      <JimboBadge size="md" tone="grey" title={resolved.label}>
        ?
      </JimboBadge>
    );
  }
  return (
    <JimboBadge size="md" tone="grey" title="Unrecognized item">
      ?
    </JimboBadge>
  );
}

export interface JamlyzerAnteDetailsProps {
  ante: MotelyJamlyzerAnteResult | undefined;
  selectedAnte: number;
  minAnte: number;
  maxAnte: number;
  onSelectAnte: (ante: number) => void;
}

/** Spinner-driven single-ante detail: boss, voucher, tags, shop queue, packs. */
export function JamlyzerAnteDetails({
  ante,
  selectedAnte,
  minAnte,
  maxAnte,
  onSelectAnte,
}: JamlyzerAnteDetailsProps) {
  return (
    <JimboInnerPanel className="j-jamlyzer__details">
      <JimboSpinner
        value={`Ante ${selectedAnte}`}
        onPrev={() => onSelectAnte(Math.max(minAnte, selectedAnte - 1))}
        onNext={() => onSelectAnte(Math.min(maxAnte, selectedAnte + 1))}
        canPrev={selectedAnte > minAnte}
        canNext={selectedAnte < maxAnte}
      />

      {!ante ? (
        <JimboText size="xs" tone="grey" className="j-text-center">
          No analysis for Ante {selectedAnte}
        </JimboText>
      ) : (
        <JimboStack gap="md" align="stretch">
          <JimboBox className="j-jamlyzer-ante-head">
            <JimboStack gap="xs" align="center">
              <JimboText size="micro" tone="grey">Voucher</JimboText>
              <JamlVoucher voucherName={voucherDisplayName(ante.voucher)} scale={0.7} />
              <JimboText size="micro" className="j-text-center">
                {voucherDisplayName(ante.voucher)}
              </JimboText>
            </JimboStack>
            <JimboStack gap="xs" align="center">
              <JimboText size="micro" tone="grey">Boss</JimboText>
              <JamlBoss bossName={bossDisplayName(ante.boss)} scale={0.55} />
              <JimboText size="micro" className="j-text-center">
                {bossDisplayName(ante.boss)}
              </JimboText>
            </JimboStack>
            <JimboStack gap="xs" align="center">
              <JimboText size="micro" tone="grey">Tags</JimboText>
              <JimboRow gap="sm" align="end">
                <JimboStack gap="xs" align="center">
                  <JamlTag tagName={tagDisplayName(ante.smallBlindTag)} scale={0.55} />
                  <JimboText size="micro" className="j-text-center">
                    {tagDisplayName(ante.smallBlindTag)}
                  </JimboText>
                </JimboStack>
                <JimboStack gap="xs" align="center">
                  <JamlTag tagName={tagDisplayName(ante.bigBlindTag)} scale={0.55} />
                  <JimboText size="micro" className="j-text-center">
                    {tagDisplayName(ante.bigBlindTag)}
                  </JimboText>
                </JimboStack>
              </JimboRow>
            </JimboStack>
          </JimboBox>

          {ante.shopItems && ante.shopItems.length > 0 ? (
            <JimboBox className="j-shop-belt hide-scrollbar">
              {ante.shopItems.map((item, idx) => (
                <LabeledItem key={idx} value={item.value} scale={0.85} />
              ))}
            </JimboBox>
          ) : (
            <JimboText size="xs" tone="grey">Empty shop</JimboText>
          )}

          <JimboText size="sm" tone="white">Packs</JimboText>
          {ante.packs && ante.packs.length > 0 ? (
            <JimboStack gap="sm" align="stretch">
              {ante.packs.map((pack, packIdx) => (
                <JimboBox key={packIdx} className="j-jamlyzer-pack-line">
                  <JimboText size="xs" tone="grey">
                    {packDisplayName(pack.pack)}:
                  </JimboText>
                  <JimboBox className="j-shop-belt hide-scrollbar">
                    {pack.items.map((item, itemIdx) => (
                      <LabeledItem key={itemIdx} value={item.value} scale={0.7} />
                    ))}
                  </JimboBox>
                </JimboBox>
              ))}
            </JimboStack>
          ) : (
            <JimboText size="xs" tone="grey">No packs</JimboText>
          )}
        </JimboStack>
      )}
    </JimboInnerPanel>
  );
}
