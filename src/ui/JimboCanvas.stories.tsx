import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboCanvas } from "./JimboCanvas.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboCanvas> = {
  title: "Primitives/Layout/JimboCanvas",
  component: JimboCanvas,
};
export default meta;
type Story = StoryObj<typeof JimboCanvas>;

export const SpriteScratch: Story = {
  name: "Offscreen canvas the sprite mapper draws into",
  render: () => (
    <StoryScene title="Inspect" tone="blue">
      <JimboText size="sm" tone="grey">
        Layer compositor target — empty until a card paints
      </JimboText>
      <JimboCanvas width={142} height={190} />
    </StoryScene>
  ),
};
