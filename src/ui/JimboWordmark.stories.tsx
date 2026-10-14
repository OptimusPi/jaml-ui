import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboApp } from "./JimboApp.js";
import { JimboText } from "./jimboText.js";
import { JimboWordmark } from "./JimboWordmark.js";
import { JimboStack } from "./JimboLayout.js";

const meta: Meta<typeof JimboWordmark> = {
  title: "Primitives/Display/JimboWordmark",
  component: JimboWordmark,
};
export default meta;
type Story = StoryObj<typeof JimboWordmark>;

export const TitleScreen: Story = {
  name: "Title on the MCP welcome",
  render: () => (
    <JimboApp>
      <JimboStack gap="lg" align="center" style={{ paddingTop: 48 }}>
        <JimboWordmark title="JAML" sub="Jimbo's Ante Markup Language" />
        <JimboText size="sm" tone="grey">
          Write a filter. Hunt a seed.
        </JimboText>
      </JimboStack>
    </JimboApp>
  ),
};
