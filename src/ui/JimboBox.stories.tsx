import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboBox } from "./JimboBox.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboBox> = {
  title: "Primitives/Layout/JimboBox",
  component: JimboBox,
};

export default meta;
type Story = StoryObj<typeof JimboBox>;

export const Default: Story = {
  render: () => (
    <JimboBox className="j-inner-panel">
      <JimboText size="sm" tone="white">
        Jimbo structural container
      </JimboText>
    </JimboBox>
  ),
};
