import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboResultRow } from "./JimboResultRow.js";
import { JimboStack } from "./JimboLayout.js";

function ResultRowDemo() {
  const [open, setOpen] = useState(true);
  return (
    <JimboStack gap="sm">
      <JimboResultRow
        seed="ALEEB"
        score={12}
        maxScore={12}
        expandable
        expanded={open}
        onToggle={() => setOpen((v) => !v)}
        tallyLabels={["must: joker: Blueprint", "should: legendaryJoker: Perkeo"]}
        tallyColumns={[1, 2]}
      />
      <JimboResultRow seed="JAML2026" score={5} maxScore={12} />
    </JimboStack>
  );
}

const meta: Meta<typeof JimboResultRow> = {
  title: "Primitives/Display/JimboResultRow",
  component: JimboResultRow,
};

export default meta;
type Story = StoryObj<typeof JimboResultRow>;

export const Default: Story = {
  render: () => <ResultRowDemo />,
};
