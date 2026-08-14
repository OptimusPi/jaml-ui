import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboBox } from "./JimboBox.js";

const meta: Meta<typeof JimboBox> = {
  title: "Primitives/JimboBox",
  component: JimboBox,
};
export default meta;

type Story = StoryObj<typeof JimboBox>;

export const Default: Story = {
  render: () => (
    <JimboBox className="j-p-md" style={{ "--j-debug": "1" } as React.CSSProperties}>
      A plain container (div).
    </JimboBox>
  ),
};

export const AsSection: Story = {
  render: () => (
    <JimboBox as="section" className="j-p-md">
      Rendered as a section element.
    </JimboBox>
  ),
};
