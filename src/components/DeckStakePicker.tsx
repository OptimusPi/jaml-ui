"use client";

import { Vocab } from "jaml-lang";
import { DeckSprite } from "./DeckSprite.js";
import { JimboPanelSpinner } from "../ui/JimboPanelSpinner.js";
import { JimboStack } from "../ui/JimboLayout.js";

const DECKS = Vocab.Enums.MotelyDeck;
const STAKES = Vocab.Enums.MotelyStake;

function cycle(list: readonly string[], value: string, dir: -1 | 1): string {
  const i = list.indexOf(value);
  const start = i < 0 ? 0 : i;
  return list[(start + dir + list.length) % list.length]!;
}

export interface DeckStakePickerProps {
  deck: string;
  stake: string;
  onDeckChange: (deck: string) => void;
  onStakeChange: (stake: string) => void;
  className?: string;
}

/** New-run deck + stake cyclers. Sprites from the atlas, names from Motely enums. */
export function DeckStakePicker({
  deck,
  stake,
  onDeckChange,
  onStakeChange,
  className = "",
}: DeckStakePickerProps) {
  return (
    <JimboStack gap="md" className={className} align="center">
      <JimboPanelSpinner
        label="Deck"
        title={deck}
        media={<DeckSprite deck={deck} stake={stake} size={64} />}
        onPrev={() => onDeckChange(cycle(DECKS, deck, -1))}
        onNext={() => onDeckChange(cycle(DECKS, deck, 1))}
      />
      <JimboPanelSpinner
        label="Stake"
        title={stake}
        media={<DeckSprite deck={deck} stake={stake} size={64} />}
        onPrev={() => onStakeChange(cycle(STAKES, stake, -1))}
        onNext={() => onStakeChange(cycle(STAKES, stake, 1))}
      />
    </JimboStack>
  );
}

export { DECKS as DECK_PICKER_NAMES, STAKES as STAKE_PICKER_NAMES };
