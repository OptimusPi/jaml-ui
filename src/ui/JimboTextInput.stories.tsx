import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboButton } from "./JimboButton.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";
import { JimboTextInput } from "./JimboTextInput.js";

const meta: Meta<typeof JimboTextInput> = {
  title: "Primitives/Inputs/JimboTextInput",
  component: JimboTextInput,
};
export default meta;
type Story = StoryObj<typeof JimboTextInput>;

export const SeedField: Story = {
  name: "Type a seed to analyze",
  render: () => {
    const [value, setValue] = useState("");
    return (
      <StoryScene title="Jamlyze" tone="purple">
        <JimboText size="sm" tone="grey">
          Paste or type an 8-char seed
        </JimboText>
        <JimboRow gap="sm" align="center">
          <JimboTextInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Aleeb"
            style={{ width: 160 }}
          />
          <JimboButton tone="green" size="sm" disabled={!value}>
            Analyze
          </JimboButton>
        </JimboRow>
      </StoryScene>
    );
  },
};

export const FilterSearch: Story = {
  name: "Filter the joker picker",
  render: () => {
    const [value, setValue] = useState("");
    return (
      <StoryScene title="Must" tone="red">
        <JimboTextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search jokers..."
          style={{ width: "100%" }}
        />
      </StoryScene>
    );
  },
};
