import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboLink } from "./JimboLink.js";

const meta: Meta<typeof JimboLink> = {
  title: "Primitives/Display/JimboLink",
  component: JimboLink,
};
export default meta;

type Story = StoryObj<typeof JimboLink>;

export const Default: Story = {
  render: () => (
    <JimboLink href="https://example.com" className="j-text--gold" target="_blank" rel="noopener noreferrer">
      Example link
    </JimboLink>
  ),
};
