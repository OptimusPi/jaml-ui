import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboDivider } from "./JimboDivider.js";
import { JimboRow, JimboStack } from "./JimboLayout.js";
import { JimboSpacer } from "./JimboSpacer.js";
import { JimboText } from "./jimboText.js";

const meta = {
  title: "Primitives/Layout/JimboDivider",
  component: JimboDivider,
} satisfies Meta<typeof JimboDivider>;
export default meta;

export const BetweenZones: StoryObj<typeof meta> = {
  name: "Rule between Must and Should",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboStack gap="sm" align="stretch">
        <JimboText tone="red">Must · Blueprint</JimboText>
        <JimboDivider />
        <JimboText tone="gold">Should · Telescope</JimboText>
      </JimboStack>
    </StoryScene>
  ),
};

export const ScoreSplit: StoryObj<typeof meta> = {
  name: "Vertical rule on a score row",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboRow gap="md" align="center">
        <JimboText>WEEJOKER</JimboText>
        <JimboDivider vert />
        <JimboText tone="gold">100</JimboText>
      </JimboRow>
    </StoryScene>
  ),
};

export const SpacerSizes: StoryObj<typeof meta> = {
  name: "Breathing room in a filter stack",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboStack gap="xs" align="stretch">
        <JimboText>Must</JimboText>
        <JimboSpacer size={8} />
        <JimboText>Should</JimboText>
        <JimboSpacer size={32} />
        <JimboText>Must not</JimboText>
      </JimboStack>
    </StoryScene>
  ),
};
