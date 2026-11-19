import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { JimboCanvasSurface } from "./JimboCanvasSurface.js";

function CanvasSurfaceDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div style={{ width: 95 }}>
      <JimboCanvasSurface
        containerRef={containerRef}
        canvasRef={canvasRef}
        aspectRatio={71 / 95}
      />
    </div>
  );
}

const meta: Meta<typeof JimboCanvasSurface> = {
  title: "Primitives/Surfaces/JimboCanvasSurface",
  component: JimboCanvasSurface,
};

export default meta;
type Story = StoryObj<typeof JimboCanvasSurface>;

export const Default: Story = {
  render: () => <CanvasSurfaceDemo />,
};
