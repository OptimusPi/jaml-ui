'use client'

import React from 'react'
import { resolveJamlAssetUrl, type JamlAssetKey } from '../assets.js'
import { getSpriteData, type SpriteSheetType } from '../sprites/spriteMapper.js'

export interface JimboSpriteProps {
  name: string
  sheet?: SpriteSheetType
  width?: number
  height?: number
  style?: React.CSSProperties
}

const SHEET_META: Record<SpriteSheetType, { cols: number; rows: number; assetKey: JamlAssetKey }> = {
  Jokers:    { cols: 10, rows: 16, assetKey: 'jokers' },
  Tarots:    { cols: 10, rows: 6,  assetKey: 'tarots' },
  Vouchers:  { cols: 9,  rows: 4,  assetKey: 'vouchers' },
  Boosters:  { cols: 4,  rows: 9,  assetKey: 'boosters' },
  BlindChips:{ cols: 21, rows: 31, assetKey: 'blinds' },
  tags:      { cols: 6,  rows: 5,  assetKey: 'tags' },
  Enhancers: { cols: 7,  rows: 5,  assetKey: 'enhancers' },
  Editions:  { cols: 5,  rows: 1,  assetKey: 'editions' },
}

export function JimboSprite({ name, sheet, width = 40, height, style }: JimboSpriteProps) {
  const sprite = getSpriteData(name)
  const resolvedSheet: SpriteSheetType = sheet ?? sprite?.type ?? 'Jokers'
  const meta = SHEET_META[resolvedSheet]
  const pos = sprite?.pos ?? { x: 0, y: 0 }
  const h = height ?? width

  if (!meta) return null

  const bgW = width * meta.cols
  const bgH = h * meta.rows
  const bgX = -(pos.x * width)
  const bgY = -(pos.y * h)

  return (
    <div style={{
      width, height: h, flexShrink: 0,
      backgroundImage: `url(${resolveJamlAssetUrl(meta.assetKey)})`,
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
      ...style,
    }} />
  )
}
