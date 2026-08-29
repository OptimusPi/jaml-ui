/**
 * OrbitalShell — Jammy as the app's navigation, the excavated design grafted
 * home. The mascot sits bottom-center; tapping opens the radial orbital menu
 * (pifreak's original interaction system, excavated from JAMMY as
 * @pifreak/jammy-orbital). Items follow the excavated color law:
 * RED opens, ORANGE toggles, GREEN starts, counts ride purple pills.
 *
 * The artwork is JimboMascot from jaml-ui — the real Jammy — rendered through
 * the excavated Mascot's renderImage seam, so the character and the behavior
 * come from their original homes.
 */
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { JimboMascot } from "jaml-ui";
import { Mascot, maxOrbitRadiusForBox } from "../jammy-orbital/src/index";

/**
 * Jammy's size, px — FULL SIZE, always.
 *
 * He used to scale down to 0.28x the box height so the ellipse layout's
 * mascot-clearance push wouldn't shove pills out of a short box. The arc
 * layout (radialLayout's ORBIT LAW) deleted that push: pills stack by height
 * and fly out to the container walls, so the box fits regardless of how big
 * the character is — and the character is the point. Never shrink Jammy to
 * make geometry easier; fix the geometry.
 */
const MASCOT_SIZE = 96;

export function OrbitalShell({
  running,
  ready,
  resultsCount,
  mapOpen,
  overlayOpen,
  onSearch,
  onStop,
  onAddClause,
  onToggleMap,
  onOpenBrowser,
  onOpenPane,
  onToggleSettings,
}) {
  const getMenuItems = useCallback(
    (stack) => {
      const top = stack.at(-1);
      if (top === "Filters") {
        return [
          { label: "Must", action: "add-must", color: "red", tooltip: "Add a must clause — tap, tap, done" },
          { label: "Should", action: "add-should", color: "red", tooltip: "Add a should clause" },
          { label: "Must Not", action: "add-mustnot", color: "red", tooltip: "Add a must-not clause" },
          { label: "Browser", action: "browser", color: "red", tooltip: "Community filter library" },
          { label: "Map", action: "map", color: "orange", active: mapOpen, tooltip: "The map" },
        ];
      }
      // While the engine boots, Search is not an available action — so it gets
      // no pill at all (a dimmed-but-tappable pill would no-op and close the
      // menu, which is a lie). The pill appears the moment it's real.
      return [
        running
          ? { label: "Stop", action: "stop", color: "orange", active: true }
          : ready
            ? { label: "Search", action: "search", color: "red", tooltip: "Grind the keyspace" }
            : null,
        { label: "Filters", color: "red", tooltip: "Build the filter" },
        { label: "Results", action: "results", color: "purple", count: resultsCount },
        { label: "Jamlyze", action: "jamlyze", color: "red", tooltip: "Analyze a seed" },
        { label: "Settings", action: "settings", color: "orange" },
      ].filter(Boolean);
    },
    [running, ready, resultsCount, mapOpen],
  );

  // The square IS the control's territory, so it is also the ring's bound. We
  // measure it rather than recomputing the CSS `min()` in JS: one authority for
  // the size (the stylesheet), and the ring re-fits on rotate, on a keyboard
  // opening, and on any future change to the square's sizing rule for free.
  const squareRef = useRef(null);
  const [box, setBox] = useState({ max: undefined, h: undefined });

  useLayoutEffect(() => {
    const el = squareRef.current;
    if (!el) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      setBox({ max: maxOrbitRadiusForBox(r.width, r.height), h: r.height });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onAction = useCallback(
    (action) => {
      switch (action) {
        // Dimmed pill + hard gate: the engine isn't ready, so the action is
        // genuinely disabled, matching SearchPanel's own control.
        case "search": if (ready) onSearch(); break;
        case "stop": onStop(); break;
        case "add-must": onAddClause("must"); break;
        case "add-should": onAddClause("should"); break;
        case "add-mustnot": onAddClause("mustNot"); break;
        case "browser": onOpenBrowser(); break;
        case "map": onToggleMap(); break;
        case "results": onOpenPane("results"); break;
        case "jamlyze": onOpenPane("jamlyze"); break;
        case "settings": onToggleSettings(); break;
        default: break;
      }
    },
    [ready, onSearch, onStop, onAddClause, onOpenBrowser, onToggleMap, onOpenPane, onToggleSettings],
  );

  // hasResults deliberately NOT set: in the excavated design it pins the ring
  // reachable once background results exist, which here would keep root
  // controls rendered after close. The Results count pill covers that need.
  return (
    <div className="lab-orbital" ref={squareRef}>
      <Mascot
        src=""
        alt="Jammy"
        size={MASCOT_SIZE}
        maxOrbitRadius={box.max}
        orbitBoxHeight={box.h}
        hidden={overlayOpen}
        isTalking={running}
        getMenuItems={getMenuItems}
        onAction={onAction}
        renderImage={({ size }) => <JimboMascot mood={running ? "happy" : "idle"} size={size} />}
      />
    </div>
  );
}
