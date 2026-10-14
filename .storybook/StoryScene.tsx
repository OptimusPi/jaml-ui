import type { ReactNode } from "react";
import { JimboApp, type JimboAppVariant } from "../src/ui/JimboApp.js";
import { JimboPanel } from "../src/ui/JimboPanel.js";
import type { JimboSectionTone } from "../src/ui/JimboSectionHeader.js";

/** Primitive stories live in the MCP embed by default. Apps use appFrame. */
export function StoryScene({
  title,
  tone = "blue",
  variant = "embed",
  children,
}: {
  title: string;
  tone?: JimboSectionTone;
  variant?: JimboAppVariant;
  children: ReactNode;
}) {
  return (
    <JimboApp variant={variant}>
      <JimboPanel title={title} tone={tone}>
        {children}
      </JimboPanel>
    </JimboApp>
  );
}
