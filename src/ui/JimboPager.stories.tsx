import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboPager } from "./JimboPager.js";
import { JimboText } from "./jimboText.js";

const meta: Meta = {
  title: "Primitives/Interaction/JimboPager",
};
export default meta;

const SEEDS = ["aleeb88", "7nkb123", "qq4x2zp", "trib0lt", "88888888"];

/** Stand-in for a Jamlyzer seed view: taller than the pager on purpose, so it has to scroll. */
function SeedPage({ seed }: { seed: string }) {
  return (
    <div style={{ display: "grid", gap: 8, padding: 12 }}>
      <JimboText size="lg" tone="white">
        {seed}
      </JimboText>
      {Array.from({ length: 14 }, (_, ante) => (
        <JimboText key={ante} size="sm" tone="grey">
          Ante {ante + 1}
        </JimboText>
      ))}
    </div>
  );
}

export const SwipeThroughSeeds: StoryObj = {
  name: "Swipe through seeds",
  render: () => {
    const [page, setPage] = useState(0);
    return (
      <StoryScene title="Results" tone="gold">
        <JimboText size="sm" tone="grey">
          Drag, swipe, arrow keys or the buttons. Tall pages scroll inside themselves.
        </JimboText>
        <JimboPager height={320} onPageChange={setPage} aria-label="Seeds">
          {SEEDS.map((seed) => (
            <SeedPage key={seed} seed={seed} />
          ))}
        </JimboPager>
        <JimboText size="xs" tone="white">
          On {SEEDS[page]}
        </JimboText>
      </StoryScene>
    );
  },
};

export const OnePage: StoryObj = {
  name: "A single page",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboPager height={160}>
        <SeedPage seed="lastone" />
      </JimboPager>
    </StoryScene>
  ),
};
