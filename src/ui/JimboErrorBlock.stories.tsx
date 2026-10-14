import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboErrorBlock } from "./JimboErrorBlock.js";

const meta = {
  title: "Primitives/Feedback/JimboErrorBlock",
  component: JimboErrorBlock,
} satisfies Meta<typeof JimboErrorBlock>;
export default meta;

export const SearchTimeout: StoryObj<typeof meta> = {
  name: "Motely timed out on Search",
  render: () => (
    <StoryScene title="Search" tone="green">
      <JimboErrorBlock title="Search failed">
        Motely timed out after 30s. Lower the max ante and try again.
      </JimboErrorBlock>
    </StoryScene>
  ),
};

export const BadJaml: StoryObj<typeof meta> = {
  name: "Parser reject on the JAML tab",
  render: () => (
    <StoryScene title="JAML" tone="blue">
      <JimboErrorBlock title="Invalid JAML" onDismiss={() => {}}>
        Unexpected token on line 4 — did you mean `should:`?
      </JimboErrorBlock>
    </StoryScene>
  ),
};
