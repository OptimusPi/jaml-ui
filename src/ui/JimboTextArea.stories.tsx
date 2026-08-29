import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboButton } from "./JimboButton.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";
import { JimboTextArea } from "./JimboTextArea.js";

const meta: Meta<typeof JimboTextArea> = {
  title: "Primitives/Inputs/JimboTextArea",
  component: JimboTextArea,
};
export default meta;
type Story = StoryObj<typeof JimboTextArea>;

export const PasteFilter: Story = {
  name: "Paste a JAML filter before Load File exists",
  render: () => {
    const [value, setValue] = useState("must:\n  - joker: Blueprint\n");
    return (
      <StoryScene title="JAML" tone="blue">
        <JimboText size="sm" tone="grey">
          Scratch pad — CodeMirror owns the real editor
        </JimboText>
        <JimboTextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: "100%", minHeight: 180 }}
        />
        <JimboRow gap="sm">
          <JimboButton tone="red" size="sm">
            Search
          </JimboButton>
        </JimboRow>
      </StoryScene>
    );
  },
};
