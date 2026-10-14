import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboButton } from "./JimboButton.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboStatusPill } from "./JimboStatusPill.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboButton> = {
  title: "Primitives/Actions/JimboButton",
  component: JimboButton,
};
export default meta;
type Story = StoryObj<typeof JimboButton>;

export const IdeToolbar: Story = {
  name: "Search from the IDE toolbar",
  render: () => {
    const [searching, setSearching] = useState(false);
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboText size="sm" tone="grey">
          Visual · JAML · Inspect
        </JimboText>
        <JimboRow gap="sm">
          <JimboButton
            tone="red"
            size="sm"
            onClick={() => setSearching((v) => !v)}
          >
            {searching ? "Stop" : "Search"}
          </JimboButton>
          <JimboButton tone="blue" size="sm">
            Load File
          </JimboButton>
        </JimboRow>
        <JimboStatusPill
          status={searching ? "running" : "idle"}
          label={searching ? "Searching..." : "Ready"}
        />
      </StoryScene>
    );
  },
};

export const SearchArmed: Story = {
  name: "Full-width Search on the results pane",
  render: () => (
    <StoryScene title="Search" tone="green">
      <JimboText size="sm" tone="grey">
        Ante 1 Blueprint · Red Deck
      </JimboText>
      <JimboButton fullWidth tone="red">
        Search
      </JimboButton>
    </StoryScene>
  ),
};

export const DisabledLoad: Story = {
  name: "Load File while a file is already parsing",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboButton tone="blue" size="sm" disabled>
        Loading...
      </JimboButton>
    </StoryScene>
  ),
};
