"use client";
import React, { useState, useMemo } from "react";
import { JokerRarityTier } from "./jokerRarity.js";
import {
  isLegendaryJokerName,
  jokerRarityOf,
  rarityClauseKey,
  type JokerRarityName,
} from "../../vocab.js";
import { JimboSprite } from "../../ui/sprites.js";
import { JimboText } from "../../ui/jimboText.js";
import { JimboTextInput } from "../../ui/JimboTextInput.js";
import {
  JimboPicker,
  JimboPickerSection,
  JimboPickerGrid,
  JimboPickerItem,
  JimboPickerSearch,
  JimboPickerEmpty,
} from "../../ui/JimboPicker.js";
import { JOKERS, type SpriteEntry } from "../../sprites/spriteData.js";
import type { SlotSelection } from "./MysterySlot.js";

// JokerRarity re-aliases the local rarity tier — kept for public-API stability.
export type JokerRarity = JokerRarityTier;

// Rarity membership, name normalization and the engine-key aliases all live in
// src/vocab.ts — the single place engine vocabulary enters this package, guarded
// against upstream drift by scripts/check-vocab-drift.mjs. All this module owns
// is the mapping from the engine's rarity name onto the local UI tier enum.
const RARITY_TIERS: Record<JokerRarityName, JokerRarityTier> = {
  Common: JokerRarityTier.Common,
  Uncommon: JokerRarityTier.Uncommon,
  Rare: JokerRarityTier.Rare,
  Legendary: JokerRarityTier.Legendary,
};

const getJokerRarity = (name: string): JokerRarityTier => RARITY_TIERS[jokerRarityOf(name)];

const isLegendaryJoker = (joker: SpriteEntry): boolean => isLegendaryJokerName(joker.name);
const LEGENDARY_LIST = JOKERS.filter(isLegendaryJoker);
const NON_LEGENDARY = JOKERS.filter((joker) => !isLegendaryJoker(joker));

export interface JokerPickerProps {
  onSelect: (selection: SlotSelection) => void;
  onCancel?: () => void;
}

export function JokerPicker({ onSelect }: JokerPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return NON_LEGENDARY;
    const q = search.toLowerCase();
    return JOKERS.filter((j) => j.name.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (joker: SpriteEntry) => {
    onSelect({
      category: "joker",
      value: joker.name,
      clauseKey: rarityClauseKey(jokerRarityOf(joker.name)),
      rarity: getJokerRarity(joker.name),
    });
  };

  const renderJoker = (joker: SpriteEntry) => {
    return (
      <JimboPickerItem
        key={joker.name}
        onClick={() => handleSelect(joker)}
        title={joker.name}
      >
        <JimboSprite name={joker.name} sheet="Jokers" width={48} />
        <JimboText size="micro" tone="white" className="j-picker__item-label">
          {joker.name}
        </JimboText>
      </JimboPickerItem>
    );
  };

  return (
    <JimboPicker>
      <JimboPickerSection>
        <JimboText size="micro" tone="white" className="j-picker__section-title">Legendary</JimboText>
        <JimboPickerGrid legendary>
          {LEGENDARY_LIST.map(renderJoker)}
        </JimboPickerGrid>
      </JimboPickerSection>

      <JimboPickerSearch>
        <JimboTextInput
          className="j-picker__search-field"
          type="text"
          placeholder="Search jokers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </JimboPickerSearch>

      <JimboPickerGrid scroll>
        {filtered.map(renderJoker)}
        {filtered.length === 0 && (
          <JimboPickerEmpty>
            <JimboText size="sm" tone="grey">No jokers match "{search}"</JimboText>
          </JimboPickerEmpty>
        )}
      </JimboPickerGrid>
    </JimboPicker>
  );
}
