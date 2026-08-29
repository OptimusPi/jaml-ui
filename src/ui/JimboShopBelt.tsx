"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { JimboBox } from "./JimboBox.js";
import { JimboIconButton } from "./JimboIconButton.js";

const BUFFER_PX = 280;
const STEP_PX = 260;

export interface JimboShopBeltProps {
  children?: ReactNode;
  className?: string;
  onNearEnd?: () => void;
  snap?: boolean;
}

/** Horizontal pixel-card tape. Drag follows the finger; wheel maps to x. */
export function JimboShopBelt({ children, className, onNearEnd, snap = false }: JimboShopBeltProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const maybeEnd = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !onNearEnd) return;
    if (el.scrollWidth - (el.scrollLeft + el.clientWidth) <= BUFFER_PX) onNearEnd();
  }, [onNearEnd]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (delta === 0) return;
      el.scrollLeft += delta;
      event.preventDefault();
      maybeEnd();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [maybeEnd]);

  const nudge = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * STEP_PX, behavior: "smooth" });
    if (dir > 0) maybeEnd();
  };

  const classes = [
    "j-shop-belt",
    "j-shop-belt--grab",
    snap ? "j-shop-belt--snap" : "",
    grabbing ? "j-shop-belt--grabbing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <JimboBox className="j-shop-belt-wrap">
      <JimboIconButton size="sm" aria-label="Scroll left" onClick={() => nudge(-1)}>
        <FiChevronLeft />
      </JimboIconButton>
      <JimboBox
        ref={scrollerRef}
        className={classes}
        onScroll={maybeEnd}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft };
          event.currentTarget.setPointerCapture(event.pointerId);
          setGrabbing(true);
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (!d || d.id !== event.pointerId) return;
          event.currentTarget.scrollLeft = d.left - (event.clientX - d.x);
        }}
        onPointerUp={(event) => {
          if (drag.current?.id !== event.pointerId) return;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          drag.current = null;
          setGrabbing(false);
          maybeEnd();
        }}
        onPointerCancel={() => {
          drag.current = null;
          setGrabbing(false);
        }}
      >
        {children}
      </JimboBox>
      <JimboIconButton size="sm" aria-label="Scroll right" onClick={() => nudge(1)}>
        <FiChevronRight />
      </JimboIconButton>
    </JimboBox>
  );
}
