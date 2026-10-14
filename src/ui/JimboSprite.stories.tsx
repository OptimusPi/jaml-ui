import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboSprite } from "./sprites.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboSprite> = {
  title: "Primitives/Cards/JimboSprite",
  component: JimboSprite,
};
export default meta;
type Story = StoryObj<typeof JimboSprite>;

export const ShopPeek: Story = {
  name: "Joker sprite in a shop peek",
  render: () => (
    <StoryScene title="Shop Queue" tone="red">
      <JimboRow gap="md" align="end">
        <JimboSprite name="Joker" sheet="Jokers" width={142} />
        <JimboStack gap="xs">
          <JimboText size="sm" tone="white">
            Joker
          </JimboText>
          <JimboText size="xs" tone="gold">
            $2
          </JimboText>
        </JimboStack>
      </JimboRow>
    </StoryScene>
  ),
};

export const BossChip: Story = {
  name: "Boss chip on the ante rail",
  render: () => (
    <StoryScene title="Jamlyze" tone="purple">
      <JimboRow gap="md" align="center">
        <JimboSprite name="The Hook" sheet="BlindChips" width={68} />
        <JimboText size="sm" tone="white">
          The Hook
        </JimboText>
      </JimboRow>
    </StoryScene>
  ),
};
