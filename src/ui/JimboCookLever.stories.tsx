import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { JimboCookLever, type JimboCookLeverSprite } from './JimboCookLever';
import { JimboApp } from './jimboApp';
import { JimboStack } from './jimboLayout';
import { JimboText } from './jimboText';

const meta = {
  title: 'JimboUI / JimboCookLever',
  component: JimboCookLever,
} satisfies Meta<typeof JimboCookLever>;

export default meta;
type Story = StoryObj<typeof meta>;

const MATCH: JimboCookLeverSprite[] = [
  { name: 'Blueprint', sheet: 'Jokers' },
  { name: 'Brainstorm', sheet: 'Jokers' },
  { name: 'Perkeo', sheet: 'Jokers' },
];

/**
 * Simulated search: pull past ~70% travel to fire. Reels spin for ~2.5s,
 * slam onto the "must clauses" (gold flash), then the search "completes"
 * and the lever springs back. Tap the knob mid-cook to stop early.
 * Releasing below the threshold springs back without firing.
 */
function SimulatedSearch() {
  const [cooking, setCooking] = useState(false);
  const [match, setMatch] = useState<JimboCookLeverSprite[] | undefined>(undefined);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const handleCook = () => {
    clearTimers();
    setMatch(undefined);
    setCooking(true);
    timersRef.current = [
      window.setTimeout(() => setMatch(MATCH), 2500),
      window.setTimeout(() => setCooking(false), 4200),
    ];
  };

  const handleStop = () => {
    clearTimers();
    setCooking(false);
  };

  return (
    <JimboApp>
      <JimboStack gap="md">
        <JimboText size="sm" tone="grey">
          pull the gold knob all the way down, then let go
        </JimboText>
        <JimboCookLever
          cooking={cooking}
          onCook={handleCook}
          onStop={handleStop}
          matchSprites={match}
        />
      </JimboStack>
    </JimboApp>
  );
}

export const Simulated: Story = {
  args: { cooking: false, onCook: () => {} },
  render: () => <SimulatedSearch />,
};

export const Disabled: Story = {
  args: { cooking: false, onCook: () => {}, disabled: true },
  render: (args) => (
    <JimboApp>
      <JimboCookLever {...args} />
    </JimboApp>
  ),
};
