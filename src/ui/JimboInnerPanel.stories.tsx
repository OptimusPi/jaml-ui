import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboButton } from "./JimboButton.js";
import { JimboInnerPanel, JimboModal } from "./panel.js";
import { JimboText } from "./jimboText.js";

const meta: Meta = {
  title: "Primitives/Layout/JimboInnerPanel",
};
export default meta;

export const NestedLog: StoryObj = {
  name: "Sunken log inside a Search pane",
  render: () => (
    <StoryScene title="Search" tone="green">
      <JimboInnerPanel>
        <JimboText size="sm" tone="grey">
          scanned 12_400 seeds
        </JimboText>
        <JimboText size="sm" tone="white">
          hit WEEJOKER @ 4.2s
        </JimboText>
      </JimboInnerPanel>
    </StoryScene>
  ),
};

export const ConfirmReplace: StoryObj = {
  name: "Confirm replacing the open filter",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboButton size="sm" onClick={() => setOpen(true)}>
          Load File
        </JimboButton>
        <JimboModal open={open} onClose={() => setOpen(false)} title="Replace filter?">
          Loading this file dumps the clauses you have open.
        </JimboModal>
      </StoryScene>
    );
  },
};
