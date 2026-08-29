import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboInline } from "./JimboInline.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboInline> = {
  title: "Primitives/Layout/JimboInline",
  component: JimboInline,
};
export default meta;
type Story = StoryObj<typeof JimboInline>;

export const HighlightedJoker: Story = {
  name: "Gold name inside a clause sentence",
  render: () => (
    <StoryScene title="Must" tone="red">
      <JimboText size="sm" tone="white">
        Need <JimboInline className="j-text--gold">Blueprint</JimboInline> in ante 1 shop.
      </JimboText>
    </StoryScene>
  ),
};
