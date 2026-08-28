import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboCanvas } from "./JimboCanvas.js";

const meta: Meta<typeof JimboCanvas> = {
  title: "Primitives/Layout/JimboCanvas",
  component: JimboCanvas,
};
export default meta;

type Story = StoryObj<typeof JimboCanvas>;

export const Default: Story = {
  render: () => <JimboCanvas width={200} height={100} style={{ border: "1px solid #555" }} />,
};
