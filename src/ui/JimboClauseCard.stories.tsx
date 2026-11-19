import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboClauseCard, JimboAddSlotTile } from "./JimboClauseCard.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboSprite } from "./sprites.js";

const meta: Meta<typeof JimboClauseCard> = {
  title: "Primitives/Display/JimboClauseCard",
  component: JimboClauseCard,
};

export default meta;
type Story = StoryObj<typeof JimboClauseCard>;

export const Variants: Story = {
  render: () => (
    <JimboStack gap="md">
      <JimboClauseCard
        zone="must"
        label="Blueprint"
        antes={[1, 2, 3]}
        sprite={<JimboSprite name="Blueprint" sheet="Jokers" width={40} />}
        onRemove={() => {}}
        onEdit={() => {}}
      />
      <JimboClauseCard
        zone="should"
        label="Brainstorm"
        antes={[1]}
        score={15}
        sprite={<JimboSprite name="Brainstorm" sheet="Jokers" width={40} />}
        onRemove={() => {}}
        onEdit={() => {}}
      />
      <JimboAddSlotTile zone="must" onTap={() => {}} />
    </JimboStack>
  ),
};
