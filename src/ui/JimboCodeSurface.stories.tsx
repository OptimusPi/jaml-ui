import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboCodeSurface } from "./JimboCodeSurface.js";
import { JimboText } from "./jimboText.js";

const meta: Meta<typeof JimboCodeSurface> = {
  title: "Primitives/Layout/JimboCodeSurface",
  component: JimboCodeSurface,
};
export default meta;
type Story = StoryObj<typeof JimboCodeSurface>;

export const EmptyEditorWell: Story = {
  name: "Empty JAML well before CodeMirror mounts",
  render: () => (
    <StoryScene title="JAML" tone="blue">
      <JimboText size="sm" tone="grey">
        Editor view attaches here
      </JimboText>
      <JimboCodeSurface minHeight={200} />
    </StoryScene>
  ),
};

export const MountedView: Story = {
  name: "CodeMirror stand-in after mount",
  render: () => {
    const mount = useCallback((node: HTMLDivElement | null) => {
      if (!node) return;
      const line = document.createElement("pre");
      line.style.margin = "0";
      line.style.padding = "12px";
      line.style.fontFamily = "var(--j-font-code)";
      line.style.fontSize = "14px";
      line.style.color = "var(--j-green-text)";
      line.textContent = "must:\n  - joker: Blueprint\n    antes: [1, 2]";
      node.appendChild(line);
      return () => line.remove();
    }, []);
    return (
      <StoryScene title="JAML" tone="blue">
        <JimboCodeSurface ref={mount} minHeight={160} />
      </StoryScene>
    );
  },
};
