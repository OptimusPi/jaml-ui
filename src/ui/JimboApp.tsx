"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type JimboAppVariant = "embed" | "phone" | "page";

export interface JimboAppProps extends HTMLAttributes<HTMLDivElement> {
  /** embed = MCP-on-desktop 375×375 square. phone = locked portrait. page = full website. */
  variant?: JimboAppVariant;
  /** Main column. For embed/phone, scrolls inside the frame when true. */
  scroll?: boolean;
  footer?: ReactNode;
}

/**
 * App chrome.
 * embed = MCP host iframe (square, funny on purpose).
 * phone = mobile portrait, 375×667 (iPhone SE) / 100dvh — not the MCP square.
 * page = desktop website, full viewport.
 * None paints a second background (use JimboBackground behind).
 */
export function JimboApp({
  variant = "embed",
  scroll = true,
  footer,
  className,
  children,
  ...rest
}: JimboAppProps) {
  if (variant === "page") {
    const classes = ["j-page", "j-page--full", className].filter(Boolean).join(" ");
    return (
      <div className={classes} {...rest}>
        <div className="j-page__main">{children}</div>
        {footer ? <div className="j-page__footer">{footer}</div> : null}
      </div>
    );
  }

  if (variant === "phone") {
    const classes = ["j-phone", className].filter(Boolean).join(" ");
    const bodyClass = scroll ? "j-phone__scroll" : "j-phone__content";
    return (
      <div className={classes} {...rest}>
        <div className={bodyClass}>{children}</div>
        {footer ? <div className="j-phone__footer">{footer}</div> : null}
      </div>
    );
  }

  const classes = ["j-app", className].filter(Boolean).join(" ");
  const bodyClass = scroll ? "j-app__scroll" : "j-app__content";
  return (
    <div className={classes} {...rest}>
      <div className={bodyClass}>{children}</div>
      {footer ? <div className="j-app__footer">{footer}</div> : null}
    </div>
  );
}
