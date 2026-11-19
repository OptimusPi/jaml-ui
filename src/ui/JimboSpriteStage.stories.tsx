import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboSpriteStage, JimboSpriteLayer } from "./JimboSpriteStage.js";
import { resolveJamlAssetUrl } from "../assets.js";

const meta: Meta<typeof JimboSpriteStage> = {
  title: "Primitives/Surfaces/JimboSpriteStage",
  component: JimboSpriteStage,
};

export default meta;
type Story = StoryObj<typeof JimboSpriteStage>;

export const Default: Story = {
  render: () => (
    <JimboSpriteStage width={71} height={95} title="Sample Sprite Stage">
      <JimboSpriteLayer
        inset
        imageUrl={resolveJamlAssetUrl("enhancers")}
        backgroundSize="700% 500%"
        backgroundPosition="0% 0%"
      />
    </JimboSpriteStage>
  ),
};
