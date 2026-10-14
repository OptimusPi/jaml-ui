"use client";

import type React from "react";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { JimboIconButton } from "./JimboIconButton.js";
import { JimboText } from "./jimboText.js";

export interface JimboPagerProps {
  /**
   * One page per child. Children, not a render prop, so the pager can live in the
   * json-render registry — a spec only carries data, never a function.
   */
  children?: ReactNode;
  /** Controlled page. Omit it and the pager keeps its own. */
  index?: number;
  defaultIndex?: number;
  /** Fires once a swipe or a button settles on a new page. */
  onPageChange?: (index: number) => void;
  /** Pixels or any CSS length. Omit to fill the parent. */
  height?: number | string;
  "aria-label"?: string;
}

/** Horizontal px a mouse has to travel before it counts as a swipe and not a click. */
const DRAG_START_PX = 6;
/** Fraction of a page a mouse drag has to cover to turn it. */
const DRAG_TURN_FRACTION = 0.2;
/** Things a drag must never start on: it would eat text selection and caret moves. */
const NO_DRAG = "input, textarea, select, [contenteditable='true'], [data-no-swipe]";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Swipe left and right through pages. Nothing tilts, nothing flies off, nothing
 * stacks behind: the page you are on simply moves with your finger and settles
 * on the next one (native scroll-snap).
 *
 * Each page scrolls on its own vertical axis, so a page taller than the pager is
 * reachable instead of clipped.
 */
export function JimboPager({
  children,
  index,
  defaultIndex = 0,
  onPageChange,
  height = "100%",
  "aria-label": ariaLabel = "Pages",
}: JimboPagerProps) {
  const pages = Children.toArray(children);
  const count = pages.length;

  const [inner, setInner] = useState(defaultIndex);
  const current = Math.max(0, Math.min(index ?? inner, Math.max(0, count - 1)));

  const scroller = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  // startPage is pinned at pointer-down: the scroll position crosses page boundaries
  // mid-drag, and the release has to turn from where the drag began, not from there.
  const drag = useRef<{ startX: number; startScroll: number; startPage: number; active: boolean } | null>(null);
  const justDragged = useRef(false);
  const [dragging, setDragging] = useState(false);

  const scrollToIndex = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const goTo = useCallback(
    (i: number) => scrollToIndex(Math.max(0, Math.min(i, count - 1))),
    [count, scrollToIndex],
  );

  // The scroll position is the truth; the page number is read off it once it settles.
  const onScroll = () => {
    // A mouse drag moves the scroll position through every page on the way; only the
    // page it lands on counts, and that is reported once the release settles it.
    if (drag.current?.active) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = scroller.current;
      if (!el || el.clientWidth === 0) return;
      const settled = Math.round(el.scrollLeft / el.clientWidth);
      if (settled !== current) {
        setInner(settled);
        onPageChange?.(settled);
      }
    });
  };

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Controlled: follow `index` when it disagrees with where the scroller is.
  useEffect(() => {
    if (index === undefined) return;
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    if (Math.round(el.scrollLeft / el.clientWidth) !== current) scrollToIndex(current);
  }, [index, current, scrollToIndex]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Touch and pen already swipe natively; only a mouse needs help.
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if ((e.target as HTMLElement).closest(NO_DRAG)) return;
    const el = scroller.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft, startPage: current, active: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.active) {
      if (Math.abs(dx) < DRAG_START_PX) return;
      d.active = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    // The press that began this drag may have started selecting the text under it.
    window.getSelection()?.removeAllRanges();
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = scroller.current;
    drag.current = null;
    if (!d?.active || !el) return;
    justDragged.current = true;
    setDragging(false);
    const dx = e.clientX - d.startX;
    const turned = Math.abs(dx) >= el.clientWidth * DRAG_TURN_FRACTION;
    goTo(turned ? d.startPage + (dx < 0 ? 1 : -1) : d.startPage);
  };

  // A drag ends in a click on whatever is under the mouse; swallow that one.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!justDragged.current) return;
    justDragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(NO_DRAG)) return;
    if (e.key === "ArrowRight") goTo(current + 1);
    if (e.key === "ArrowLeft") goTo(current - 1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      style={{ display: "grid", gridTemplateRows: "minmax(0, 1fr) auto", gap: 10, height, minHeight: 0 }}
    >
      <div
        ref={scroller}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "100%",
          minHeight: 0,
          overflowX: "auto",
          overflowY: "hidden",
          overscrollBehaviorX: "contain",
          // Snap is off while a mouse drives the scroll position, or it fights every pixel.
          scrollSnapType: dragging ? "none" : "x mandatory",
          scrollbarWidth: "none",
          cursor: dragging ? "grabbing" : undefined,
          userSelect: dragging ? "none" : undefined,
          outline: "none",
        }}
      >
        {count === 0 ? (
          <div style={{ display: "grid", placeItems: "center" }}>
            <JimboText size="sm" tone="grey">
              Nothing here
            </JimboText>
          </div>
        ) : null}

        {pages.map((page, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            style={{
              minWidth: 0,
              minHeight: 0,
              overflowY: "auto",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            {page}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridAutoFlow: "column", gap: 12, alignItems: "center", justifyContent: "center" }}>
        <JimboIconButton
          aria-label="Previous"
          title="Previous (left arrow)"
          size="sm"
          onClick={() => goTo(current - 1)}
          disabled={current <= 0}
        >
          <FiChevronLeft />
        </JimboIconButton>

        <JimboText size="micro" tone="grey">
          {count === 0 ? "0 / 0" : `${current + 1} / ${count}`}
        </JimboText>

        <JimboIconButton
          aria-label="Next"
          title="Next (right arrow)"
          size="sm"
          onClick={() => goTo(current + 1)}
          disabled={current >= count - 1}
        >
          <FiChevronRight />
        </JimboIconButton>
      </div>
    </div>
  );
}
