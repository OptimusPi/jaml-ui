import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select.tsx';

const jokers = [
  'Joker',
  'Blueprint',
  'Brainstorm',
  'Perkeo',
  'Triboulet',
  'Yorick',
  'Chicot',
  'Canio',
  'Showman',
  'Invisible Joker',
  'Mime',
  'Baron',
].map((label) => ({ value: label.toLowerCase().replace(/ /g, '-'), label }));

const meta = {
  title: 'Primitives/Select',
  component: Select,
  args: { label: 'Must have joker', items: jokers, placeholder: 'Any joker' },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithValue: Story = { args: { defaultValue: 'blueprint' } };

export const Disabled: Story = { args: { disabled: true } };
