import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboMascot } from "./JimboMascot.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta = {
  title: "Primitives/Display/JimboMascot",
  component: JimboMascot,
} satisfies Meta<typeof JimboMascot>;
export default meta;

export const EmptyHits: StoryObj<typeof meta> = {
  name: "Jammy reacts to an empty search",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboRow gap="md" align="center">
        <JimboMascot mood="surprised" />
        <JimboText size="sm" tone="grey">
          Zero seeds. Loosen a Must.
        </JimboText>
      </JimboRow>
    </StoryScene>
  ),
};

export const RadialMenu: StoryObj<typeof meta> = {
  name: "Jammy radial from the home screen",
  render: () => (
    <StoryScene title="JAML" tone="blue">
      <JimboRow gap="xl" justify="center">
        <JimboMascot
          menuItems={[
            { label: "Search", action: "search", tone: "blue" },
            { label: "Analyze", action: "analyze", tone: "green" },
            { label: "Copy", action: "copy", tone: "purple" },
            { label: "Help", action: "help", tone: "grey" },
          ]}
          onMenuAction={(action) => console.log("menu action", action)}
        />
      </JimboRow>
    </StoryScene>
  ),
};
