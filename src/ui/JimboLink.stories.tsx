import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboLink } from "./JimboLink.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboLink> = {
  title: "Primitives/Display/JimboLink",
  component: JimboLink,
};
export default meta;
type Story = StoryObj<typeof JimboLink>;

export const DocsCite: Story = {
  name: "Cite a seed in help copy",
  render: () => (
    <StoryScene title="How to play" tone="blue">
      <JimboText size="sm" tone="white">
        Open{" "}
        <JimboLink href="https://balatrowiki.org" className="j-text--gold" target="_blank" rel="noopener noreferrer">
          Balatro Wiki
        </JimboLink>{" "}
        if you forget what Telescope does.
      </JimboText>
    </StoryScene>
  ),
};
