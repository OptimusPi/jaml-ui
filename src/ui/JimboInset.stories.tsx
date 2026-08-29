import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboInset } from "./JimboInset.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboInset> = {
  title: "Primitives/Layout/JimboInset",
  component: JimboInset,
};
export default meta;
type Story = StoryObj<typeof JimboInset>;

export const RecentFinds: Story = {
  name: "Recent finds well",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboInset>
        <JimboText size="sm" tone="white">
          WEEJOKER
        </JimboText>
        <JimboText size="sm" tone="white">
          PERKEO99
        </JimboText>
        <JimboText size="sm" tone="grey">
          ALEEB123
        </JimboText>
      </JimboInset>
    </StoryScene>
  ),
};
