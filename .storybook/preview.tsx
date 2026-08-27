import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/ui/jimbo.css";
import "./preview.css";
import { JimboBackground } from "../src/ui/JimboBackground.js";
import { JimboBalatroFooter } from "../src/components/JimboBalatroFooter.js";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Welcome", "Foundations", "Primitives", "Cards & Sprites", "Screens", "JsonRender"],
        method: "alphabetical",
      },
    },
    backgrounds: {
      default: "balatro-teal",
      values: [
        { name: "balatro-teal", value: "#0c1818" },
        { name: "balatro-table", value: "#1a3333" },
        { name: "red-deck", value: "#2e1215" },
        { name: "blue-deck", value: "#0f2033" },
        { name: "gold-stake", value: "#29220f" },
        { name: "nebula-purple", value: "#170f2b" },
        { name: "crt-black", value: "#050708" },
        { name: "light-felt", value: "#e8ecec" },
      ],
    },
  },

  globalTypes: {
    swirl: {
      name: "WebGL Swirl",
      description: "Toggle authentic animated Balatro WebGL swirl shader background",
      defaultValue: "on",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "on", title: "Swirl on" },
          { value: "off", title: "Swirl off (static felt)" },
        ],
        showName: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const showSwirl = context.globals.swirl !== "off";
      return (
        <div className="story-root">
          {showSwirl && <JimboBackground />}
          <Story />
          <JimboBalatroFooter />
        </div>
      );
    },
  ],
};

export default preview;
