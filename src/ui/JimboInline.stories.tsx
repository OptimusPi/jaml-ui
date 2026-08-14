import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboInline } from "./JimboInline.js";

const meta: Meta<typeof JimboInline> = {
  title: "Primitives/JimboInline",
  component: JimboInline,
};
export default meta;

type Story = StoryObj<typeof JimboInline>;

export const Default: Story = {
  render: () => (
    <div>
      Text with an <JimboInline className="j-text--gold">inline span</JimboInline> inside.
    </div>
  ),
};
