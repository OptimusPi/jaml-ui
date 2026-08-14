import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { JimboOrbitalMenu } from './JimboOrbitalMenu';
import { JimboText } from './jimboText';
import { JimboStack } from './JimboLayout';

/**
 * `JimboOrbitalMenu` is `position: absolute; inset: 0`, so it renders nothing
 * visible unless its parent is positioned and has a size — every story here
 * wraps it in a fixed-size relative box for that reason.
 *
 * Items are `role="button" tabIndex={0}`, so the whole ring is keyboard
 * reachable: tab to an item, Enter or Space to activate.
 */
const meta = {
  title: 'Jimbo/Menus/OrbitalMenu',
  component: JimboOrbitalMenu,
} satisfies Meta<typeof JimboOrbitalMenu>;
export default meta;

const ITEMS = [
  { label: 'analyze', action: 'analyze' },
  { label: 'search', action: 'search', tone: 'green' as const },
  { label: 'save', action: 'save', tone: 'gold' as const },
  { label: 'share', action: 'share', tone: 'purple' as const },
  { label: 'reset', action: 'reset', tone: 'red' as const },
];

const Stage = ({ size = 260, children }: { size?: number; children: React.ReactNode }) => (
  <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
    {children}
  </div>
);

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Stage>
      <JimboOrbitalMenu items={ITEMS} />
    </Stage>
  ),
};

/** Radius drives how far the badges sit from the centre of the parent box. */
export const TightRadius: StoryObj<typeof meta> = {
  render: () => (
    <Stage size={180}>
      <JimboOrbitalMenu items={ITEMS} radius={55} />
    </Stage>
  ),
};

/** A single item sits at the top of the circle; two sit top and bottom. */
export const FewItems: StoryObj<typeof meta> = {
  render: () => (
    <Stage size={200}>
      <JimboOrbitalMenu items={ITEMS.slice(0, 2)} radius={70} />
    </Stage>
  ),
};

/** Click or keyboard-activate a badge to see the action fire. */
export const Interactive: StoryObj<typeof meta> = {
  render: function Interactive() {
    const [last, setLast] = useState('none yet');
    return (
      <JimboStack gap="md" align="center">
        <Stage>
          <JimboOrbitalMenu items={ITEMS} onAction={setLast} />
        </Stage>
        <JimboText size="sm" tone="grey">
          last action: {last}
        </JimboText>
      </JimboStack>
    );
  },
};

/** Empty input renders nothing at all rather than an empty ring. */
export const NoItems: StoryObj<typeof meta> = {
  render: () => (
    <JimboStack gap="sm" align="center">
      <Stage size={120}>
        <JimboOrbitalMenu items={[]} />
      </Stage>
      <JimboText size="sm" tone="grey">
        renders null
      </JimboText>
    </JimboStack>
  ),
};
