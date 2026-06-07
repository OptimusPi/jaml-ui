'use client'

import React from 'react'
import { JimboSprite } from './sprites.js'
import { JimboTooltip, type JimboTooltipBadge } from './jimboTooltip.js'
import type { SpriteSheetType } from '../sprites/spriteMapper.js'

export interface JimboCardSlotProps {
  /** Sprite name — the card's IDENTITY (e.g. "Blueprint", "The Emperor"). */
  name: string
  /** Sprite sheet. Omit to auto-resolve from the sprite catalog. */
  sheet?: SpriteSheetType
  /** Card width in px (height derives from the Balatro card ratio). */
  width?: number
  /** Info shown on hover / tap / focus — the Balatro "read the card" popup. */
  info?: React.ReactNode
  /** Optional colored chip at the bottom of the tooltip (e.g. "Tarot", "Joker"). */
  badge?: JimboTooltipBadge
  /** Accessible label. Defaults to `name`. */
  ariaLabel?: string
  /** Fired on click / Enter / Space — select the card. */
  onSelect?: () => void
}

/**
 * A card identified by its ARTWORK, Balatro-style: the sprite IS the identity —
 * no name wrapped underneath. Hover (desktop), tap, or focus (mobile / keyboard)
 * pops the name + ability to the side. Recognize by art; tap for the truth.
 *
 * This is the atom: the json-render registry instantiates it from a JAML node,
 * and r3f will later render the same identity as a 3D card.
 */
export function JimboCardSlot({
  name,
  sheet,
  width = 64,
  info,
  badge,
  ariaLabel,
  onSelect,
}: JimboCardSlotProps) {
  const card = (
    <div
      className="j-card-slot"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? name}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
    >
      <JimboSprite name={name} sheet={sheet} width={width} />
    </div>
  )

  if (!info) return card

  return (
    <JimboTooltip content={info} badge={badge} variant="card">
      {card}
    </JimboTooltip>
  )
}
