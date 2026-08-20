import React from 'react'

// No 'gold' tone — Balatro doesn't use gold badges. Gold is reserved for
// text-on-dark (prices, titles), not for chip/pill surfaces.
export type JimboBadgeTone = 'dark' | 'blue' | 'red' | 'green' | 'grey' | 'orange' | 'purple'

export interface JimboBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md'
  tone?: JimboBadgeTone
  children: React.ReactNode
}

// Class names are spelled out rather than interpolated. An interpolated name
// never appears as a literal in the source, so nothing can grep for it, no
// dead-CSS pass can count it, and a rename goes silently unstyled. `satisfies`
// makes a missing tone a type error instead of a blank badge.
const SIZE_CLASS = {
  sm: 'j-badge--sm',
  md: 'j-badge--md',
} as const satisfies Record<NonNullable<JimboBadgeProps['size']>, string>

const TONE_CLASS = {
  dark: 'j-badge--dark',
  blue: 'j-badge--blue',
  red: 'j-badge--red',
  green: 'j-badge--green',
  grey: 'j-badge--grey',
  orange: 'j-badge--orange',
  purple: 'j-badge--purple',
} as const satisfies Record<JimboBadgeTone, string>

/**
 * Small colored label pill. Matches Balatro's in-game tag/rarity badges.
 * All styling via jimbo.css `.j-badge` classes.
 */
export function JimboBadge({ size = 'sm', tone = 'dark', className, children, ...props }: JimboBadgeProps) {
  const classes = ['j-badge', SIZE_CLASS[size], TONE_CLASS[tone], className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
