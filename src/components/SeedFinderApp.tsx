"use client";

import { useCallback, useMemo, useState } from "react";
import { MotelyDeck, MotelyStake } from "motely-wasm/motely/enums";
import { JimboApp, JimboAppScroll } from "../ui/jimboApp.js";
import { JimboButton } from "../ui/panel.js";
import { JimboCookLever } from "../ui/JimboCookLever.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboStack, JimboRow } from "../ui/jimboLayout.js";
import { JimboBadge } from "../ui/JimboBadge.js";
import { JamlIde } from "./JamlIde.js";
import { clauseSpriteSheet } from "./JamlIdeVisual.js";
import { RunConfigModal } from "./RunConfigModal.js";
import { useSearch } from "../hooks/useSearch.js";
import { jamlTextToVisualFilter } from "../utils/jamlVisualFilter.js";

const DEFAULT_JAML = `must:
  - joker: Blueprint
    antes: [1, 2, 3, 4, 5, 6, 7, 8]
`;

export interface SeedFinderAppProps {
  initialJaml?: string;
  initialDeck?: keyof typeof MotelyDeck;
  initialStake?: keyof typeof MotelyStake;
}

export function SeedFinderApp({
  initialJaml = DEFAULT_JAML,
  initialDeck = "Red",
  initialStake = "White",
}: SeedFinderAppProps) {
  const [jaml, setJaml] = useState(initialJaml);
  const [deck, setDeck] = useState<keyof typeof MotelyDeck>(initialDeck);
  const [stake, setStake] = useState<keyof typeof MotelyStake>(initialStake);
  const [modalOpen, setModalOpen] = useState(false);

  const { results, totalSearched, matchingSeeds, status, error, seedsPerSecond, startAesthetic, cancel } = useSearch();

  const isRunning = status === "running";

  const handleStart = useCallback(() => {
    const jamlWithConfig = `deck: ${deck}\nstake: ${stake}\n${jaml}`;
    startAesthetic(jamlWithConfig, 0);
  }, [jaml, deck, stake, startAesthetic]);

  // Reels stay spinning until the first hit, then slam onto the must clauses.
  const hasHits = results.length > 0;
  const matchSprites = useMemo(() => {
    if (!hasHits) return undefined;
    return jamlTextToVisualFilter(jaml)
      .must.map((c) => ({ name: c.value, sheet: clauseSpriteSheet(c.type) }))
      .filter((s) => s.sheet !== undefined);
  }, [hasHits, jaml]);

  const statusTone: "dark" | "blue" | "green" | "red" =
    status === "running" ? "blue" : status === "completed" ? "green" : status === "error" ? "red" : "dark";

  const searchResults = results.map((r) => ({ seed: r.seed, score: r.score, tallyColumns: r.tallyColumns }));

  return (
    <JimboApp>
      <JimboAppScroll>
        <JamlIde
          jaml={jaml}
          onChange={setJaml}
          defaultMode="visual"
          searchResults={searchResults}
          isSearching={isRunning}
          onSearch={handleStart}
          title="Seed Finder"
          actions={
            <JimboButton
              tone="grey"
              size="sm"
              disabled={isRunning}
              onClick={() => setModalOpen(true)}
            >
              {deck} · {stake}
            </JimboButton>
          }
          subtitle={
            <JimboRow gap="sm" align="center">
              <JimboBadge size="sm" tone={statusTone}>{status}</JimboBadge>
              {isRunning && seedsPerSecond > 0 ? (
                <JimboText size="xs" tone="grey">{Math.round(seedsPerSecond).toLocaleString()}/s</JimboText>
              ) : null}
              {totalSearched > 0n ? (
                <JimboText size="xs" tone="grey">{totalSearched.toLocaleString()} · {matchingSeeds.toString()} hits</JimboText>
              ) : null}
            </JimboRow>
          }
        />

        {error ? (
          <JimboStack gap="xs">
            <JimboText size="sm" tone="red">{error}</JimboText>
          </JimboStack>
        ) : null}

        <JimboCookLever
          cooking={isRunning}
          onCook={handleStart}
          onStop={cancel}
          matchSprites={matchSprites}
        />

        <RunConfigModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          deck={deck}
          stake={stake}
          onChange={(d, s) => {
            setDeck(d as keyof typeof MotelyDeck);
            setStake(s as keyof typeof MotelyStake);
          }}
        />
      </JimboAppScroll>
    </JimboApp>
  );
}
