import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboMascot } from "./JimboMascot.js";
import { JimboRow } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta = {
  title: "Primitives/Display/JimboMascot",
  component: JimboMascot,
} satisfies Meta<typeof JimboMascot>;
export default meta;

export const EmptyHits: StoryObj<typeof meta> = {
  name: "Jammy reacts to an empty search",
  render: () => (
    <StoryScene title="Results" tone="gold">
      <JimboRow gap="md" align="center">
        <JimboMascot mood="surprised" />
        <JimboText size="sm" tone="grey">
          Zero seeds. Loosen a Must.
        </JimboText>
      </JimboRow>
    </StoryScene>
  ),
};

export const RadialMenu: StoryObj<typeof meta> = {
  name: "Jammy radial from the home screen",
  render: () => (
    <StoryScene title="JAML" tone="blue">
      <JimboRow gap="xl" justify="center">
        <JimboMascot
          menuItems={[
            { label: "Search", action: "search", tone: "blue" },
            { label: "Analyze", action: "analyze", tone: "green" },
            { label: "Copy", action: "copy", tone: "purple" },
            { label: "Help", action: "help" },
          ]}
          onMenuAction={(action) => console.log("menu action", action)}
        />
      </JimboRow>
    </StoryScene>
  ),
};

/**
 * The whole organ from one component: the mascot owns the tap, the menu path,
 * the pager and the south exit, so a consumer supplies items and handles
 * actions — nothing else. This is what seedfinder.app hand-assembled.
 */
export const HostedMenu: StoryObj<typeof meta> = {
  name: "Jammy hosts a submenu tree",
  render: () => (
    <StoryScene title="Seed Lab" tone="blue">
      {/* The ring centers on the mascot, so the host puts the mascot where the
          ring's center belongs — here, the middle of its square. */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: 300,
          height: 232,
          margin: "0 auto",
        }}
      >
        <JimboMascot
          size={84}
          orbitBoxWidth={300}
          orbitBoxHeight={232}
          getMenuItems={(stack) =>
            stack.at(-1) === "Filters"
              ? [
                  { label: "Must", action: "add-must" },
                  { label: "Should", action: "add-should" },
                  { label: "Must Not", action: "add-mustnot" },
                  { label: "Browser", action: "browser" },
                  { label: "Map", action: "map", active: true },
                ]
              : [
                  { label: "Search", action: "search" },
                  { label: "Filters", submenu: "Filters" },
                  { label: "Results", action: "results", tone: "purple", count: 12 },
                  { label: "Jamlyze", action: "jamlyze" },
                  { label: "Settings", action: "settings", active: false },
                ]
          }
          onMenuAction={(action) => console.log("menu action", action)}
        />
      </div>
    </StoryScene>
  ),
};
