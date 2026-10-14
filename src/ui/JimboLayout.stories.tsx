import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboBadge } from "./JimboBadge.js";
import { JimboButton } from "./JimboButton.js";
import { JimboRow, JimboStack } from "./JimboLayout.js";
import { JimboSeedCopyChip } from "./JimboSeedCopyChip.js";
import { JimboText } from "./jimboText.js";

const meta: Meta = {
  title: "Primitives/Layout/JimboLayout",
};
export default meta;

export const ResultHeader: StoryObj = {
  name: "Header row + seed stack",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboStack gap="md">
        <JimboRow gap="sm" align="center" justify="between">
          <JimboText size="sm" tone="white">
            Blueprint ante 1
          </JimboText>
          <JimboBadge>2 seeds</JimboBadge>
        </JimboRow>
        <JimboStack gap="sm">
          <JimboSeedCopyChip value="WEEJOKER" />
          <JimboSeedCopyChip value="PERKEO99" />
        </JimboStack>
        <JimboRow gap="sm">
          <JimboButton tone="red" size="sm">
            Search
          </JimboButton>
          <JimboButton tone="blue" size="sm">
            Load File
          </JimboButton>
        </JimboRow>
      </JimboStack>
    </StoryScene>
  ),
};
