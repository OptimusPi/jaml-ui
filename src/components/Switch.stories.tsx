import type { Meta, StoryObj } from '@storybook/react-vite';
import { toneNames } from '../tokens.ts';
import { Panel } from './Panel.tsx';
import { Switch } from './Switch.tsx';

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  args: { label: 'Screen shake', tone: 'red', defaultChecked: true },
  argTypes: { tone: { control: 'inline-radio', options: toneNames } },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SettingsList: Story = {
  render: () => (
    <Panel title="Game" style={{ width: 300 }}>
      <div style={{ display: 'grid', gap: 12, justifyItems: 'end' }}>
        <Switch label="Screen shake" defaultChecked />
        <Switch label="Show seed" />
        <Switch label="Crash on error" disabled />
      </div>
    </Panel>
  ),
};
