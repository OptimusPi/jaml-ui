import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboSectionHeader } from "./JimboSectionHeader.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboSectionHeader> = {
  title: "Primitives/Layout/JimboSectionHeader",
  component: JimboSectionHeader,
};
export default meta;
type Story = StoryObj<typeof JimboSectionHeader>;

export const AnteBreakdown: Story = {
  name: "Jamlyze ante sections",
  render: () => (
    <StoryScene title="Jamlyze" tone="purple">
      <JimboStack gap="md">
        <JimboStack gap="xs">
          <JimboSectionHeader label="Boss & Voucher" tone="gold" />
          <JimboText size="sm" tone="white">
            The Hook · Overstock
          </JimboText>
        </JimboStack>
        <JimboStack gap="xs">
          <JimboSectionHeader label="Tags" tone="green" />
          <JimboText size="sm" tone="white">
            Rare Tag
          </JimboText>
        </JimboStack>
        <JimboStack gap="xs">
          <JimboSectionHeader label="Shop Queue" tone="red" />
          <JimboText size="sm" tone="grey">
            Trading Card · Rocket · Empress
          </JimboText>
        </JimboStack>
      </JimboStack>
    </StoryScene>
  ),
};
