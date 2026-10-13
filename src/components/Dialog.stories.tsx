import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.tsx';
import { Dialog } from './Dialog.tsx';
import { Switch } from './Switch.tsx';

const meta = {
  title: 'Primitives/Dialog',
  component: Dialog,
  args: {
    title: 'Options',
    trigger: <Button tone="orange">Options</Button>,
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Escape or Back closes it. Focus is trapped inside while open and returns to the trigger after. */
export const Playground: Story = {
  render: (args) => (
    <Dialog
      {...args}
      actions={
        <>
          <Button tone="blue" block>
            Settings
          </Button>
          <Button tone="red" block>
            Main Menu
          </Button>
        </>
      }
    />
  ),
};

export const WithContent: Story = {
  args: {
    title: 'Search settings',
    description: 'Applies to the next search.',
    trigger: <Button tone="blue">Search settings</Button>,
  },
  render: (args) => (
    <Dialog {...args}>
      <Switch label="Stop at first match" defaultChecked />
      <Switch label="Show near misses" />
    </Dialog>
  ),
};
