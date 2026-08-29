import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboButton } from "./JimboButton.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboTabs } from "./jimboTabs.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboTabs> = {
  title: "Primitives/Layout/JimboTabs",
  component: JimboTabs,
};
export default meta;
type Story = StoryObj<typeof JimboTabs>;

const TABS = [
  { id: "visual", label: "Visual" },
  { id: "code", label: "JAML" },
  { id: "inspect", label: "Inspect" },
];

export const IdeModes: Story = {
  name: "IDE mode switch next to Search",
  render: () => {
    const [active, setActive] = useState("visual");
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboRow gap="sm" align="center" justify="between">
          <JimboTabs tabs={TABS} activeTab={active} onTabChange={setActive} />
          <JimboButton tone="red" size="sm">
            Search
          </JimboButton>
        </JimboRow>
        <JimboText size="sm" tone="grey">
          {active === "visual" && "Clause cards. Drag a joker onto Must."}
          {active === "code" && "jaml-lang editor with typeahead."}
          {active === "inspect" && "Raw Motely dump for this seed."}
        </JimboText>
      </StoryScene>
    );
  },
};
