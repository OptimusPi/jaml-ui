import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JamlGameCard } from "../components/GameCard.js";
import { JimboShopBelt } from "./JimboShopBelt.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboShopBelt> = {
  title: "Primitives/Interaction/JimboShopBelt",
  component: JimboShopBelt,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof JimboShopBelt>;

const ANTE1 = [
  "Trading Card",
  "Rocket",
  "The Empress",
  "Ceremonial Dagger",
  "Joker Stencil",
  "Raised Fist",
  "Seltzer",
  "Drunkard",
  "Scary Face",
  "Smiley Face",
  "Wee Joker",
  "Raised Fist",
  "Popcorn",
  "Square Joker",
  "Joker",
];

export const Ante1Shop: Story = {
  name: "Drag the ante 1 shop tape",
  render: () => (
    <StoryScene title="Shop Queue" tone="red" variant="page">
      <JimboText size="sm" tone="grey">
        Ante 1 · drag sideways like the in-game shop
      </JimboText>
      <JimboShopBelt>
        {ANTE1.map((name, i) => (
          <JamlGameCard
            key={`${name}-${i}`}
            type={name === "The Empress" ? "consumable" : "joker"}
            card={{ name, scale: 0.85 }}
          />
        ))}
      </JimboShopBelt>
    </StoryScene>
  ),
};

export const SnapHand: Story = {
  name: "Snap to cards in a short hand",
  render: () => (
    <StoryScene title="Shop Queue" tone="red" variant="page">
      <JimboText size="sm" tone="grey">
        snap — each flick lands on a card
      </JimboText>
      <JimboShopBelt snap>
        {ANTE1.slice(0, 8).map((name, i) => (
          <JamlGameCard
            key={`${name}-${i}`}
            type="joker"
            card={{ name, scale: 0.85 }}
          />
        ))}
      </JimboShopBelt>
    </StoryScene>
  ),
};
