import type { Meta, StoryObj } from '@storybook/react-vite';
import { toneNames } from '../tokens.ts';
import { Badge } from './Badge.tsx';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { children: 'Rare', tone: 'red', size: 'md' },
  argTypes: {
    tone: { control: 'inline-radio', options: toneNames },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rarities: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Badge tone="blue">Common</Badge>
      <Badge tone="green">Uncommon</Badge>
      <Badge tone="red">Rare</Badge>
      <Badge tone="purple">Legendary</Badge>
    </div>
  ),
};
