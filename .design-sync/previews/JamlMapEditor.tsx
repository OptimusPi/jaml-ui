// Owned preview for JamlMapEditor. Mirrors the story JSX
// (src/components/jamlMap/JamlMapEditor.stories.tsx: zone "must" inside a
// 100vh #1e2b2d stage). One addition: the component's own mount effect
// scrolls its ante rail to Ante 1 ("game starts there, Ante 0 is pre-game"),
// but on the compiled preview page the effect fires before the stylesheet
// constrains the rail, so scrollTop clamps to 0 and the capture shows Ante 0
// while storybook shows Ante 1. The wrapper below re-applies the SAME scroll
// (children[1].offsetTop — exactly what JamlMapEditor.tsx does on mount)
// once layout has settled, so the preview lands in the state the story
// intends. No story state is altered — this only re-runs the component's
// own mount behavior after CSS load.
import * as React from "react";
import { JamlMapEditor } from "jaml-ui";

function ScrollToAnte1({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    // The rail is `scroll-snap-type: y mandatory; scroll-behavior: smooth`.
    // The component's own smooth mount scroll gets re-snapped back to Ante 0
    // when late sprite decodes reflow the rail on the preview page, so we
    // re-apply an INSTANT scroll to the same target whenever layout shifts.
    const apply = () => {
      const el = ref.current?.querySelector(".j-jaml-map-editor__scroll") as HTMLElement | null;
      const target = el?.children[1] as HTMLElement | undefined;
      if (!el || !target) return;
      const top = target.offsetTop;
      if (Math.abs(el.scrollTop - top) > 4) {
        el.scrollTo({ top, behavior: "instant" as ScrollBehavior });
      }
    };
    apply();
    const raf = requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(apply);
    });
    const timers = [50, 300, 800, 1500].map((ms) => setTimeout(apply, ms));
    const el = ref.current?.querySelector(".j-jaml-map-editor__scroll") as HTMLElement | null;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    if (ro && el) {
      ro.observe(el);
      for (const child of Array.from(el.children).slice(0, 3)) ro.observe(child as Element);
    }
    window.addEventListener("load", apply);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      ro?.disconnect();
      window.removeEventListener("load", apply);
    };
  }, []);
  return (
    <div ref={ref} style={{ height: "100vh", background: "#1e2b2d" }}>
      {children}
    </div>
  );
}

export const Default = () => (
  <ScrollToAnte1>
    <JamlMapEditor zone="must" />
  </ScrollToAnte1>
);
