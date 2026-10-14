"use client";

import { useEffect, useId, type HTMLAttributes, type ReactNode } from "react";

export type JimboTone =
  | "red" | "blue" | "green" | "orange" | "purple" | "grey" | "gold"
  | "tarot" | "planet" | "spectral";

export { JimboButton } from "./JimboButton.js";

export type JimboInnerPanelProps = HTMLAttributes<HTMLDivElement>;

export function JimboInnerPanel({ className, children, ...rest }: JimboInnerPanelProps) {
  const classes = ["j-inner-panel", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface JimboModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function JimboModal({ open, onClose, title, className, children }: JimboModalProps) {
  const titleId = useId();

  // Backdrop click has always closed the modal; Escape is the keyboard equivalent
  // for people who can't or don't want to reach for the mouse to dismiss it.
  useEffect(() => {
    if (!open || !onClose) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="j-modal-overlay" onClick={onClose}>
      <div
        className={["j-modal", "j-panel", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 id={titleId} className="j-modal__title">{title}</h2>}
        <div className="j-panel__body">{children}</div>
      </div>
    </div>
  );
}
