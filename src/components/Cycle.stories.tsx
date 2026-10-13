import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Cycle } from './Cycle.tsx';
import { Panel } from './Panel.tsx';

const decks = [
  'Red Deck',
  'Blue Deck',
  'Yellow Deck',
  'Green Deck',
  'Black Deck',
  'Magic Deck',
  'Nebula Deck',
  'Ghost Deck',
  'Abandoned Deck',
  'Checkered Deck',
  'Zodiac Deck',
  'Painted Deck',
  'Anaglyph Deck',
  'Plasma Deck',
  'Erratic Deck',
].map((label) => ({ value: label.toLowerCase().replace(/ /g, '-'), label }));

const stakes = ['White', 'Red', 'Green', 'Black', 'Blue', 'Purple', 'Orange', 'Gold'].map((s) => ({
  value: s.toLowerCase(),
  label: `${s} Stake`,
}));

const meta = {
  title: 'Primitives/Cycle',
  component: Cycle,
  args: { label: 'Stake', options: stakes },
} satisfies Meta<typeof Cycle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 15 decks: too many for pips, so they hide on their own. */
export const NewRun: Story = {
  render: () => {
    const [deck, setDeck] = useState('red-deck');
    return (
      <Panel title="New Run" style={{ width: 340, justifyItems: 'center' }}>
        <Cycle label="Deck" options={decks} value={deck} onValueChange={setDeck} />
        <Cycle label="Stake" options={stakes} />
      </Panel>
    );
  },
};

export const NoLoop: Story = {
  args: { loop: false, label: 'Speed', options: [1, 2, 4, 8].map((n) => ({ value: n, label: `${n}x` })) },
};
