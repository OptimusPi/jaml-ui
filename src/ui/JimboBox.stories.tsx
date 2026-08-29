import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboBox } from "./JimboBox.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboBox> = {
  title: "Primitives/Layout/JimboBox",
  component: JimboBox,
};
export default meta;
type Story = StoryObj<typeof JimboBox>;

export const ToolbarSlot: Story = {
  name: "Toolbar slot wrapping IDE actions",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboBox className="j-ide-toolbar">
        <JimboText size="sm" tone="white">
          Visual · JAML · Inspect
        </JimboText>
      </JimboBox>
    </StoryScene>
  ),
};
