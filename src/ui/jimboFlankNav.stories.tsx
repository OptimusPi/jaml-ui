import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboFlankNav } from "./jimboFlankNav.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboFlankNav> = {
  title: "Primitives/Layout/JimboFlankNav",
  component: JimboFlankNav,
};
export default meta;
type Story = StoryObj<typeof JimboFlankNav>;

const ANTES = ["Ante 1", "Ante 2", "Ante 3"];

export const AntePager: Story = {
  name: "Page through Jamlyze antes",
  render: () => {
    const [i, setI] = useState(0);
    return (
      <StoryScene title="Jamlyze" tone="purple">
        <JimboFlankNav
          onPrev={() => setI((n) => Math.max(0, n - 1))}
          onNext={() => setI((n) => Math.min(ANTES.length - 1, n + 1))}
          canPrev={i > 0}
          canNext={i < ANTES.length - 1}
        >
          <JimboText size="md" tone="white">
            {ANTES[i]}
          </JimboText>
        </JimboFlankNav>
      </StoryScene>
    );
  },
};
