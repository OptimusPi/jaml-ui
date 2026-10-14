import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { DeckStakePicker } from "./DeckStakePicker.js";

const meta: Meta<typeof DeckStakePicker> = {
  title: "Composed/DeckStakePicker",
  component: DeckStakePicker,
};
export default meta;
type Story = StoryObj<typeof DeckStakePicker>;

export const NewRun: Story = {
  name: "Pick deck and stake for a new search",
  render: () => {
    const [deck, setDeck] = useState("Red");
    const [stake, setStake] = useState("White");
    return (
      <StoryScene title="Filter" tone="blue">
        <DeckStakePicker
          deck={deck}
          stake={stake}
          onDeckChange={setDeck}
          onStakeChange={setStake}
        />
      </StoryScene>
    );
  },
};
