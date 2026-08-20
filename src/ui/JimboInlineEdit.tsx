'use client'

import React from 'react'

export type JimboInlineEditSize = 'xs' | 'sm' | 'md' | 'lg'
export type JimboInlineEditTone = 'white' | 'gold' | 'grey'

export interface JimboInlineEditProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual size — echoes JimboText size scale. */
  size?: JimboInlineEditSize
  tone?: JimboInlineEditTone
  /** Render at reduced opacity (e.g. description-style sub-text). */
  dim?: boolean
}

// Spelled out, not interpolated — see the note in JimboLayout.tsx.
const SIZE_CLASS = {
  xs: 'j-inline-edit--xs',
  sm: 'j-inline-edit--sm',
  md: 'j-inline-edit--md',
  lg: 'j-inline-edit--lg',
} as const satisfies Record<JimboInlineEditSize, string>

const TONE_CLASS = {
  white: 'j-inline-edit--white',
  gold: 'j-inline-edit--gold',
  grey: 'j-inline-edit--grey',
} as const satisfies Record<JimboInlineEditTone, string>

/**
 * Borderless transparent input that reads as inline text until focused —
 * for editable titles, bylines, or descriptions inside cards/panels.
 * Focus chrome only shows on keyboard navigation so mouse use stays clean.
 */
export const JimboInlineEdit = React.forwardRef<HTMLInputElement, JimboInlineEditProps>(
  function JimboInlineEdit(
    { size = 'md', tone = 'white', dim = false, className = '', ...rest },
    ref,
  ) {
    const classes = [
      'j-inline-edit',
      SIZE_CLASS[size],
      TONE_CLASS[tone],
      dim ? 'j-inline-edit--dim' : null,
      className || null,
    ]
      .filter(Boolean)
      .join(' ')
    return <input ref={ref} type="text" className={classes} {...rest} />
  },
)
