import type { Meta, StoryObj } from "@storybook/react-vite";
import { JamlGenieBar } from "../../components/JamlGenieBar.js";
import { JimboApp } from "../../ui/JimboApp.js";

const meta: Meta<typeof JamlGenieBar> = {
  title: "Components/JamlGenieBar",
  component: JamlGenieBar,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <JimboApp>
        <div style={{ width: 680, padding: 20 }}>
          <Story />
        </div>
      </JimboApp>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof JamlGenieBar>;

export const Default: Story = {
  args: {
    onGenerate: (jaml) => {
      console.log("Generated JAML:", jaml);
    },
  },
};
