"use client";

// TODO(jimbo-primitives): pre-dates no-inline-style / no-token-in-jsx-style /
// no-inline-component rules. Refactor to compose from Jimbo* primitives once


import React, { useState, useCallback, useEffect, useRef } from "react";
import { MysterySlot, type SlotSelection, type JamlZone, type SlotCategory } from "./MysterySlot.js";
import { JokerPicker } from "./JokerPicker.js";
import { JimboBox } from "../../ui/JimboBox.js";
import {
  CategoryPicker,
  VOUCHER_PICKER_CONFIG,
  TAG_PICKER_CONFIG,
  BOSS_PICKER_CONFIG,
  TAROT_PICKER_CONFIG,
  PLANET_PICKER_CONFIG,
  SPECTRAL_PICKER_CONFIG,
  PACK_PICKER_CONFIG,
} from "./CategoryPicker.js";
import { JimboInnerPanel, JimboModal, type JimboTone } from "../../ui/panel.js";
import { JimboText } from "../../ui/jimboText.js";
import { JimboSprite } from "../../ui/sprites.js";
import { type SpriteSheetType } from "../../sprites/spriteMapper.js";
import { JimboTabs } from "../../ui/jimboTabs.js";
import { JimboListItem } from "../../ui/JimboListItem.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JamlMapEditorProps {
  /** Initial zone for the demo. */
  zone?: JamlZone;
  /** Callback when selections change. Returns JAML string. */
  onChange?: (jamlString: string) => void;
}

type PickerFlow = "category" | "joker" | SlotCategory;

interface ActiveSlot {
  ante: number;
  id: string;
  forceCategory?: SlotCategory;
}

export interface MapSlotSelection extends SlotSelection {
  zone: JamlZone;
}

type AnteSelections = Record<string, MapSlotSelection>;

// ─── Category menu items ─────────────────────────────────────────────────────


interface CategoryOption {
  key: SlotCategory;
  label: string;
  sprite: string;
  sheet: SpriteSheetType;
  tone: JimboTone;
  hint: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: "joker",    label: "Joker",         sprite: "Joker",        sheet: "Jokers",   tone: "blue",     hint: "Shop, Buffoon Pack" },
  { key: "voucher",  label: "Voucher",       sprite: "Blank",        sheet: "Vouchers", tone: "orange",     hint: "1 per Ante in shop" },
  { key: "tarot",    label: "Tarot Card",    sprite: "The Fool",     sheet: "Tarots",   tone: "tarot",    hint: "Arcana Pack, shop" },
  { key: "planet",   label: "Planet Card",   sprite: "Mercury",      sheet: "Tarots",   tone: "planet",   hint: "Celestial Pack, shop" },
  { key: "spectral", label: "Spectral Card", sprite: "Grim",         sheet: "Tarots",   tone: "spectral", hint: "Ghost Deck, Spectral Pack" },
  { key: "tag",      label: "Tag",           sprite: "Uncommon Tag", sheet: "tags",     tone: "green",    hint: "Skip blind reward" },
  { key: "boss",     label: "Boss Blind",    sprite: "The Hook",     sheet: "BlindChips",tone: "red",      hint: "End of each Ante" },
  { key: "pack",     label: "Booster Pack",  sprite: "Arcana Pack",  sheet: "Boosters", tone: "orange",   hint: "Arcana, Celestial, etc." },
];



const CATEGORY_CONFIG_MAP: Record<SlotCategory, typeof VOUCHER_PICKER_CONFIG> = {
  joker:    VOUCHER_PICKER_CONFIG,
  voucher:  VOUCHER_PICKER_CONFIG,
  tag:      TAG_PICKER_CONFIG,
  boss:     BOSS_PICKER_CONFIG,
  tarot:    TAROT_PICKER_CONFIG,
  planet:   PLANET_PICKER_CONFIG,
  spectral: SPECTRAL_PICKER_CONFIG,
  pack:     PACK_PICKER_CONFIG,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function JamlMapEditor({
  zone: initialZone = "must",
  onChange,
}: JamlMapEditorProps) {
  const [currentZone, setCurrentZone] = useState<JamlZone>(initialZone);
  const [antesState, setAntesState] = useState<Record<number, AnteSelections>>({});
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);
  const [pickerFlow, setPickerFlow] = useState<PickerFlow>("category");

  const handleSlotTap = useCallback((anteIndex: number, id: string, forceCategory?: SlotCategory) => {
    setActiveSlot({ ante: anteIndex, id, forceCategory });
    setPickerFlow(forceCategory || "category");
  }, []);

  const handleSlotClear = useCallback((anteIndex: number, id: string) => {
    setAntesState((prev) => {
      const next = { ...prev };
      if (!next[anteIndex]) return next;
      const nextAnte = { ...next[anteIndex] };
      delete nextAnte[id];
      next[anteIndex] = nextAnte;
      onChange?.(buildJamlText(next));
      return next;
    });
  }, [onChange]);

  const handleCategorySelect = useCallback((cat: SlotCategory) => {
    setPickerFlow(cat);
  }, []);

  const handleItemSelect = useCallback((selection: SlotSelection) => {
    if (!activeSlot) return;
    setAntesState((prev) => {
      const next = { ...prev };
      const nextAnte = { ...(next[activeSlot.ante] || {}) };
      nextAnte[activeSlot.id] = { ...selection, zone: currentZone };
      next[activeSlot.ante] = nextAnte;
      onChange?.(buildJamlText(next));
      return next;
    });
    setActiveSlot(null);
  }, [activeSlot, currentZone, onChange]);

  const handlePickerCancel = useCallback(() => {
    if (activeSlot?.forceCategory) {
      setActiveSlot(null);
    } else if (pickerFlow !== "category") {
      setPickerFlow("category");
    } else {
      setActiveSlot(null);
    }
  }, [activeSlot, pickerFlow]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to Ante 1 on mount — game starts there, Ante 0 is pre-game.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.children[1] as HTMLElement | undefined;
    if (firstChild) el.scrollTop = firstChild.offsetTop;
  }, []);

  const renderSlot = (anteIndex: number, id: string, width: number, sheetType: SpriteSheetType, forceCategory?: SlotCategory) => {
    const sel = (antesState[anteIndex] || {})[id];
    return (
      <MysterySlot
        key={id}
        zone={sel ? sel.zone : currentZone}
        sheetType={sheetType}
        selection={sel}
        width={width}
        onTap={() => handleSlotTap(anteIndex, id, forceCategory)}
        onClear={sel ? () => handleSlotClear(anteIndex, id) : undefined}
      />
    );
  };

  return (
    <JimboBox className="j-jaml-map-editor">
      {/* Zone Toggle Header */}
      <JimboBox className="j-jaml-map-editor__header">
        <JimboText size="md" tone="white" className="j-jaml-map-editor__title">Jaml Visual Builder</JimboText>
        <JimboTabs
          tabs={[
            { id: "must", label: "Must" },
            { id: "should", label: "Should" },
            { id: "mustnot", label: "Must Not" },
          ]}
          activeTab={currentZone}
          onTabChange={(tabId) => setCurrentZone(tabId as JamlZone)}
        />
      </JimboBox>

      {/* Map Layout - Vertical Scrolling Antes */}
      <JimboBox ref={scrollRef} className="j-jaml-map-editor__scroll hide-scrollbar">
        {Array.from({ length: 40 }, (_, i) => i).map((a) => (
          <JimboBox key={a} className="j-jaml-map-editor__ante">
            <JimboInnerPanel className="j-jaml-map-editor__ante-panel">
              <JimboText size="lg" tone="white" className="j-jaml-map-editor__ante-title">Ante {a}</JimboText>

              {/* Row 1: Blinds & Tags & Voucher */}
              <JimboBox className="j-row j-row--justify-between j-row--align-end j-jaml-map-editor__row">
                <JimboBox className="j-stack j-stack--align-center j-stack--gap-xs">
                  <JimboText size="xs" tone="grey">Voucher</JimboText>
                  {renderSlot(a, `ante_${a}_voucher`, 42, "Vouchers", "voucher")}
                </JimboBox>
                <JimboBox className="j-stack j-stack--align-center j-stack--gap-xs">
                  <JimboText size="xs" tone="grey">Small</JimboText>
                  {renderSlot(a, `ante_${a}_tag_small`, 42, "tags", "tag")}
                </JimboBox>
                <JimboBox className="j-stack j-stack--align-center j-stack--gap-xs">
                  <JimboText size="xs" tone="grey">Big</JimboText>
                  {renderSlot(a, `ante_${a}_tag_big`, 42, "tags", "tag")}
                </JimboBox>
                <JimboBox className="j-stack j-stack--align-center j-stack--gap-xs">
                  <JimboText size="xs" tone="grey">Boss</JimboText>
                  {renderSlot(a, `ante_${a}_boss`, 42, "BlindChips", "boss")}
                </JimboBox>
              </JimboBox>

              {/* Row 2: Shop Items */}
              <JimboBox className="j-stack j-stack--gap-xs">
                <JimboText size="sm" tone="grey" className="j-jaml-map-editor__section-title">Shop Items</JimboText>
                <JimboBox className="j-row hide-scrollbar j-row--gap-sm j-jaml-map-editor__shop-row">
                  {[1,2,3,4,5,6,7,8].map(i => renderSlot(a, `ante_${a}_shop_${i}`, 52, "Jokers"))}
                </JimboBox>
              </JimboBox>

              {/* Row 3: Packs */}
              <JimboBox className="j-stack j-stack--gap-xs">
                <JimboText size="sm" tone="grey" className="j-jaml-map-editor__section-title">Packs</JimboText>
                <JimboBox className="j-row j-row--gap-sm j-jaml-map-editor__pack-row">
                  {[1,2,3,4,5,6].map(i => renderSlot(a, `ante_${a}_pack_${i}`, 64, "Boosters", "pack"))}
                </JimboBox>
              </JimboBox>
            </JimboInnerPanel>
          </JimboBox>
        ))}
      </JimboBox>

      {/* Picker overlay */}
      <JimboModal
        open={activeSlot !== null}
        onClose={handlePickerCancel}
        title={
          pickerFlow === "category"
            ? "Select Category"
            : pickerFlow === "joker"
            ? "Select Joker"
            : CATEGORY_CONFIG_MAP[pickerFlow as SlotCategory]?.title ?? "Select Item"
        }
        className="j-picker-modal"
      >
        {activeSlot !== null && (
          pickerFlow === "category" ? (
            <CategoryMenu onSelect={handleCategorySelect} />
          ) : pickerFlow === "joker" ? (
            <JokerPicker
              onSelect={handleItemSelect}
              onCancel={handlePickerCancel}
            />
          ) : (
            <CategoryPicker
              config={CATEGORY_CONFIG_MAP[pickerFlow as SlotCategory]}
              onSelect={handleItemSelect}
              onCancel={handlePickerCancel}
            />
          )
        )}
      </JimboModal>
    </JimboBox>
  );
}

// ─── Category Selection Menu ─────────────────────────────────────────────────

export function CategoryMenu({
  onSelect,
}: {
  onSelect: (cat: SlotCategory) => void;
}) {
  return (
    <JimboBox className="j-category-menu hide-scrollbar">
      {CATEGORIES.map((cat) => (
        <JimboListItem
          key={cat.key}
          onClick={() => onSelect(cat.key)}
        >
          <JimboBox className="j-category-menu__item">
            <JimboSprite name={cat.sprite} sheet={cat.sheet} width={32} />
            <JimboBox className="j-category-menu__text">
              <JimboText size="sm" tone="white">{cat.label}</JimboText>
              <JimboText size="micro" tone="grey">{cat.hint}</JimboText>
            </JimboBox>
          </JimboBox>
        </JimboListItem>
      ))}
    </JimboBox>
  );
}

// ─── Build JAML text from slots ──────────────────────────────────────────────

function buildJamlText(antes: Record<number, AnteSelections>): string {
  const byZone: Record<JamlZone, Record<string, { value: string; antes: number[] }[]>> = {
    must: {}, should: {}, mustnot: {}
  };

  for (const [anteStr, selections] of Object.entries(antes)) {
    const anteNum = parseInt(anteStr, 10);
    for (const sel of Object.values(selections)) {
      const zone = sel.zone;
      const key = sel.clauseKey;
      
      if (!byZone[zone][key]) {
        byZone[zone][key] = [];
      }
      
      const existing = byZone[zone][key].find(item => item.value === sel.value);
      if (existing) {
        if (!existing.antes.includes(anteNum)) existing.antes.push(anteNum);
      } else {
        byZone[zone][key].push({ value: sel.value, antes: [anteNum] });
      }
    }
  }

  const lines: string[] = [];
  lines.push("name: My Custom Seed Map");
  lines.push("author: JamlBuilder");
  lines.push("description: Auto-generated from the visual editor.");
  lines.push("deck: Red");
  lines.push("stake: White");

  for (const [zone, label] of [["must", "must"], ["should", "should"], ["mustnot", "mustNot"]] as const) {
    const clauses = byZone[zone as JamlZone];
    if (Object.keys(clauses).length === 0) continue;
    
    lines.push(`${label}:`);
    for (const [key, items] of Object.entries(clauses)) {
      for (const item of items) {
        lines.push(`  - ${key}: ${item.value}`);
        // Only emit `antes:` if it's not all 8 antes (simplification, or just emit it)
        if (item.antes.length < 8) {
          lines.push(`    antes: [${item.antes.sort((a,b)=>a-b).join(", ")}]`);
        }
      }
    }
  }

  return lines.join("\n") + "\n";
}
