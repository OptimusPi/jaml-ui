import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboBadge } from "./JimboBadge.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboSeedCopyChip } from "./JimboSeedCopyChip.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboBadge> = {
  title: "Primitives/Display/JimboBadge",
  component: JimboBadge,
};
export default meta;
type Story = StoryObj<typeof JimboBadge>;

export const ResultCount: Story = {
  name: "Hit count on a results header",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboRow gap="sm" align="center" justify="between">
        <JimboText size="sm" tone="white">
          Blueprint ante 1
        </JimboText>
        <JimboBadge>5 seeds</JimboBadge>
      </JimboRow>
      <JimboSeedCopyChip value="WEEJOKER" />
      <JimboSeedCopyChip value="PERKEO99" />
    </StoryScene>
  ),
};

export const PackProgress: Story = {
  name: "Pack index on a Jamlyze pull",
  render: () => (
    <StoryScene title="Jamlyze" tone="purple">
      <JimboRow gap="sm" align="center">
        <JimboBadge size="sm" tone="grey">
          1 of 5
        </JimboBadge>
        <JimboText size="sm" tone="white">
          Buffoon Pack
        </JimboText>
      </JimboRow>
    </StoryScene>
  ),
};
