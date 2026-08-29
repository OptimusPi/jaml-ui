import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboApp } from "./JimboApp.js";
import { JimboBadge } from "./JimboBadge.js";
import { JimboPanel } from "./JimboPanel.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboSeedCopyChip } from "./JimboSeedCopyChip.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboPanel> = {
  title: "Primitives/Layout/JimboPanel",
  component: JimboPanel,
};
export default meta;
type Story = StoryObj<typeof JimboPanel>;

export const ResultsPane: Story = {
  name: "Results pane in the MCP shell",
  render: () => (
    <JimboApp>
      <JimboPanel title="Search Results" tone="gold">
        <JimboRow gap="sm" align="center" justify="between">
          <JimboText size="sm" tone="grey">
            Blueprint ante 1
          </JimboText>
          <JimboBadge>2 seeds</JimboBadge>
        </JimboRow>
        <JimboStack gap="sm">
          <JimboSeedCopyChip value="WEEJOKER" />
          <JimboSeedCopyChip value="PERKEO99" />
        </JimboStack>
      </JimboPanel>
    </JimboApp>
  ),
};

export const ScratchNotes: Story = {
  name: "Untitled panel for freestyle copy",
  render: () => (
    <JimboApp>
      <JimboPanel>
        <JimboText size="sm" tone="white">
          A Jimbo panel with no title — logs, scratch, whatever the screen needs.
        </JimboText>
      </JimboPanel>
    </JimboApp>
  ),
};
