"use client";

import { useCallback, useMemo, useState } from "react";
import bootsharp, {
  JamlConfigLoader,
  MotelyJamlyzer,
  MotelyBoosterPack,
  MotelyVoucher,
  type MotelyJamlyzerSeedResult,
} from "motely-wasm";
import { parseJaml, type JamlClause } from "../../lib/jaml/jaml.js";
import { parseJamlSeeds } from "../../lib/jaml/jamlSeeds.js";
import { decodeMotelyItemName } from "../../decode/motelyItemDecoder.js";
import { JimboPanel } from "../../ui/JimboPanel.js";
import { JimboBadge } from "../../ui/JimboBadge.js";
import { JimboText } from "../../ui/jimboText.js";
import { JimboMascot } from "../../ui/JimboMascot.js";

export interface FilterStoryProps {
  /** Full JAML document — the filter AS the author wrote it. */
  source: string;
  /** Seeds kept for their string alone. They get a crown. No justification asked. */
  crowns?: readonly string[];
  /** Highest ante column the arc timeline renders. Default 8. */
  maxAnte?: number;
  className?: string;
}

/** "OopsAll6s" -> "Oops All 6s". Display sugar only; matching stays engine-side. */
function prettifyName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])([0-9])/g, "$1 $2");
}

function clauseLabel(clause: JamlClause): string {
  if (clause.names.length > 0) return clause.names.map(prettifyName).join(", ");
  return prettifyName(clause.itemType);
}

/* Per-seed analysis results, cached process-wide: flipping the same card
 * twice should not re-run the wasm. */
const analysisCache = new Map<string, MotelyJamlyzerSeedResult>();

async function analyzeSeed(seed: string): Promise<MotelyJamlyzerSeedResult> {
  const hit = analysisCache.get(seed);
  if (hit) return hit;
  if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
  const [result] = MotelyJamlyzer.analyze(JamlConfigLoader.fromJaml(`seeds:\n  - ${seed}`));
  if (!result) throw new Error(`Motely returned nothing for ${seed}`);
  analysisCache.set(seed, result);
  return result;
}

type SeedBackState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; result: MotelyJamlyzerSeedResult }
  | { status: "error" };

function SeedCard({
  seed,
  index,
  crowned,
}: {
  seed: string;
  index: number;
  crowned: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [back, setBack] = useState<SeedBackState>({ status: "idle" });

  const flip = useCallback(() => {
    setFlipped((v) => !v);
    setBack((b) => {
      if (b.status !== "idle") return b;
      void analyzeSeed(seed)
        .then((result) => setBack({ status: "ready", result }))
        .catch(() => setBack({ status: "error" }));
      return { status: "loading" };
    });
  }, [seed]);

  const classes = [
    "j-story-seed",
    crowned ? "j-story-seed--crowned" : "",
    flipped ? "j-story-seed--flipped" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} onClick={flip} aria-label={`Inspect seed ${seed}`}>
      <span className="j-story-seed__inner">
        <span className="j-story-seed__face j-story-seed__front">
          {crowned ? <span className="j-story-seed__crown" aria-hidden>♛</span> : null}
          <span className="j-story-seed__string">{seed}</span>
          <span className="j-story-seed__no">#{String(index + 1).padStart(2, "0")}</span>
        </span>
        <span className="j-story-seed__face j-story-seed__back">
          {back.status === "loading" || back.status === "idle" ? (
            <span className="j-story-seed__hint">jamlyzing…</span>
          ) : back.status === "error" ? (
            <span className="j-story-seed__hint">motely said no</span>
          ) : (
            <SeedSummary result={back.result} />
          )}
        </span>
      </span>
    </button>
  );
}

function SeedSummary({ result }: { result: MotelyJamlyzerSeedResult }) {
  const lines = result.antes
    .filter((a) => a.shopItems.length > 0 || a.packs.length > 0 || a.voucher)
    .slice(0, 8)
    .map((a) => {
      const items = [
        ...a.shopItems.map((i) => decodeMotelyItemName(i) ?? "?"),
        ...a.packs.map(
          (p) => `${prettifyName(MotelyBoosterPack[p.pack] ?? "pack")}`,
        ),
      ];
      const voucherName = a.voucher ? MotelyVoucher[a.voucher] : "";
      const voucher = voucherName && voucherName !== "None" ? ` · ${prettifyName(voucherName)}` : "";
      return { ante: a.ante, text: `${items.join(", ")}${voucher}` };
    });
  return (
    <span className="j-story-seed__summary">
      <span className="j-story-seed__score">score {result.score ?? 0}</span>
      {lines.map((l) => (
        <span key={l.ante} className="j-story-seed__ante">
          a{l.ante} {l.text}
        </span>
      ))}
    </span>
  );
}

function ArcChip({ clause }: { clause: JamlClause }) {
  const kindClass =
    clause.kind === "must"
      ? "j-story-chip--must"
      : clause.kind === "mustNot"
        ? "j-story-chip--mustnot"
        : "j-story-chip--should";
  return (
    <span className={`j-story-chip ${kindClass}`}>
      <span className="j-story-chip__type">{clause.itemType}</span>
      <span className="j-story-chip__name">{clauseLabel(clause)}</span>
      {clause.kind === "should" ? (
        <span className="j-story-chip__score">+{clause.score}</span>
      ) : (
        <span className="j-story-chip__score j-story-chip__score--fixed">
          {clause.kind === "must" ? "MUST" : "NO"}
        </span>
      )}
    </span>
  );
}

/**
 * A filter as a run story: the author's essay up top, the must/should clauses
 * as a score-weighted ante arc, and the kept seeds as a wall of flippable
 * cards. The filter file is the artifact — this renders what the author
 * MEANT, description verbatim, typos and all.
 */
export function FilterStory({ source, crowns = [], maxAnte = 8, className = "" }: FilterStoryProps) {
  const filter = useMemo(() => parseJaml(source), [source]);
  const seeds = useMemo(() => parseJamlSeeds(source), [source]);
  const crownSet = useMemo(
    () => new Set(crowns.map((s) => s.toUpperCase())),
    [crowns],
  );

  const { byAnte, anytime, highest } = useMemo(() => {
    const byAnte = new Map<number, JamlClause[]>();
    const anytime: JamlClause[] = [];
    let highest = maxAnte;
    for (const clause of filter.all) {
      if (clause.antes && clause.antes.length > 0) {
        for (const a of clause.antes) {
          highest = Math.max(highest, a);
          const list = byAnte.get(a) ?? [];
          list.push(clause);
          byAnte.set(a, list);
        }
      } else {
        anytime.push(clause);
      }
    }
    return { byAnte, anytime, highest };
  }, [filter, maxAnte]);

  const antes = Array.from({ length: highest }, (_, i) => i + 1);
  const crownedCount = seeds.filter((s) => crownSet.has(s.toUpperCase())).length;

  const classes = ["j-story", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <JimboPanel title={filter.name ?? "untitled filter"} tone="gold" className="j-story__header">
        <div className="j-story__meta">
          {filter.author ? <JimboBadge tone="purple" size="sm">by {filter.author}</JimboBadge> : null}
          {filter.deck ? <JimboBadge tone="blue" size="sm">deck: {filter.deck}</JimboBadge> : null}
          {filter.stake ? <JimboBadge tone="orange" size="sm">stake: {filter.stake}</JimboBadge> : null}
        </div>
        {filter.description ? (
          <JimboText size="sm" tone="white" className="j-story__essay">
            {filter.description}
          </JimboText>
        ) : null}
      </JimboPanel>

      <JimboPanel title="the arc" tone="blue" className="j-story__arc-panel">
        <div className="j-story-arc" style={{ ["--j-story-antes" as string]: antes.length }}>
          {antes.map((ante) => (
            <div key={ante} className="j-story-ante">
              <span className="j-story-ante__label">ante {ante}</span>
              <div className="j-story-ante__chips">
                {(byAnte.get(ante) ?? []).map((clause, i) => (
                  <ArcChip key={`${clause.label}-${i}`} clause={clause} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {anytime.length > 0 ? (
          <div className="j-story-arc__anytime">
            <span className="j-story-ante__label">whenever</span>
            <div className="j-story-ante__chips">
              {anytime.map((clause, i) => (
                <ArcChip key={`${clause.label}-${i}`} clause={clause} />
              ))}
            </div>
          </div>
        ) : null}
      </JimboPanel>

      <JimboPanel
        title={`the keep — ${seeds.length} seeds`}
        tone="green"
        className="j-story__keep"
      >
        <div className="j-story-keep__mascot">
          <JimboMascot mood="happy" size={72} menuHidden />
          <JimboText size="xs" tone="gold">
            {crownedCount > 0
              ? `the ${crownedCount} filthy one${crownedCount === 1 ? "" : "s"} wear crowns. obviously. flip a card to see its run.`
              : "flip a card to see its run."}
          </JimboText>
        </div>
        <div className="j-story-keep__wall">
          {seeds.map((seed, i) => (
            <SeedCard
              key={seed}
              seed={seed}
              index={i}
              crowned={crownSet.has(seed.toUpperCase())}
            />
          ))}
        </div>
      </JimboPanel>
    </div>
  );
}
