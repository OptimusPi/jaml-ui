import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JamlBoss, JamlGameCard, JamlTag, JamlVoucher } from "./GameCard.js";
import { JimboRow } from "../ui/JimboLayout.js";
import { JimboSectionHeader } from "../ui/JimboSectionHeader.js";
import { JimboShopBelt } from "../ui/JimboShopBelt.js";
import { JimboStack } from "../ui/JimboLayout.js";
import { JimboText } from "../ui/jimboText.js";

const meta: Meta<typeof JamlGameCard> = {
  title: "Primitives/Cards/GameCard",
  component: JamlGameCard,
};
export default meta;
type Story = StoryObj<typeof JamlGameCard>;

export const ShopTape: Story = {
  name: "Ante 1 shop — the cards you actually see",
  render: () => (
    <StoryScene title="Shop Queue" tone="red" variant="page">
      <JimboText size="sm" tone="grey">
        Drag the tape. This is a shop, not a sticker sheet.
      </JimboText>
      <JimboShopBelt>
        {["Joker", "Blueprint", "Brainstorm", "Wee Joker", "Trading Card"].map((name) => (
          <JamlGameCard key={name} type="joker" card={{ name, scale: 1 }} hoverTilt />
        ))}
      </JimboShopBelt>
    </StoryScene>
  ),
};

export const EditionsInShop: Story = {
  name: "Same joker, shop editions",
  render: () => (
    <StoryScene title="Shop Queue" tone="red" variant="page">
      <JimboShopBelt>
        <JamlGameCard type="joker" card={{ name: "Joker", scale: 1 }} />
        <JamlGameCard type="joker" card={{ name: "Joker", edition: "Foil", scale: 1 }} />
        <JamlGameCard type="joker" card={{ name: "Joker", edition: "Holographic", scale: 1 }} />
        <JamlGameCard type="joker" card={{ name: "Joker", edition: "Polychrome", scale: 1 }} />
        <JamlGameCard type="joker" card={{ name: "Joker", edition: "Negative", scale: 1 }} />
      </JimboShopBelt>
    </StoryScene>
  ),
};

export const StickersOnRentals: Story = {
  name: "Rental / eternal / perishable on a shop card",
  render: () => (
    <StoryScene title="Shop Queue" tone="red">
      <JimboRow gap="md">
        <JamlGameCard type="joker" card={{ name: "Joker", isEternal: true, scale: 1 }} />
        <JamlGameCard type="joker" card={{ name: "Joker", isPerishable: true, scale: 1 }} />
        <JamlGameCard type="joker" card={{ name: "Joker", isRental: true, scale: 1 }} />
      </JimboRow>
    </StoryScene>
  ),
};

export const PlayingHand: Story = {
  name: "A played hand with seals",
  render: () => (
    <StoryScene title="Inspect" tone="blue" variant="page">
      <JimboText size="sm" tone="grey">
        Glass Ace, steel Queen, gold-seal 10
      </JimboText>
      <JimboRow gap="sm">
        <JamlGameCard
          type="playing"
          card={{ name: "Ace of Hearts", rank: "Ace", suit: "Hearts", enhancements: ["Glass"], scale: 1 }}
        />
        <JamlGameCard
          type="playing"
          card={{ name: "Queen of Spades", rank: "Queen", suit: "Spades", enhancements: ["Steel"], scale: 1 }}
        />
        <JamlGameCard
          type="playing"
          card={{
            name: "10 of Diamonds",
            rank: "10",
            suit: "Diamonds",
            seal: "Gold Seal",
            scale: 1,
          }}
        />
      </JimboRow>
    </StoryScene>
  ),
};

export const AnteChrome: Story = {
  name: "Boss, voucher, tag on an ante card",
  render: () => (
    <StoryScene title="Jamlyze" tone="purple">
      <JimboStack gap="md">
        <JimboSectionHeader label="Boss & Voucher" tone="gold" />
        <JimboRow gap="md">
          <JamlBoss bossName="The Wall" scale={1} />
          <JamlVoucher voucherName="Overstock" scale={1} />
        </JimboRow>
        <JimboSectionHeader label="Tags" tone="green" />
        <JamlTag tagName="Rare Tag" scale={1} />
      </JimboStack>
    </StoryScene>
  ),
};
