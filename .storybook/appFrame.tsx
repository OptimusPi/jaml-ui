import type { Decorator, Meta } from "@storybook/react-vite";
import bootsharp from "motely-wasm";
import { JimboApp, type JimboAppVariant } from "../src/ui/JimboApp.js";

export const JIMBO_VIEWPORTS = {
  phone: {
    name: "Mobile portrait",
    styles: { width: "375px", height: "667px" },
    type: "mobile" as const,
  },
  mcp: {
    name: "MCP on Desktop",
    styles: { width: "375px", height: "375px" },
    type: "other" as const,
  },
  desktop: {
    name: "Desktop Website",
    styles: { width: "1280px", height: "800px" },
    type: "desktop" as const,
  },
};

export type AppShell = "phone" | "mcp" | "desktop";

const TITLE: Record<AppShell, string> = {
  phone: "Apps/Mobile portrait",
  mcp: "Apps/MCP on Desktop",
  desktop: "Apps/Desktop Website",
};

const VARIANT: Record<AppShell, JimboAppVariant> = {
  phone: "phone",
  mcp: "embed",
  desktop: "page",
};

export function appMeta(shell: AppShell): Meta {
  const viewportKey = shell === "mcp" ? "mcp" : shell;
  const decorator: Decorator = (Story) => (
    <JimboApp variant={VARIANT[shell]}>
      <Story />
    </JimboApp>
  );
  return {
    title: TITLE[shell],
    loaders: [
      async () => {
        if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
        return {};
      },
    ],
    parameters: {
      layout: "fullscreen",
      storyPad: false,
    },
    globals: {
      viewport: { value: viewportKey, isRotated: false },
    },
    decorators: [decorator],
  };
}
