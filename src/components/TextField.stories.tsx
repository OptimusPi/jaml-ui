import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField.tsx';

const meta = {
  title: 'Primitives/TextField',
  component: TextField,
  args: { label: 'Seed', placeholder: 'ABCD1234', mono: true },
  render: (args) => (
    <div style={{ width: 300 }}>
      <TextField {...args} />
    </div>
  ),
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: { description: 'Eight characters, letters and digits.' },
};

export const Invalid: Story = {
  args: { defaultValue: 'abc', error: 'A seed is 1 to 8 characters, A-Z and 1-9.' },
};

export const PixelFont: Story = {
  args: { label: 'Run name', placeholder: 'My cool run', mono: false },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'ERRATIC1' } };
