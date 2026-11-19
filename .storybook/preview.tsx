import type { Preview } from "@storybook/react-vite";
import "../src/ui/jimbo.css";
import "./preview.css";
import { JimboBackground } from "../src/ui/JimboBackground.js";
import { JimboBox } from "../src/ui/JimboBox.js";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Welcome", "Foundations", "Primitives", "Cards & Sprites", "Wire Format", "Screens"],
        method: "alphabetical",
      },
    },
    backgrounds: {
      options: {
        balatro: { name: "balatro", value: "#0c1818" }
      }
    },
  },

  decorators: [
    (Story) => (
      <JimboBox className="story-root">
        <JimboBackground />
        <Story />
      </JimboBox>
    ),
  ],

  initialGlobals: {
    backgrounds: {
      value: "balatro"
    }
  }
};

export default preview;
