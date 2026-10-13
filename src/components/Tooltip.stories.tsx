import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.tsx';
import { Tooltip } from './Tooltip.tsx';

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  args: {
    content: '+4 Mult',
    side: 'top',
    children: <Button tone="blue">Hover me</Button>,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    children: { control: false },
  },
  render: (args) => (
    <div style={{ padding: 60 }}>
      <Tooltip {...args} />
    </div>
  ),
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = { args: { open: true } };
