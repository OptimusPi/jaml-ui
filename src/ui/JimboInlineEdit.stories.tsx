import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboInlineEdit } from "./JimboInlineEdit.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboInlineEdit> = {
  title: "Primitives/Inputs/JimboInlineEdit",
  component: JimboInlineEdit,
};
export default meta;
type Story = StoryObj<typeof JimboInlineEdit>;

export const FilterName: Story = {
  name: "Rename the open filter",
  render: () => {
    const [value, setValue] = useState("Ante 1 Blueprint");
    return (
      <StoryScene title="Filter" tone="blue">
        <JimboText size="xs" tone="grey">
          Click the name to edit
        </JimboText>
        <JimboInlineEdit value={value} onChange={(e) => setValue(e.target.value)} />
      </StoryScene>
    );
  },
};

export const Description: Story = {
  name: "Dim description under the filter name",
  render: () => (
    <StoryScene title="Filter" tone="blue">
      <JimboInlineEdit defaultValue="My filter name" />
      <JimboInlineEdit defaultValue="Need Telescope by ante 2" dim tone="grey" size="sm" />
    </StoryScene>
  ),
};
