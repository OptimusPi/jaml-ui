"use client";

import React from "react";
import { BsSuitClubFill, BsSuitDiamondFill, BsSuitHeartFill, BsSuitSpadeFill } from "react-icons/bs";

const SUITS = [
  { key: "heart", Icon: BsSuitHeartFill, tone: "j-footer__suit-char--red j-footer__suit-char--heart" },
  { key: "spade", Icon: BsSuitSpadeFill, tone: "j-footer__suit-char--black j-footer__suit-char--spade" },
  { key: "diamond", Icon: BsSuitDiamondFill, tone: "j-footer__suit-char--red j-footer__suit-char--diamond" },
  { key: "club", Icon: BsSuitClubFill, tone: "j-footer__suit-char--black j-footer__suit-char--club" },
] as const;

export interface JimboFooterBarProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Primitive markup for the Balatro fan-site attribution footer.
 * Keyframes live in jimbo.css (no runtime `<style>` injection).
 */
export function JimboFooterBar({ className = "", style, children }: JimboFooterBarProps) {
  return (
    <div className={["j-footer", className].filter(Boolean).join(" ")} style={style}>
      <div className="j-footer__bar">
        <p className="j-footer__line j-footer__line--wrap">
          <span className="j-footer__chunk">Not affiliated with LocalThunk or Playstack</span>
          <span className="j-footer__chunk j-footer__chunk--credit">
            Made with{" "}
            <span className="j-footer__suits">
              <span className="j-footer__suit-stage">
                {SUITS.map(({ key, Icon, tone }) => (
                  <span key={key} className={`j-footer__suit-char ${tone}`}>
                    <Icon />
                  </span>
                ))}
              </span>
            </span>{" "}
            for the{" "}
            <a className="j-link" href="https://playbalatro.com" target="_blank" rel="noreferrer">
              Balatro
            </a>{" "}
            community
          </span>
          {children ? <span className="j-footer__extra">{children}</span> : null}
        </p>
      </div>
    </div>
  );
}
