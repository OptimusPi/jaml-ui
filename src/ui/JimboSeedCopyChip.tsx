"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { JimboButton } from "./JimboButton.js";

export interface JimboSeedCopyChipProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  copiedLabel?: string;
  copiedDurationMs?: number;
  onCopy?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tap-to-copy seed row. Idle: copy icon + seed. Copied: green check + label.
 */
export function JimboSeedCopyChip({
  value,
  placeholder = "--------",
  disabled = false,
  copiedLabel = "Copied!",
  copiedDurationMs = 2000,
  onCopy,
  className = "",
  style,
}: JimboSeedCopyChipProps) {
  const [copied, setCopied] = useState(false);
  // A bare setTimeout here leaked twice: a second tap stacked a timer that
  // cleared the confirmation early (the first timer fires mid-second-copy), and
  // an unmount before it fired left it running. Keep one handle, replace it on
  // each copy, clear it on unmount.
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const display = value.trim();
  const canCopy = !disabled && display.length > 0;

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(display);
      }
    } catch {
      // Non-fatal in Storybook or restricted clipboard contexts.
    }
    setCopied(true);
    onCopy?.(display);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), copiedDurationMs);
  };

  const rootClass = ["j-seed-copy", copied ? "j-seed-copy--copied" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <JimboButton
      className={rootClass}
      style={style}
      onClick={handleCopy}
      disabled={!canCopy}
      fullWidth
      aria-label={canCopy ? `Copy seed ${display}` : "Seed unavailable"}
    >
      <span className="j-seed-copy__icon" aria-hidden>
        {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
      </span>
      <span className="j-seed-copy__text">
        {copied ? copiedLabel : display || placeholder}
      </span>
    </JimboButton>
  );
}
