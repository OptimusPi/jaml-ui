import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboSwipeDeck, type JimboSwipeDirection } from "./JimboSwipeDeck.js";
import { JimboText } from "./jimboText.js";

const meta: Meta = {
  title: "Primitives/Interaction/JimboSwipeDeck",
};
export default meta;

const SEEDS = ["aleeb88", "7nkb123", "qq4x2zp", "trib0lt", "88888888"];

function SeedCard({ seed }: { seed: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "var(--j-surface-inset)",
        border: "var(--j-panel-border-width) solid var(--j-border-silver)",
        borderRadius: "var(--j-radius-lg)",
      }}
    >
      <JimboText size="lg" tone="white">
        {seed}
      </JimboText>
    </div>
  );
}

export const TriageHits: StoryObj = {
  name: "Swipe-triage search hits",
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    return (
      <StoryScene title="Results" tone="gold">
        <JimboText size="sm" tone="grey">
          Keep / skip a seed. Arrows work too.
        </JimboText>
        <JimboSwipeDeck
          height={260}
          onDecide={(index, direction: JimboSwipeDirection) =>
            setLog((entries) => [...entries, `${SEEDS[index]}: ${direction}`])
          }
        >
          {SEEDS.map((seed) => (
            <SeedCard key={seed} seed={seed} />
          ))}
        </JimboSwipeDeck>
        {log.slice(-3).map((entry) => (
          <JimboText key={entry} size="xs" tone="white">
            {entry}
          </JimboText>
        ))}
      </StoryScene>
    );
  },
};

export const LastCard: StoryObj = {
  name: "Last seed in the pile",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboSwipeDeck height={260}>
        <SeedCard seed="lastone" />
      </JimboSwipeDeck>
    </StoryScene>
  ),
};
