import type { Meta, StoryObj } from '@storybook/react-vite'
import { JimboCardSlot } from './JimboCardSlot'

/**
 * The card atom. Identity = artwork. Hover (desktop) / tap (mobile) / focus
 * (keyboard) reveals the name + ability — never a label wrapped under the card.
 */
const meta = {
  title: 'JimboUI / JimboCardSlot',
  component: JimboCardSlot,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof JimboCardSlot>

export default meta
type Story = StoryObj<typeof meta>

export const TapForInfo: Story = {
  args: {
    name: 'Blueprint',
    width: 71,
    badge: { tone: 'blue', label: 'Joker' },
    info: 'Copies the ability of the Joker to the right.',
  },
}

/** A little shop row — hover or tap any card to read it. No labels anywhere. */
export const ShopRow: Story = {
  render: () => (
    <div style={{ display: 'grid', gridAutoFlow: 'column', gap: 14, justifyContent: 'start', padding: 24 }}>
      <JimboCardSlot
        name="Blueprint"
        width={71}
        badge={{ tone: 'blue', label: 'Joker' }}
        info="Copies the ability of the Joker to the right."
      />
      <JimboCardSlot
        name="The Emperor"
        sheet="Tarots"
        width={71}
        badge={{ tone: 'purple', label: 'Tarot' }}
        info="Creates up to 2 random Tarot cards. (Must have room.)"
      />
      <JimboCardSlot
        name="Telescope"
        sheet="Vouchers"
        width={71}
        badge={{ tone: 'orange', label: 'Voucher' }}
        info="Celestial Packs always contain the Planet card for your most-played poker hand."
      />
      <JimboCardSlot
        name="Uncommon Tag"
        sheet="tags"
        width={48}
        badge={{ tone: 'green', label: 'Tag' }}
        info="Shop has a free Uncommon Joker."
      />
    </div>
  ),
}
