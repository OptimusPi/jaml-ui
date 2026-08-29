import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/ui/jimbo.css";
import "./preview.css";
import { ensureMotelyReady } from "../src/lib/motely/runtime.js";

void ensureMotelyReady();
import { JIMBO_VIEWPORTS } from "./appFrame.js";
import { JimboBackground } from "../src/ui/JimboBackground.js";
import { JimboBalatroFooter } from "../src/components/JimboBalatroFooter.js";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: JIMBO_VIEWPORTS,
    },
    options: {
      storySort: {
        order: [
          "Primitives",
          "Apps",
          ["Mobile portrait", "MCP on Desktop", "Desktop Website"],
        ],
        method: "alphabetical",
      },
    },
    backgrounds: {
      default: "balatro-teal",
      values: [
        { name: "balatro-teal", value: "#0c1818" },
        { name: "balatro-table", value: "#1a3333" },
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
      const showFooter = context.parameters.jimboFooter === true;
      const flush = context.parameters.storyPad === false;
      return (
        <div className={flush ? "story-root story-root--flush" : "story-root"}>
          {showSwirl && <JimboBackground />}
          <div className={flush ? "story-root__stage story-root__stage--flush" : "story-root__stage"}>
            <Story />
          </div>
          {showFooter ? <JimboBalatroFooter /> : null}
        </div>
      );
    },
  ],
};

export default preview;
