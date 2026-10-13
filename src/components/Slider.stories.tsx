import type { Meta, StoryObj } from '@storybook/react-vite';
import { toneNames } from '../tokens.ts';
import { Panel } from './Panel.tsx';
import { Slider } from './Slider.tsx';

const meta = {
  title: 'Primitives/Slider',
  component: Slider,
  args: { label: 'Game speed', tone: 'red', defaultValue: 2, min: 0.5, max: 4, step: 0.5 },
  argTypes: { tone: { control: 'inline-radio', options: toneNames } },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Slider {...args} />
    </div>
  ),
};

export const Audio: Story = {
  render: () => (
    <Panel title="Audio" style={{ width: 320 }}>
      <Slider label="Master volume" defaultValue={50} />
      <Slider label="Music" defaultValue={100} />
      <Slider label="Sound" defaultValue={30} disabled />
    </Panel>
  ),
};
