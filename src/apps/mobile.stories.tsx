import type { Meta, StoryObj } from "@storybook/react-vite";
import { appMeta } from "../../.storybook/appFrame.js";
import { JamlMapEditor } from "../components/jamlMap/JamlMapEditor.js";
import { Jamlyzer } from "../components/Jamlyzer.js";
import { JAMLYZE_JAML, LiveJamlIde, SeedLab } from "../components/SeedLab.js";

const meta = {
  title: "Apps/Mobile portrait",
  ...appMeta("phone"),
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const JamlIDE: Story = {
  name: "JAML IDE",
  render: () => <LiveJamlIde />,
};

export const Jamlyze: Story = {
  name: "Jamlyzer",
  render: () => <Jamlyzer jaml={JAMLYZE_JAML} />,
};

export const AnteMap: Story = {
  name: "Ante Map",
  render: () => <JamlMapEditor zone="must" />,
};

export const SeedLabApp: Story = {
  name: "SeedLab",
  render: () => <SeedLab />,
};
