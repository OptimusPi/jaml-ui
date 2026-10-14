import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboOrbitalMenu, type JimboOrbitalMenuItem } from "./JimboOrbitalMenu.js";
import { createJimboOrbitalStore, useJimboOrbitalMenu } from "./orbitalMenuStore.js";
import { JimboMascot } from "./JimboMascot.js";
import { JimboStack } from "./JimboLayout.js";
import { JimboText } from "./jimboText.js";

const meta = {
  title: "Primitives/Menus/JimboOrbitalMenu",
  component: JimboOrbitalMenu,
  // Every story drives its own items; this only satisfies the required prop so
  // each one can be a bare `render`.
  args: { items: [] },
} satisfies Meta<typeof JimboOrbitalMenu>;
export default meta;

/**
 * The ring's box: what is left of a 375x375 MCP embed once the panel takes its
 * title and padding. The ring sizes itself to this, so it is worth being honest
 * about it — a demo box roomier than the real host hides exactly the crowding
 * the orbit law exists to survive.
 */
const BOX = { w: 300, h: 232 };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", width: BOX.w, height: BOX.h, margin: "0 auto" }}>
      {children}
    </div>
  );
}

const MENUS: Record<string, JimboOrbitalMenuItem[]> = {
  main: [
    { label: "Find Seeds", submenu: "Find Seeds" },
    { label: "Analyze", action: "analyze" },
    { label: "Ante Map", action: "map" },
    { label: "Tools", submenu: "Tools" },
    { label: "Results", action: "results", tone: "purple", count: 12 },
    { label: "Ask Jimbo", action: "chat", tone: "blue" },
    { label: "Voice", action: "voice", active: true },
    { label: "Close", south: true },
  ],
  "Find Seeds": [
    { label: "Erratic", action: "deck:erratic" },
    { label: "Plasma", action: "deck:plasma" },
    { label: "Anaglyph", action: "deck:anaglyph" },
    { label: "Ghost", action: "deck:ghost", disabled: true, dim: true },
    { label: "Back", south: true },
  ],
  Tools: [
    { label: "JAML Editor", action: "tool:jaml" },
    { label: "Ante Map", action: "tool:map" },
    { label: "Ask Jimbo", action: "tool:chat", tone: "blue" },
    { label: "Searching", badge: { label: "Searching", status: "running" } },
    { label: "Back", south: true },
  ],
};

/**
 * The whole organ: mascot at center, ring around him, submenu push/pop on a
 * real state machine, and the south button as the only way out.
 */
export const MascotRing: StoryObj<typeof meta> = {
  name: "Mascot ring",
  render: () => {
    // A private store per story — the shared one would let two rings on a docs
    // page drive each other.
    const [store] = useState(createJimboOrbitalStore);
    const menu = useJimboOrbitalMenu({ store });
    const [last, setLast] = useState("nothing yet");

    return (
      <StoryScene title="JAML" tone="blue">
        <JimboStack gap="md" align="center">
          <Stage>
            <JimboOrbitalMenu
              items={menu.isOpen ? (MENUS[menu.currentMenu] ?? MENUS.main) : []}
              currentMenu={menu.currentMenu}
              closing={menu.isClosing}
              boxHeight={BOX.h}
              mascotSize={84}
              breadcrumb={
                menu.breadcrumb.length > 0 ? (
                  <JimboText size="xs" tone="grey">
                    {menu.breadcrumb.join(" / ")}
                  </JimboText>
                ) : null
              }
              center={
                <JimboMascot
                  size={84}
                  mood={menu.isOpen ? "happy" : "idle"}
                  onClick={menu.toggle}
                  style={{ cursor: "pointer" }}
                />
              }
              onNavigate={menu.navigateTo}
              onBack={menu.back}
              onAction={(action) => {
                setLast(action);
                menu.close();
              }}
            />
          </Stage>
          <JimboText size="sm" tone="grey">
            {menu.isOpen ? `open: ${menu.currentMenu}` : `tap Jimbo — last action: ${last}`}
          </JimboText>
        </JimboStack>
      </StoryScene>
    );
  },
};

/**
 * THE ORBIT LAW with the pager on: pills stack by height and fly to the walls,
 * the south button spans the bottom edge, and the page controls ride above it.
 */
export const Paginated: StoryObj<typeof meta> = {
  name: "Paged ring",
  render: () => (
    <StoryScene title="Results" tone="orange">
      <Stage>
        <JimboOrbitalMenu
          items={[
            { label: "ALEEB", action: "s1", tone: "purple", count: 41 },
            { label: "7LB2WVPK", action: "s2", tone: "purple", count: 38 },
            { label: "MMMMMMMM", action: "s3", tone: "purple", count: 33 },
            { label: "AAAAAAAA", action: "s4", tone: "purple", count: 30 },
            { label: "Scanning", badge: { label: "ante 6/8", status: "running" } },
            { label: "Back", south: true },
          ]}
          boxHeight={BOX.h}
          mascotSize={96}
          showPageControls
          center={<JimboMascot size={96} mood="surprised" />}
        />
      </Stage>
    </StoryScene>
  ),
};

/**
 * No box height: the boxless fallback rides the ellipse and derives the south
 * button's width from the ring instead of the container.
 */
export const Ellipse: StoryObj<typeof meta> = {
  name: "Boxless ellipse",
  render: () => (
    <StoryScene title="Orbit" tone="green">
      <Stage>
        <JimboOrbitalMenu
          items={[
            { label: "New", action: "new", tone: "green" },
            { label: "Open", action: "open" },
            { label: "Share", action: "share", tone: "blue" },
            { label: "Shader", action: "shader", active: false },
            { label: "Back", south: true },
          ]}
          radius={104}
          radiusY={88}
          mascotSize={88}
          center={<JimboMascot size={88} />}
        />
      </Stage>
    </StoryScene>
  ),
};
