import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboDock } from "./JimboDock.js";
import { JimboText } from "./jimboText.js";
import { JimboBox } from "./JimboBox.js";

const meta: Meta<typeof JimboDock> = {
  title: "Primitives/Layout/JimboDock",
  component: JimboDock,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof JimboDock>;

function Pane({ name }: { name: string }) {
  return (
    <JimboBox className="j-dock-story-pane">
      <JimboText size="sm" tone="white">
        {name}
      </JimboText>
    </JimboBox>
  );
}

export const Pyramid: Story = {
  render: () => (
    <JimboBox className="j-dock-story-root">
      <JimboDock
        pyramid={{ filter: "filter", search: "search", results: "results", jamlyze: "jamlyze" }}
        panes={{
          filter: { label: "Filter", tone: "blue", content: <Pane name="Filter" /> },
          search: { label: "Search", tone: "green", content: <Pane name="Search" /> },
          results: { label: "Results", tone: "gold", content: <Pane name="Results" /> },
          jamlyze: { label: "Jamlyze", tone: "purple", content: <Pane name="Jamlyze" /> },
        }}
      />
    </JimboBox>
  ),
};
