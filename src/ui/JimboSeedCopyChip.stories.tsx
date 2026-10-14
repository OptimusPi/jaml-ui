import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboBadge } from "./JimboBadge.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboSeedCopyChip } from "./JimboSeedCopyChip.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboSeedCopyChip> = {
  title: "Primitives/Display/JimboSeedCopyChip",
  component: JimboSeedCopyChip,
};
export default meta;
type Story = StoryObj<typeof JimboSeedCopyChip>;

export const Hits: Story = {
  name: "Copy a seed from search hits",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboRow gap="sm" align="center" justify="between">
        <JimboText size="sm" tone="grey">
          Red Deck · White Stake
        </JimboText>
        <JimboBadge>2 seeds</JimboBadge>
      </JimboRow>
      <JimboStack gap="sm">
        <JimboSeedCopyChip value="WEEJOKER" />
        <JimboSeedCopyChip value="PERKEO99" />
      </JimboStack>
    </StoryScene>
  ),
};

export const Waiting: Story = {
  name: "Empty slot before a search returns",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboText size="sm" tone="grey">
        No hits yet
      </JimboText>
      <JimboSeedCopyChip value="" placeholder="--------" />
    </StoryScene>
  ),
};
