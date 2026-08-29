import type { Meta, StoryObj } from "@storybook/react-vite";
import { FiX } from "react-icons/fi";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboIconButton } from "./JimboIconButton.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboIconButton> = {
  title: "Primitives/Actions/JimboIconButton",
  component: JimboIconButton,
};
export default meta;
type Story = StoryObj<typeof JimboIconButton>;

export const DismissClause: Story = {
  name: "Dismiss a must-clause chip",
  render: () => (
    <StoryScene title="Must" tone="red">
      <JimboRow gap="sm" align="center" justify="between">
        <JimboText size="sm" tone="white">
          Blueprint · antes 1–3
        </JimboText>
        <JimboIconButton aria-label="Remove clause" title="Remove">
          <FiX />
        </JimboIconButton>
      </JimboRow>
    </StoryScene>
  ),
};

export const DeleteSeed: Story = {
  name: "Delete a saved seed row",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboRow gap="sm" align="center" justify="between">
        <JimboText size="sm" tone="white">
          WEEJOKER
        </JimboText>
        <JimboIconButton tone="destructive" aria-label="Delete seed" title="Delete">
          <FiX />
        </JimboIconButton>
      </JimboRow>
    </StoryScene>
  ),
};
