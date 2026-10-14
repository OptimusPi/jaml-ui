import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboBackground } from "./JimboBackground.js";
import { JimboColorOption } from "./tokens.js";

/** Shader palette = the color tokens, not a free picker. */
const SHADER_COLORS = {
  "--j-red": JimboColorOption.RED,
  "--j-blue": JimboColorOption.BLUE,
  "--j-green": JimboColorOption.GREEN,
  "--j-orange": JimboColorOption.ORANGE,
  "--j-gold": JimboColorOption.GOLD,
  "--j-purple": JimboColorOption.PURPLE,
  "--j-dark-red": JimboColorOption.DARK_RED,
  "--j-dark-blue": JimboColorOption.DARK_BLUE,
  "--j-dark-green": JimboColorOption.DARK_GREEN,
  "--j-dark-orange": JimboColorOption.DARK_ORANGE,
  "--j-darkest": JimboColorOption.DARKEST,
  "--j-black": JimboColorOption.BLACK,
  "--j-planet": JimboColorOption.PLANET,
  "--j-spectral": JimboColorOption.SPECTRAL,
} as const;

const tokenSelect = {
  control: "select" as const,
  options: Object.keys(SHADER_COLORS),
  mapping: SHADER_COLORS,
};

const meta: Meta<typeof JimboBackground> = {
  title: "Primitives/Foundations/Background",
  component: JimboBackground,
  parameters: { layout: "fullscreen" },
  globals: { swirl: "off" },
  args: {
    primary: "--j-red",
    secondary: "--j-blue",
    dark: "--j-darkest",
    speed: 1,
    spinRotation: -2,
    spinAmount: 0.35,
    pixelFilter: 244,
    contrast: 4.5,
    lighting: 0.5,
  },
  argTypes: {
    primary: { ...tokenSelect, description: "COLOUR_1" },
    secondary: { ...tokenSelect, description: "COLOUR_2" },
    dark: { ...tokenSelect, description: "COLOUR_3" },
    speed: { control: { type: "range", min: 0, max: 4, step: 0.05 } },
    spinRotation: { control: { type: "range", min: -6, max: 6, step: 0.1 } },
    spinAmount: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    pixelFilter: { control: { type: "range", min: 40, max: 1024, step: 4 } },
    contrast: { control: { type: "range", min: 0.5, max: 12, step: 0.1 } },
    lighting: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    transitionMs: { control: { type: "range", min: 0, max: 2000, step: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof JimboBackground>;

export const Playground: Story = {};
