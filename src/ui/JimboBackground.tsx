'use client'

import React from 'react'
import { useBalatroBackground, type JimboBackgroundConfig } from './hooks.js'

export type { JimboBackgroundConfig, JimboBackgroundColor } from './hooks.js'

export interface JimboBackgroundProps extends JimboBackgroundConfig {
  className?: string
  style?: React.CSSProperties
}

/**
 * Fullscreen WebGL CRT/spin background. Shader knobs are uniforms
 * (`useBalatroBackground`) so Storybook can drive swirl / pixel / RGB.
 */
export function JimboBackground({ className, style, ...config }: JimboBackgroundProps = {}) {
  const canvasRef = useBalatroBackground(config)
  const classes = ['j-background-canvas', className].filter(Boolean).join(' ')
  return <canvas ref={canvasRef} className={classes} style={style} aria-hidden />
}
