'use client'

import React from 'react'
import { BsSuitClubFill, BsSuitDiamondFill, BsSuitHeartFill, BsSuitSpadeFill } from 'react-icons/bs'

import { JimboBox } from "../ui/JimboBox.js";
import { JimboInline } from "../ui/JimboInline.js";
import { JimboLink } from "../ui/JimboLink.js";

// react-icons, not glyphs: the bare unicode suits render text-presentation
// (monochrome), which is how the red heart kept getting silently bleached.
// Icons take color from CSS, so the reds stay red forever.
const SUITS = [
  { key: 'heart', Icon: BsSuitHeartFill, tone: 'j-footer__suit-char--red j-footer__suit--heart' },
  { key: 'spade', Icon: BsSuitSpadeFill, tone: 'j-footer__suit-char--black j-footer__suit--spade' },
  { key: 'diamond', Icon: BsSuitDiamondFill, tone: 'j-footer__suit-char--red j-footer__suit--diamond' },
  { key: 'club', Icon: BsSuitClubFill, tone: 'j-footer__suit-char--black j-footer__suit--club' },
] as const

export interface JimboBalatroFooterProps {
  /** Fade the footer out */
  hidden?: boolean;
  /** Extra className */
  className?: string;
  /** Inline style override — e.g. `{ position: 'static' }` to opt out of the
   * default fixed-to-viewport placement when embedding outside the 320×568
   * MCP App frame. */
  style?: React.CSSProperties;
  /** Optional inline children */
  children?: React.ReactNode;
}

/**
 * Fan-site attribution footer with Balatro link. The "Balatro" in the name is
 * load-bearing — this footer is the public disclosure that the project is a
 * non-profit, rule-following, PlayStack-aware fan site. Always rendered;
 * required attribution for using Balatro art.
 */
export function JimboBalatroFooter({ hidden = false, className = '', style, children }: JimboBalatroFooterProps) {
  if (hidden) {
    return null
  }

  return (
    <JimboBox className={["j-footer", className].filter(Boolean).join(" ")} style={style}>
      <JimboBox className="j-footer__bar">
        <JimboBox className="j-footer__line j-footer__line--wrap">
          <JimboInline className="j-footer__chunk">Not affiliated with LocalThunk or Playstack</JimboInline>
          <JimboInline className="j-footer__chunk j-footer__chunk--credit">
            Made with{' '}
            <JimboInline className="j-footer__suits">
              <JimboInline className="j-footer__suit-stage">
                {SUITS.map(({ key, Icon, tone }) => (
                  <JimboInline key={key} className={`j-footer__suit-char ${tone}`}>
                    <Icon />
                  </JimboInline>
                ))}
              </JimboInline>
            </JimboInline>{' '}
            for the <JimboLink className="j-link" href="https://playbalatro.com" target="_blank" rel="noreferrer">Balatro</JimboLink> community
          </JimboInline>
          {children ? <JimboInline className="j-footer__extra">{children}</JimboInline> : null}
        </JimboBox>
      </JimboBox>
    </JimboBox>
  )
}
