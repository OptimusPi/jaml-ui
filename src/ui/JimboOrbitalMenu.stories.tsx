import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboOrbitalMenu } from "./JimboOrbitalMenu.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta = {
  title: "Primitives/Menus/JimboOrbitalMenu",
  component: JimboOrbitalMenu,
} satisfies Meta<typeof JimboOrbitalMenu>;
export default meta;

const ITEMS = [
  { label: "analyze", action: "analyze" },
  { label: "search", action: "search", tone: "green" as const },
  { label: "save", action: "save", tone: "gold" as const },
  { label: "share", action: "share", tone: "purple" as const },
  { label: "reset", action: "reset", tone: "red" as const },
];

const Stage = ({ size = 220, children }: { size?: number; children: React.ReactNode }) => (
  <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
    {children}
  </div>
);

export const HomeRing: StoryObj<typeof meta> = {
  name: "Home-screen action ring",
  render: () => {
    const [last, setLast] = useState("none yet");
    return (
      <StoryScene title="JAML" tone="blue">
        <JimboStack gap="md" align="center">
          <Stage>
            <JimboOrbitalMenu items={ITEMS} onAction={setLast} />
          </Stage>
          <JimboText size="sm" tone="grey">
            last: {last}
          </JimboText>
        </JimboStack>
      </StoryScene>
    );
  },
};
