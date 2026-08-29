import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboListItem } from "./JimboListItem.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboListItem> = {
  title: "Primitives/Display/JimboListItem",
  component: JimboListItem,
};
export default meta;
type Story = StoryObj<typeof JimboListItem>;

const FILTERS = ["Ante 1 Blueprint", "Perkeo early", "Wee + Drunkard"];

export const SavedFilters: Story = {
  name: "Pick a saved filter",
  render: () => {
    const [active, setActive] = useState(FILTERS[0]);
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboText size="xs" tone="grey">
          Recents
        </JimboText>
        <JimboStack gap="xs">
          {FILTERS.map((name) => (
            <JimboListItem key={name} active={name === active} onClick={() => setActive(name)}>
              {name}
            </JimboListItem>
          ))}
        </JimboStack>
      </StoryScene>
    );
  },
};
