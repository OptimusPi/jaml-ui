import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { DeckSprite, DECK_SPRITE_POS } from "./DeckSprite.js";
import { JimboRow } from "../ui/JimboLayout.js";
import { JimboSpinner } from "../ui/JimboSpinner.js";
import { JimboStack } from "../ui/JimboLayout.js";
import { JimboText } from "../ui/jimboText.js";

const meta: Meta<typeof DeckSprite> = {
  title: "Primitives/Cards/DeckSprite",
  component: DeckSprite,
};
export default meta;
type Story = StoryObj<typeof DeckSprite>;

const DECKS = Object.keys(DECK_SPRITE_POS);

export const NewRun: Story = {
  name: "Pick a deck for a new search",
  render: () => {
    const [i, setI] = useState(DECKS.indexOf("red") === -1 ? 0 : DECKS.indexOf("red"));
    const deck = DECKS[i];
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboText size="sm" tone="grey">
          New run
        </JimboText>
        <JimboStack gap="md" align="center">
          <DeckSprite deck={deck} stake="white" size={142} />
          <JimboSpinner
            label="Deck"
            value={deck}
            onPrev={() => setI((n) => (n - 1 + DECKS.length) % DECKS.length)}
            onNext={() => setI((n) => (n + 1) % DECKS.length)}
          />
        </JimboStack>
      </StoryScene>
    );
  },
};

export const GoldStake: Story = {
  name: "Plasma on gold stake",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboStack gap="sm" align="center">
        <DeckSprite deck="plasma" stake="gold" size={142} />
        <JimboText size="sm" tone="gold">
          Plasma · Gold Stake
        </JimboText>
      </JimboStack>
    </StoryScene>
  ),
};

export const StakeLadder: Story = {
  name: "Stake chip on the same Red Deck",
  render: () => (
    <StoryScene title="Filter" tone="blue" variant="page">
      <JimboRow gap="md">
        {["white", "red", "green", "black", "gold"].map((stake) => (
          <JimboStack key={stake} gap="xs" align="center">
            <DeckSprite deck="red" stake={stake} size={71} />
            <JimboText size="xs" tone="grey">
              {stake}
            </JimboText>
          </JimboStack>
        ))}
      </JimboRow>
    </StoryScene>
  ),
};
