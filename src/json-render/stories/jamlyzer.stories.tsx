import type { Meta, StoryObj } from "@storybook/react-vite";
import { Jamlyzer } from "../../components/Jamlyzer.js";
import { JamlyzerView } from "../../components/JamlyzerView.js";
import { JimboApp } from "../../ui/JimboApp.js";
import fixture from "./fixtures/jamlyzer-aaaaaaaa.json";

const meta: Meta<typeof Jamlyzer> = {
  title: "Screens/Jamlyzer/Triage",
  component: Jamlyzer,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <JimboApp>
        <Story />
      </JimboApp>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Jamlyzer>;

const sampleJaml = `deck: Red
stake: White
should:
  - joker: WeeJoker
    score: 2
  - tarot: The Fool
    score: 1
  - joker: Blueprint
    score: 5
must:
  - boss: The Hook
mustNot:
  - voucher: Overstock
`;

// Helper to generate N mock seed results based on fixture
function generateMockSeedResults(count: number) {
  const base = fixture as unknown as Parameters<typeof JamlyzerView>[0]["result"];
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  return Array.from({ length: count }, (_, idx) => {
    let seed = "";
    for (let c = 0; c < 8; c++) {
      seed += chars[(idx * 7 + c * 13 + (idx % 11)) % chars.length];
    }
    const score = (idx * 3 + 7) % 15;
    return {
      ...base,
      seed,
      score,
    };
  });
}

export const FullTriage100Seeds: Story = {
  args: {
    jaml: sampleJaml,
    results: generateMockSeedResults(100),
    deck: 0,
    stake: 0,
  },
};

export const TenThousandSeedStressTest: Story = {
  args: {
    jaml: sampleJaml,
    results: generateMockSeedResults(10000),
    deck: 0,
    stake: 0,
  },
};

export const SingleSeedView: Story = {
  args: {
    jaml: sampleJaml,
    results: [
      {
        ...(fixture as unknown as Parameters<typeof JamlyzerView>[0]["result"]),
        seed: "18Z47K9Q",
        score: 12,
      },
    ],
    deck: 0,
    stake: 0,
  },
};
