"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import bootsharp, { Search, type MotelyProgress, type MotelySeedScore } from "motely-wasm";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboDock } from "../ui/JimboDock.js";
import { JimboListItem } from "../ui/JimboListItem.js";
import { JimboStack } from "../ui/JimboLayout.js";
import { JimboStatusPill } from "../ui/JimboStatusPill.js";
import { JimboText } from "../ui/jimboText.js";
import { JamlIde } from "./JamlIde.js";
import { Jamlyzer } from "./Jamlyzer.js";

export const STARTER_JAML = `must:
  - joker: Blueprint
    antes: [1]
should:
  - voucher: Telescope
    antes: [1]
`;

export const JAMLYZE_JAML = `seeds:
  - WEEJOKER
${STARTER_JAML}`;

export type SeedHit = { seed: string; score: number };

export function LiveJamlIde({ defaultJaml = STARTER_JAML }: { defaultJaml?: string }) {
  const [jaml, setJaml] = useState(defaultJaml);
  const [hits, setHits] = useState<SeedHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = useCallback(async () => {
    if (searching) return;
    setError(null);
    setSearching(true);
    try {
      if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
      const collected: SeedHit[] = [];
      const onHit = (r: MotelySeedScore) => {
        collected.push({ seed: r.seed, score: r.score });
      };
      Search.onScored.subscribe(onHit);
      try {
        await Search.sequential(jaml, 0, 2, 4, 1);
      } finally {
        Search.onScored.unsubscribe(onHit);
      }
      setHits(collected);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSearching(false);
    }
  }, [jaml, searching]);

  return (
    <JamlIde
      jaml={jaml}
      onChange={setJaml}
      onSearch={onSearch}
      isSearching={searching}
      showLoadFileButton
      searchResults={hits.map((h) => ({
        seed: h.seed,
        score: h.score,
        tallyColumns: [h.score],
        tallyLabels: ["score"],
      }))}
      subtitle={error ? error : searching ? "Search.sequential [0, 2) batchChars=4 threads=1" : undefined}
    />
  );
}

export function SeedLab({ defaultJaml = STARTER_JAML }: { defaultJaml?: string }) {
  const [jaml, setJaml] = useState(defaultJaml);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<SeedHit[]>([]);
  const [checked, setChecked] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const hitHandler = useRef<((r: MotelySeedScore) => void) | null>(null);
  const progHandler = useRef<((p: MotelyProgress) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (hitHandler.current) Search.onScored.unsubscribe(hitHandler.current);
      if (progHandler.current) Search.onProgress.unsubscribe(progHandler.current);
    };
  }, []);

  const start = useCallback(async () => {
    if (running) return;
    setError(null);
    setHits([]);
    setChecked(0);
    setRunning(true);
    let lastSeed: string | null = null;
    const onHit = (r: MotelySeedScore) => {
      lastSeed = r.seed;
      setHits((prev) => [{ seed: r.seed, score: r.score }, ...prev].slice(0, 80));
    };
    const onProg = (p: MotelyProgress) => {
      setChecked(Number(p.seedsSearched));
    };
    hitHandler.current = onHit;
    progHandler.current = onProg;
    Search.onScored.subscribe(onHit);
    Search.onProgress.subscribe(onProg);
    try {
      if (bootsharp.getStatus() !== bootsharp.BootStatus.Booted) await bootsharp.boot();
      await Search.sequential(jaml, 0, 2, 4, 1);
      if (lastSeed) setSelected(lastSeed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      Search.onScored.unsubscribe(onHit);
      Search.onProgress.unsubscribe(onProg);
      hitHandler.current = null;
      progHandler.current = null;
      setRunning(false);
    }
  }, [jaml, running]);

  return (
    <JimboDock
      pyramid={{ filter: "filter", search: "search", results: "results", jamlyze: "jamlyze" }}
      panes={{
        filter: {
          label: "Filter",
          tone: "blue",
          content: (
            <JamlIde jaml={jaml} onChange={setJaml} showLoadFileButton compactHeader />
          ),
        },
        search: {
          label: "Search",
          tone: "green",
          content: (
            <JimboStack gap="md">
              <JimboStatusPill
                status={running ? "running" : error ? "error" : hits.length ? "ok" : "idle"}
                label={running ? "Searching…" : error ? "Error" : hits.length ? "Done" : "Ready"}
              />
              <JimboText size="sm" tone="grey">
                {running
                  ? `checked ${checked} · hits ${hits.length}`
                  : "Search.sequential · [0, 2) · batchChars=4 · threads=1"}
              </JimboText>
              {error ? (
                <JimboText size="sm" tone="red">
                  {error}
                </JimboText>
              ) : null}
              <JimboButton
                tone={running ? "red" : "blue"}
                fullWidth
                disabled={running}
                onClick={() => void start()}
              >
                {running ? "Searching…" : "Start Search"}
              </JimboButton>
            </JimboStack>
          ),
        },
        results: {
          label: "Results",
          tone: "gold",
          content: (
            <JimboStack gap="sm">
              {hits.length === 0 ? (
                <JimboText size="sm" tone="grey">
                  No hits yet. Start a search.
                </JimboText>
              ) : (
                hits.map((h) => (
                  <JimboListItem
                    key={h.seed}
                    active={h.seed === selected}
                    onClick={() => setSelected(h.seed)}
                  >
                    {h.seed} · {h.score}
                  </JimboListItem>
                ))
              )}
            </JimboStack>
          ),
        },
        jamlyze: {
          label: "Jamlyze",
          tone: "purple",
          content: selected ? (
            <Jamlyzer jaml={jaml} seeds={[selected]} defaultSelectedSeed={selected} />
          ) : (
            <JimboText size="sm" tone="grey">
              Pick a hit in Results.
            </JimboText>
          ),
        },
      }}
    />
  );
}
