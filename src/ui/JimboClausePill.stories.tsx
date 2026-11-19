import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboClausePill } from "./JimboClausePill.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboSprite } from "./sprites.js";

const meta: Meta<typeof JimboClausePill> = {
  title: "Primitives/Display/JimboClausePill",
  component: JimboClausePill,
};

export default meta;
type Story = StoryObj<typeof JimboClausePill>;

export const States: Story = {
  render: () => (
    <JimboRow gap="md" wrap>
      <JimboClausePill
        zone="must"
        label="Blueprint"
        matchCount={1}
        sprite={<JimboSprite name="Blueprint" sheet="Jokers" width={26} />}
      />
      <JimboClausePill
        zone="should"
        label="Perkeo"
        matchCount={3}
        sprite={<JimboSprite name="Perkeo" sheet="Jokers" width={26} />}
      />
      <JimboClausePill
        zone="mustNot"
        label="Obelisk"
        matchCount={0}
        sprite={<JimboSprite name="Obelisk" sheet="Jokers" width={26} />}
      />
    </JimboRow>
  ),
};
