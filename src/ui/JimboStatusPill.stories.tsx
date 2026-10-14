import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboButton } from "./JimboButton.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboStatusPill } from "./JimboStatusPill.js";

const meta = {
  title: "Primitives/Feedback/JimboStatusPill",
  component: JimboStatusPill,
} satisfies Meta<typeof JimboStatusPill>;
export default meta;

export const Searching: StoryObj<typeof meta> = {
  name: "Search running in the IDE chrome",
  render: () => (
    <StoryScene title="Search" tone="green">
      <JimboRow gap="sm" align="center" justify="between">
        <JimboStatusPill status="running" label="Searching..." />
        <JimboButton tone="red" size="sm">
          Stop
        </JimboButton>
      </JimboRow>
    </StoryScene>
  ),
};

export const Done: StoryObj<typeof meta> = {
  name: "Search finished",
  render: () => (
    <StoryScene title="Search" tone="green">
      <JimboRow gap="sm" align="center">
        <JimboStatusPill status="ok" label="Done" />
      </JimboRow>
    </StoryScene>
  ),
};

export const Failed: StoryObj<typeof meta> = {
  name: "Search errored",
  render: () => (
    <StoryScene title="Search" tone="green">
      <JimboRow gap="sm" align="center">
        <JimboStatusPill status="error" label="Error" />
      </JimboRow>
    </StoryScene>
  ),
};
