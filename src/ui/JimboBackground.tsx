'use client'

import { useBalatroBackground, type JimboBackgroundConfig } from './hooks.js'

export type { JimboBackgroundConfig, JimboBackgroundColor } from './hooks.js'

/**
 * Fullscreen WebGL CRT/spin background. Shader knobs are uniforms
 * (`useBalatroBackground`) so Storybook can drive swirl / pixel / RGB.
 */
export function JimboBackground(config: JimboBackgroundConfig = {}) {
  const canvasRef = useBalatroBackground(config)
  return <canvas ref={canvasRef} className="j-background-canvas" aria-hidden />
}
