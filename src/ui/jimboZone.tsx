'use client'

import React from 'react'

export interface JimboZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Zone heading text (e.g. "Must", "Should"). */
  label: string
  /** Accent color (any CSS color). Drives the dashed border, tag fill, and rule. */
  color: string
  /** Count shown at the right end of the header rule. */
  count: number
  /** Tighter padding/sizing for sidebar/explorer usage. */
  compact?: boolean
  children?: React.ReactNode
}

/**
 * A dashed, accent-colored zone with a header (tag + rule + count) and a
 * grid-flowed body. Grid composition on the fixed canvas — no flex. The accent
 * is a single `--j-zone-color` custom property so one set of classes serves
 * every section (must / should / mustNot, or any caller-defined zone).
 */
export function JimboZone({
  label,
  color,
  count,
  compact = false,
  className = '',
  children,
  ...rest
}: JimboZoneProps) {
  return (
    <div
      className={`j-zone-rail ${className}`.trim()}
      data-compact={compact}
      style={{ '--j-zone-color': color } as React.CSSProperties}
      {...rest}
    >
      <div className="j-zone-rail__header">
        <div className="j-zone-rail__tag">{label}</div>
        <div className="j-zone-rail__rule" />
        <div className="j-zone-rail__count">{count}</div>
      </div>
      <div className="j-zone-rail__items">{children}</div>
    </div>
  )
}
