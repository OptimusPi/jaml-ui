import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboBadge } from "./JimboBadge.js";
import { JimboGrid } from "./JimboGrid.js";
import { JimboText } from "./jimboText.js";

const meta = {
  title: "Primitives/Layout/JimboGrid",
  component: JimboGrid,
} satisfies Meta<typeof JimboGrid>;
export default meta;

export const TagGrid: StoryObj<typeof meta> = {
  name: "Skip-tag grid on the filter",
  render: () => (
    <StoryScene title="Must not" tone="red">
      <JimboText size="sm" tone="grey">
        Tags to skip
      </JimboText>
      <JimboGrid columns={2} gap="md">
        {["Rare", "Uncommon", "Foil", "Negative"].map((c) => (
          <JimboBadge key={c} tone="grey" size="md">
            {c}
          </JimboBadge>
        ))}
      </JimboGrid>
    </StoryScene>
  ),
};
