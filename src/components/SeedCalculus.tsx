"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboStack, JimboRow } from "../ui/JimboLayout.js";
import { JimboSlider } from "../ui/JimboSlider.js";
import { JimboCanvas } from "../ui/JimboCanvas.js";

const LN2 = Math.LN2;
const LN20 = Math.log(20);

export interface SeedCalculusProps {
  /**
   * Measured rarity source. When present with at least one hit, rarity is
   * `seedsChecked / hits` and the rarity dial is locked — "measure it beats
   * any formula". Wire it to a live search's `matchingSeeds / totalSeedsSearched`.
   */
  measured?: { hits: number; seedsChecked: number };
  /** Starting "1 in N" rarity when not measured. Default 346,736,850. */
  defaultRarityOneIn?: number;
  /** Starting rig speed in seeds/sec. Default 3,300,000. */
  defaultSeedsPerSecond?: number;
  className?: string;
}

function compact(n: number): string {
  if (!isFinite(n)) return "∞";
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toFixed(a >= 1e13 ? 0 : 1).replace(/\.0$/, "") + "T";
  if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
  return Math.round(n).toString();
}

function humanTime(sec: number): string {
  if (!isFinite(sec)) return "∞";
  if (sec < 1) return (sec * 1000).toFixed(0) + "ms";
  const units: Array<[string, number]> = [["y", 31557600], ["d", 86400], ["h", 3600], ["m", 60], ["s", 1]];
  let rem = sec;
  const out: string[] = [];
  for (const [lab, s] of units) {
    if (rem >= s || (out.length && lab === "s")) {
      const q = Math.floor(rem / s);
      rem -= q * s;
      if (q > 0 || out.length) out.push(q + lab);
      if (out.length === 2) break;
    }
  }
  return out.length ? out.join(" ") : "0s";
}

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const Tile = ({ suit, tone, label, value, unit, formula }: {
  suit: string;
  tone: "red" | "gold" | "blue" | "green";
  label: string;
  value: string;
  unit: string;
  formula: string;
}) => (
  <div className={`j-seedcalc__tile j-seedcalc__tile--${tone}`}>
    <span className="j-seedcalc__suit" aria-hidden>{suit}</span>
    <JimboText size="micro" tone="grey">{label}</JimboText>
    <JimboText size="lg" tone={tone} className="j-seedcalc__tile-value">{value}</JimboText>
    <JimboText size="xs" tone="grey">{unit}</JimboText>
    <JimboText size="micro" tone="grey" className="j-seedcalc__formula">{formula}</JimboText>
  </div>
);

export function SeedCalculus({
  measured,
  defaultRarityOneIn = 346_736_850,
  defaultSeedsPerSecond = 3_300_000,
  className,
}: SeedCalculusProps) {
  const [rarityLog, setRarityLog] = useState(() => Math.log10(defaultRarityOneIn));
  const [speedLog, setSpeedLog] = useState(() => Math.log10(defaultSeedsPerSecond));
  const [markerFrac, setMarkerFrac] = useState(LN2 / LN20);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const measuredN =
    measured && measured.hits > 0 && measured.seedsChecked > 0
      ? measured.seedsChecked / measured.hits
      : null;

  const N = measuredN ?? Math.pow(10, rarityLog);
  const r = Math.pow(10, speedLog);
  const p = 1 / N;

  const stats = useMemo(() => ({
    expected: N,
    median: N * LN2,
    p95: N * LN20,
  }), [N]);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const cssW = cv.clientWidth;
    if (!cssW) return; // not laid out yet — never draw into a mismatched buffer, or scrub coords lie
    const cssH = 220;
    if (cv.width !== Math.round(cssW * DPR)) {
      cv.width = Math.round(cssW * DPR);
      cv.height = Math.round(cssH * DPR);
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const gold = cssVar("--j-gold", "#e4b643");
    const red = cssVar("--j-red", "#fe5148");
    const blue = cssVar("--j-blue", "#0093ff");
    const green = cssVar("--j-green", "#429f79");
    const grey = cssVar("--j-grey", "#a8bcbf");
    const ink = cssVar("--j-darkest", "#1e2b2d");

    const W = cssW, H = cssH, padL = 40, padR = 12, padT = 12, padB = 30;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const xmax = (LN20 / p) * 1.06;
    const X = (f: number) => padL + f * plotW;
    const Y = (val: number) => padT + (1 - val) * plotH;
    const S = (n: number) => Math.exp(-p * n);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(168,188,191,0.14)";
    ctx.lineWidth = 1;
    ctx.fillStyle = grey;
    ctx.font = "10px 'JetBrains Mono', monospace";
    for (let g = 0; g <= 4; g++) {
      const y = padT + (g / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(100 - g * 25 + "%", padL - 6, y + 3);
    }

    const marks: Array<[string, number, string]> = [
      ["median", LN2 / p, gold],
      ["mean", 1 / p, red],
      ["95%", LN20 / p, green],
    ];
    ctx.textAlign = "center";
    for (const [lab, xv, col] of marks) {
      const fx = xv / xmax;
      if (fx > 1) continue;
      const x = X(fx);
      ctx.strokeStyle = col + "66";
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = col;
      ctx.fillText(lab, x, padT + plotH + 20);
    }
    ctx.fillStyle = grey;
    ctx.textAlign = "left"; ctx.fillText("0", padL, padT + plotH + 20);
    ctx.textAlign = "right"; ctx.fillText(compact(xmax) + " seeds →", W - padR, padT + plotH + 20);

    const NS = 160;
    ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    for (let i = 0; i <= NS; i++) ctx.lineTo(X(i / NS), Y(S((i / NS) * xmax)));
    ctx.lineTo(X(1), Y(0)); ctx.closePath();
    ctx.fillStyle = red + "4d"; ctx.fill();

    ctx.beginPath();
    for (let i = 0; i <= NS; i++) {
      const x = X(i / NS), y = Y(S((i / NS) * xmax));
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = gold; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= NS; i++) {
      const x = X(i / NS), y = Y(1 - S((i / NS) * xmax));
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = blue; ctx.lineWidth = 3; ctx.stroke();

    const mf = Math.min(Math.max(markerFrac, 0), 1);
    const mn = mf * xmax, s = S(mn), mx = X(mf);
    ctx.strokeStyle = grey; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + plotH); ctx.stroke();
    ctx.setLineDash([]);
    for (const [val, col] of [[s, gold], [1 - s, blue]] as Array<[number, string]>) {
      ctx.beginPath(); ctx.arc(mx, Y(val), 4.5, 0, 7); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
    }
  }, [p, markerFrac]);

  useEffect(() => {
    draw();
    const cv = canvasRef.current;
    // Redraw on *element* resize (dock/sidebar/tab), not just window — otherwise the
    // canvas keeps stale dimensions and the scrub marker drifts off the cursor.
    if (cv && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => draw());
      ro.observe(cv);
      return () => ro.disconnect();
    }
    if (typeof window === "undefined") return;
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  const scrub = useCallback((clientX: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const padL = 40, padR = 12, plotW = rect.width - padL - padR;
    let f = (clientX - rect.left - padL) / plotW;
    f = Math.min(Math.max(f, 0), 1);
    setMarkerFrac(f);
  }, []);
  const dragging = useRef(false);

  const markerN = Math.min(Math.max(markerFrac, 0), 1) * (LN20 / p) * 1.06;
  const markerS = Math.exp(-p * markerN);

  return (
    <JimboPanel title="Seed Hunter's Calculus" tone="gold" className={`j-seedcalc ${className ?? ""}`}>
      <JimboStack gap="md">
        <div className="j-seedcalc__rarity">
          <JimboText size="micro" tone="grey">HOW RARE</JimboText>
          <JimboText size="display" tone="white" className="j-seedcalc__rarity-big">
            <span className="j-seedcalc__one">1</span> in {Math.round(N).toLocaleString("en-US")}
          </JimboText>
          {measuredN != null && (
            <JimboText size="xs" tone="green">
              measured · {compact(measured!.hits)} hits ÷ {compact(measured!.seedsChecked)} checked
            </JimboText>
          )}
        </div>

        <div className="j-seedcalc__dials">
          <label className="j-seedcalc__dial">
            <JimboRow justify="between">
              <JimboText size="micro" tone="grey">RARITY</JimboText>
              <JimboText size="sm" tone="white">1 in {compact(N)}</JimboText>
            </JimboRow>
            <JimboSlider
              min={2} max={11} step={0.01}
              value={measuredN != null ? Math.log10(measuredN) : rarityLog}
              onValueChange={setRarityLog}
              disabled={measuredN != null}
              aria-label="Rarity, 1 in N (log scale)"
            />
          </label>
          <label className="j-seedcalc__dial">
            <JimboRow justify="between">
              <JimboText size="micro" tone="grey">RIG SPEED</JimboText>
              <JimboText size="sm" tone="white">{compact(r)} seeds/s</JimboText>
            </JimboRow>
            <JimboSlider
              min={5} max={7.301} step={0.005}
              value={speedLog}
              onValueChange={setSpeedLog}
              aria-label="Rig speed, seeds per second (log scale)"
            />
          </label>
        </div>

        <div className="j-seedcalc__tiles">
          <Tile suit="♥" tone="red" label="EXPECTED WAIT" value={compact(stats.expected)} unit="seeds" formula="∫ survival = 1/p" />
          <Tile suit="♠" tone="blue" label="TIME TO FIND" value={humanTime(stats.expected / r)} unit="expected ÷ rig speed" formula="E[seeds] / r" />
          <Tile suit="♦" tone="gold" label="COIN-FLIP" value={compact(stats.median)} unit={`seeds · ${humanTime(stats.median / r)}`} formula="ln 2 / p — 50%" />
          <Tile suit="♣" tone="green" label="ALMOST CERTAIN" value={compact(stats.p95)} unit={`seeds · ${humanTime(stats.p95 / r)}`} formula="ln 20 / p — 95%" />
        </div>

        <JimboStack gap="sm">
          <JimboRow gap="md" align="center">
            <JimboText size="xs" tone="gold">— still hunting</JimboText>
            <JimboText size="xs" tone="red">▨ where it lands</JimboText>
            <JimboText size="xs" tone="blue">— done</JimboText>
          </JimboRow>
          <JimboText size="xs" tone="grey">
            at {compact(markerN)} seeds · {Math.round(markerS * 100)}% still hunting · {Math.round((1 - markerS) * 100)}% done
          </JimboText>
          <JimboCanvas
            ref={canvasRef}
            className="j-seedcalc__plot"
            aria-label="Survival, find-density, and completion curves against seeds checked"
            onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); scrub(e.clientX); }}
            onPointerMove={(e) => { if (dragging.current) scrub(e.clientX); }}
            onPointerUp={() => { dragging.current = false; }}
            onPointerCancel={() => { dragging.current = false; }}
          />
          <JimboText size="micro" tone="grey">
            drag across the felt to move the marker · measure it — hits ÷ seeds beats any formula
          </JimboText>
        </JimboStack>
      </JimboStack>
    </JimboPanel>
  );
}
