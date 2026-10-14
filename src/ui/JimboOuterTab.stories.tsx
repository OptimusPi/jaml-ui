import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboOuterTab } from "./JimboOuterTab.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboOuterTab> = {
  title: "Primitives/Layout/JimboOuterTab",
  component: JimboOuterTab,
};
export default meta;
type Story = StoryObj<typeof JimboOuterTab>;

export const SeedLabTabs: Story = {
  name: "SeedLab dock tabs before they dock",
  render: () => (
    <StoryScene title="SeedLab" tone="blue" variant="page">
      <JimboText size="sm" tone="grey">
        Tear-off chrome for Filter / Search / Results / Jamlyze
      </JimboText>
      <JimboStack gap="sm">
        <JimboOuterTab label="Filter" tone="blue" onToggleFullscreen={() => {}} />
        <JimboOuterTab label="Search" tone="green" />
        <JimboOuterTab label="Results" tone="gold" />
        <JimboOuterTab label="Jamlyze" tone="purple" />
      </JimboStack>
    </StoryScene>
  ),
};

export const DragSwap: Story = {
  name: "Reorder dock tabs by dragging",
  render: () => {
    const [order, setOrder] = useState(["Filter", "Search", "Results", "Jamlyze"]);
    const [over, setOver] = useState<string | null>(null);
    return (
      <StoryScene title="SeedLab" tone="blue" variant="page">
        <JimboStack gap="sm">
          {order.map((name) => (
            <JimboOuterTab
              key={name}
              label={name}
              tone={name === over ? "gold" : "blue"}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", name)}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(name);
              }}
              onDragLeave={() => setOver((v) => (v === name ? null : v))}
              onDrop={(e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData("text/plain");
                setOver(null);
                setOrder((prev) => {
                  const next = [...prev];
                  const a = next.indexOf(from);
                  const b = next.indexOf(name);
                  if (a === -1 || b === -1) return prev;
                  [next[a], next[b]] = [next[b], next[a]];
                  return next;
                });
              }}
            />
          ))}
        </JimboStack>
      </StoryScene>
    );
  },
};

export const JamlyzeFullscreen: Story = {
  name: "Jamlyze pane toggled fullscreen",
  render: () => {
    const [fs, setFs] = useState(true);
    return (
      <StoryScene title="Jamlyze" tone="purple">
        <JimboOuterTab
          label="Jamlyze"
          tone="purple"
          fullscreen={fs}
          onToggleFullscreen={() => setFs((v) => !v)}
        />
        <JimboText size="sm" tone="grey">
          {fs ? "Expanded — click to dock" : "Docked — click to expand"}
        </JimboText>
      </StoryScene>
    );
  },
};
