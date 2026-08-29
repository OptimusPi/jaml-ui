import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { DeckSprite } from "../components/DeckSprite.js";
import { JimboSpinner } from "./JimboSpinner.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboSpinner> = {
  title: "Primitives/Display/JimboSpinner",
  component: JimboSpinner,
};
export default meta;
type Story = StoryObj<typeof JimboSpinner>;

const DECKS = ["Red", "Blue", "Yellow", "Green", "Black"] as const;

export const NewRunDeck: Story = {
  name: "Pick a deck for a new search",
  render: () => {
    const [i, setI] = useState(0);
    const deck = DECKS[i];
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboText size="sm" tone="grey">
          New run
        </JimboText>
        <JimboStack gap="md" align="center">
          <DeckSprite deck={deck} size={142} />
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
