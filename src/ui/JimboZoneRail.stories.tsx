import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboZoneRail } from "./JimboZoneRail.js";
import { JimboClausePill } from "./JimboClausePill.js";
import { JimboClauseCard, JimboAddSlotTile } from "./JimboClauseCard.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboSprite } from "./sprites.js";

const meta: Meta<typeof JimboZoneRail> = {
  title: "Primitives/Layout/JimboZoneRail",
  component: JimboZoneRail,
};

export default meta;
type Story = StoryObj<typeof JimboZoneRail>;

export const PreviewVariant: Story = {
  render: () => (
    <JimboStack gap="md">
      <JimboZoneRail zone="must" variant="preview" count={2}>
        <JimboClausePill
          zone="must"
          label="Blueprint"
          matchCount={1}
          title="joker: Blueprint (Found: 1)"
          sprite={<JimboSprite name="Blueprint" sheet="Jokers" width={26} />}
        />
        <JimboClausePill
          zone="must"
          label="Brainstorm"
          matchCount={0}
          title="joker: Brainstorm"
          sprite={<JimboSprite name="Brainstorm" sheet="Jokers" width={26} />}
        />
      </JimboZoneRail>
      <JimboZoneRail zone="should" variant="preview" count={1}>
        <JimboClausePill
          zone="should"
          label="Perkeo"
          matchCount={2}
          title="legendaryJoker: Perkeo (Found: 2)"
          sprite={<JimboSprite name="Perkeo" sheet="Jokers" width={26} />}
        />
      </JimboZoneRail>
      <JimboZoneRail zone="mustNot" variant="preview" count={0} emptyText="drop clauses here" />
    </JimboStack>
  ),
};

export const EditorVariant: Story = {
  render: () => (
    <JimboStack gap="md">
      <JimboZoneRail zone="must" variant="editor" count={1}>
        <JimboClauseCard
          zone="must"
          label="Blueprint"
          antes={[1, 2]}
          sprite={<JimboSprite name="Blueprint" sheet="Jokers" width={40} />}
          onRemove={() => {}}
          onEdit={() => {}}
        />
        <JimboAddSlotTile zone="must" onTap={() => {}} />
      </JimboZoneRail>
      <JimboZoneRail zone="should" variant="editor" count={1}>
        <JimboClauseCard
          zone="should"
          label="Brainstorm"
          antes={[1]}
          score={10}
          sprite={<JimboSprite name="Brainstorm" sheet="Jokers" width={40} />}
          onRemove={() => {}}
          onEdit={() => {}}
        />
        <JimboAddSlotTile zone="should" onTap={() => {}} />
      </JimboZoneRail>
      <JimboZoneRail zone="mustnot" variant="editor" count={0}>
        <JimboAddSlotTile zone="mustnot" onTap={() => {}} />
      </JimboZoneRail>
    </JimboStack>
  ),
};
