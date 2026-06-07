'use client'

import React from 'react'
import { JimboSprite } from './sprites.js'
import type { SpriteSheetType } from '../sprites/spriteMapper.js'

export interface JimboSpritePillProps {
  /** Sprite to render (e.g. a joker/voucher/tag name). */
  spriteName: string
  /** Which sprite sheet to pull from. */
  sheet: SpriteSheetType
  /** Text shown beside the sprite. */
  label: string
  /** Glow/accent color (any CSS color) applied when this pill is a hit. */
  glow: string
  /** Match count. > 0 lights the pill up and shows a count badge. */
  matchCount: number
  /** Native title/tooltip. */
  title?: string
}

/**
 * A sprite + label chip that glows and shows a count badge when matched.
 * Grid-composed (no flex); the accent is the `--j-pill-glow` custom property.
 */
export function JimboSpritePill({
  spriteName,
  sheet,
  label,
  glow,
  matchCount,
  title,
}: JimboSpritePillProps) {
  const isHit = matchCount > 0
  return (
    <div
      className="j-clause-pill"
      data-hit={isHit}
      style={{ '--j-pill-glow': glow } as React.CSSProperties}
      title={title}
    >
      <JimboSprite name={spriteName} sheet={sheet} width={26} />
      <div className="j-clause-pill__label">{label}</div>
      {isHit && (
        <div className="j-clause-pill__badge">{matchCount > 1 ? `x${matchCount}` : '1'}</div>
      )}
    </div>
  )
}
