import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboJsonRenderer } from "../JimboJsonRenderer.js";
import type { ReactSpec } from "@json-render/react";

const meta: Meta<typeof JimboJsonRenderer> = {
  title: "JsonRender/JimboJsonRenderer",
  component: JimboJsonRenderer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof JimboJsonRenderer>;

/** Sample AI-generated spec for an Ante 1 Shop review */
const shopSpec: ReactSpec = {
  root: "root-panel",
  elements: {
    "root-panel": {
      type: "JimboPanel",
      props: {
        title: "AI Generated Ante 1 Shop",
        tone: "gold",
      },
      children: ["main-stack"],
    },
    "main-stack": {
      type: "JimboStack",
      props: {
        gap: "md",
        align: "stretch",
      },
      children: ["header-row", "cards-row", "action-row"],
    },
    "header-row": {
      type: "JimboRow",
      props: {
        gap: "sm",
        align: "center",
        justify: "between",
      },
      children: ["badge-ante", "copy-chip"],
    },
    "badge-ante": {
      type: "JimboBadge",
      props: {
        text: "Ante 1 · Shop Roll #1",
        tone: "orange",
        size: "sm",
      },
      children: [],
    },
    "copy-chip": {
      type: "JimboSeedCopyChip",
      props: {
        value: "WEEJ0KER",
      },
      children: [],
    },
    "cards-row": {
      type: "JimboRow",
      props: {
        gap: "md",
        align: "center",
        justify: "center",
      },
      children: ["joker-card-1", "joker-card-2", "playing-card"],
    },
    "joker-card-1": {
      type: "JamlGameCard",
      props: {
        name: "WeeJoker",
        type: "joker",
        scale: 1,
      },
      children: [],
    },
    "joker-card-2": {
      type: "JamlGameCard",
      props: {
        name: "Hack",
        type: "joker",
        scale: 1,
      },
      children: [],
    },
    "playing-card": {
      type: "StandardCard",
      props: {
        rank: "Two",
        suit: "Spades",
        size: 72,
      },
      children: [],
    },
    "action-row": {
      type: "JimboRow",
      props: {
        gap: "sm",
        align: "center",
        justify: "between",
      },
      children: ["status-pill", "btn-play"],
    },
    "status-pill": {
      type: "JimboStatusPill",
      props: {
        label: "Mult: +80 Chips",
        status: "ok",
      },
      children: [],
    },
    "btn-play": {
      type: "JimboButton",
      props: {
        label: "Analyze seed",
        tone: "green",
        size: "sm",
      },
      children: [],
    },
  },
};

export const AiGeneratedShop: Story = {
  args: {
    spec: shopSpec,
  },
};

/** Sample AI-generated spec for a 10k candidate seed list */
const candidateListSpec: ReactSpec = {
  root: "root-panel",
  elements: {
    "root-panel": {
      type: "JimboPanel",
      props: {
        title: "AI Curated Top Candidates",
        tone: "blue",
      },
      children: ["candidates-stack"],
    },
    "candidates-stack": {
      type: "JimboStack",
      props: {
        gap: "sm",
        align: "stretch",
      },
      children: ["candidate-1", "candidate-2", "candidate-3"],
    },
    "candidate-1": {
      type: "JamlyzerSeedCard",
      props: {
        seed: "18Z47K9Q",
        score: 245,
        pinned: true,
      },
      children: [],
    },
    "candidate-2": {
      type: "JamlyzerSeedCard",
      props: {
        seed: "99CLOUD9",
        score: 190,
        pinned: false,
      },
      children: [],
    },
    "candidate-3": {
      type: "JamlyzerSeedCard",
      props: {
        seed: "BLU3PRNT",
        score: 165,
        pinned: false,
      },
      children: [],
    },
  },
};

export const AiCuratedCandidates: Story = {
  args: {
    spec: candidateListSpec,
  },
};
