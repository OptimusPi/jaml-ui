import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboText> = {
  title: "Primitives/Display/JimboText",
  component: JimboText,
};
export default meta;
type Story = StoryObj<typeof JimboText>;

export const ResultCopy: Story = {
  name: "Copy on a result card",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboStack gap="xs">
        <JimboText size="lg" tone="white">
          WEEJOKER
        </JimboText>
        <JimboText size="sm" tone="gold">
          score 100
        </JimboText>
        <JimboText size="xs" tone="grey">
          Red Deck · White Stake · ante 1 Blueprint
        </JimboText>
      </JimboStack>
    </StoryScene>
  ),
};

export const AlertTones: Story = {
  name: "Status copy in a filter pane",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboStack gap="sm">
        <JimboText tone="white">Must: Blueprint</JimboText>
        <JimboText tone="gold">Should: Telescope</JimboText>
        <JimboText tone="red">Must not: The Wall</JimboText>
        <JimboText tone="grey">No stake locked</JimboText>
      </JimboStack>
    </StoryScene>
  ),
};
