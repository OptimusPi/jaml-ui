import type { Meta, StoryObj } from "@storybook/react-vite";
import { DailyRitualView } from "../../components/DailyRitualView.js";
import { JimboApp } from "../../ui/JimboApp.js";
import { getDailyChallenge, DAILY_CHALLENGE_TEMPLATES } from "../../lib/daily/dailyChallenges.js";

const meta: Meta<typeof DailyRitualView> = {
  title: "Screens/Daily/DailyRitualView",
  component: DailyRitualView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <JimboApp>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
          <Story />
        </div>
      </JimboApp>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DailyRitualView>;

export const TodayChallenge: Story = {
  args: {
    challenge: getDailyChallenge(),
  },
};

export const TheDailyWee: Story = {
  args: {
    challenge: {
      ...DAILY_CHALLENGE_TEMPLATES[0],
      dayNumber: 1,
      dateString: "2026-08-20",
    },
  },
};

export const CloudNine: Story = {
  args: {
    challenge: {
      ...DAILY_CHALLENGE_TEMPLATES[1],
      dayNumber: 2,
      dateString: "2026-08-21",
    },
  },
};

export const BaronBloodbath: Story = {
  args: {
    challenge: {
      ...DAILY_CHALLENGE_TEMPLATES[4],
      dayNumber: 5,
      dateString: "2026-08-24",
    },
  },
};
