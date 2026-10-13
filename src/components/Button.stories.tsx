import type { Meta, StoryObj } from '@storybook/react-vite';
import { toneNames } from '../tokens.ts';
import { Button } from './Button.tsx';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Search', tone: 'orange', size: 'md' },
  argTypes: {
    tone: { control: 'inline-radio', options: toneNames },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DisabledWithReason: Story = {
  args: {
    children: 'Search',
    tone: 'green',
    disabled: true,
    disabledReason: 'Paste at least one seed first',
  },
};

export const Block: Story = {
  args: { block: true, children: 'Search' },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Button {...args} />
    </div>
  ),
};
