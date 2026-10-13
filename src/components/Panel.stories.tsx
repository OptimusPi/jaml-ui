import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge.tsx';
import { Button } from './Button.tsx';
import { Panel } from './Panel.tsx';

const meta = {
  title: 'Primitives/Panel',
  component: Panel,
  args: { title: 'Run Info', variant: 'raised' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['raised', 'inset'] },
  },
} satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Panel {...args} style={{ width: 320 }}>
      <Panel variant="inset">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Ante</span>
          <Badge tone="orange">3 / 8</Badge>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Round</span>
          <Badge tone="red">7</Badge>
        </div>
      </Panel>
      <Button tone="orange" block>
        Back
      </Button>
    </Panel>
  ),
};
