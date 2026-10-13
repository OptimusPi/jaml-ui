import type { Meta, StoryObj } from '@storybook/react-vite';
import { toneNames } from '../tokens.ts';
import { Panel } from './Panel.tsx';
import { Tab, TabList, TabPanel, Tabs } from './Tabs.tsx';

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  args: { tone: 'red', size: 'sm', defaultValue: 'jokers' },
  argTypes: {
    tone: { control: 'inline-radio', options: toneNames },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Arrow keys move between tabs. The arrow above marks the selected one. */
export const Playground: Story = {
  render: (args) => (
    <Panel style={{ width: 420 }}>
      <Tabs {...args}>
        <TabList aria-label="Collection">
          <Tab value="jokers">Jokers</Tab>
          <Tab value="decks">Decks</Tab>
          <Tab value="vouchers">Vouchers</Tab>
          <Tab value="tags">Tags</Tab>
        </TabList>
        <TabPanel value="jokers">150 jokers</TabPanel>
        <TabPanel value="decks">15 decks</TabPanel>
        <TabPanel value="vouchers">32 vouchers</TabPanel>
        <TabPanel value="tags">24 tags</TabPanel>
      </Tabs>
    </Panel>
  ),
};
