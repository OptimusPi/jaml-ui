"use client";

import React, { useMemo } from "react";
import { JamlBoss, JamlGameCard, JamlTag, JamlVoucher } from "./GameCard.js";
import { extractVisualJamlItems, type JamlPreviewItem, type JamlPreviewSection } from "../utils/jamlMapPreview.js";

export interface JamlMapPreviewProps {
  jaml: string;
  className?: string;
  title?: string;
  emptyMessage?: string;
  cardScale?: number;
  tagScale?: number;
  bossScale?: number;
}

const SECTION_ORDER: JamlPreviewSection[] = ["must", "should", "mustNot"];

const SECTION_LABELS: Record<JamlPreviewSection, string> = {
  must: "Must Requirements",
  should: "Should Requirements",
  mustNot: "Must Not Requirements",
};

const SECTION_ACCENTS: Record<JamlPreviewSection, { color: string; border: string; panel: string }> = {
  must: { color: "#ff6b6b", border: "rgba(255,107,107,0.35)", panel: "rgba(255,107,107,0.08)" },
  should: { color: "#f7b955", border: "rgba(247,185,85,0.35)", panel: "rgba(247,185,85,0.08)" },
  mustNot: { color: "#8d7dff", border: "rgba(141,125,255,0.35)", panel: "rgba(141,125,255,0.08)" },
};

function renderPreviewItem(item: JamlPreviewItem, cardScale: number, tagScale: number, bossScale: number) {
  switch (item.visualType) {
    case "joker":
      return <JamlGameCard card={{ name: item.value, scale: cardScale }} type="joker" />;
    case "consumable":
      return <JamlGameCard card={{ name: item.value, scale: cardScale }} type="consumable" />;
    case "voucher":
      return <JamlVoucher voucherName={item.value} scale={cardScale} />;
    case "tag":
      return <JamlTag tagName={item.value} scale={tagScale} />;
    case "boss":
      return <JamlBoss bossName={item.value} scale={bossScale} />;
    default:
      return null;
  }
}

export function JamlMapPreview({
  jaml,
  className = "",
  title = "JAML Map Preview",
  emptyMessage = "No visual JAML clauses found yet.",
  cardScale = 0.8,
  tagScale = 1.1,
  bossScale = 1.1,
}: JamlMapPreviewProps) {
  const groups = useMemo(() => extractVisualJamlItems(jaml), [jaml]);
  const totalItems = SECTION_ORDER.reduce((sum, section) => sum + groups[section].length, 0);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        color: "#f5f5f5",
        borderRadius: 20,
        border: "1px solid rgba(152,152,192,0.18)",
        background: "linear-gradient(180deg, rgba(28,26,52,0.96) 0%, rgba(18,16,36,0.96) 100%)",
        boxShadow: "0 14px 32px rgba(0,0,0,0.16)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, opacity: 0.74, maxWidth: 520 }}>
            Preview the visual targets described directly in your JAML without running a full search.
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            border: "1px solid rgba(141,125,255,0.3)",
            background: "rgba(141,125,255,0.12)",
            padding: "6px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "#c8bcff",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span>{totalItems}</span>
          <span>{totalItems === 1 ? "visual target" : "visual targets"}</span>
        </div>
      </div>

      {totalItems === 0 ? (
        <div
          style={{
            border: "1px dashed rgba(152,152,192,0.28)",
            borderRadius: 16,
            padding: 16,
            fontSize: 12,
            opacity: 0.72,
            background: "rgba(255,255,255,0.035)",
          }}
        >
          {emptyMessage}
        </div>
      ) : null}

      {SECTION_ORDER.map((section) => {
        const items = groups[section];
        if (items.length === 0) return null;

        const accent = SECTION_ACCENTS[section];

        return (
          <section
            key={section}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderRadius: 18,
              border: `1px solid ${accent.border}`,
              background: `linear-gradient(180deg, ${accent.panel} 0%, rgba(255,255,255,0.02) 100%)`,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 18,
                  borderRadius: 999,
                  background: accent.color,
                }}
              />
              <div style={{ fontSize: 12, fontWeight: 700, color: accent.color }}>{SECTION_LABELS[section]}</div>
              <div
                style={{
                  marginLeft: "auto",
                  borderRadius: 999,
                  padding: "3px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: accent.color,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {items.length}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 96,
                    padding: 12,
                    borderRadius: 16,
                    border: `1px solid ${accent.border}`,
                    background: "rgba(10,10,20,0.24)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                  title={`${item.clauseKey}: ${item.value}`}
                >
                  <div style={{ minHeight: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {renderPreviewItem(item, cardScale, tagScale, bossScale)}
                  </div>
                  <div style={{ fontSize: 11, textAlign: "center", lineHeight: 1.35, fontWeight: 600 }}>{item.value}</div>
                  <div style={{ fontSize: 10, opacity: 0.62, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.clauseKey}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div
        style={{
          borderRadius: 16,
          border: "1px dashed rgba(141,125,255,0.28)",
          background: "rgba(141,125,255,0.08)",
          padding: 14,
          fontSize: 11,
          lineHeight: 1.5,
          opacity: 0.84,
        }}
      >
        This preview shows direct visual targets that can be read from the JAML text itself. Advanced scoring logic,
        positional constraints, nested groups, and runtime-only search behavior are not fully represented here yet.
      </div>
    </div>
  );
}
