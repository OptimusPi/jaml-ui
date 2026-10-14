"use client";

import React from "react";
import { defineRegistry } from "@json-render/react";
import { jimboCatalog } from "./catalog.js";

// Import real Jimbo UI components
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboRow, JimboStack } from "../ui/JimboLayout.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboBadge } from "../ui/JimboBadge.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboSeedCopyChip } from "../ui/JimboSeedCopyChip.js";
import { JimboStatusPill } from "../ui/JimboStatusPill.js";
import { JamlGameCard } from "../components/GameCard.js";
import { StandardCard } from "../components/StandardCard.js";
import { DeckSprite } from "../components/DeckSprite.js";
import { JamlyzerSeedCard } from "../components/jamlyzer/JamlyzerSeedCard.js";
import { CardSuit, CardRank } from "../components/cardEnums.js";
import type { MotelyJamlyzerSeedResult } from "motely-wasm";

/**
 * Official Jimbo Component Registry for Vercel `@json-render/react`.
 */
export const {
  registry: jimboRegistry,
  handlers: jimboHandlers,
  executeAction: executeJimboAction,
} = defineRegistry(jimboCatalog, {
  components: {
    // ── Layout & Containers ───────────────────────────────────────────────
    JimboPanel: ({ props, children }) => (
      <JimboPanel title={props.title} tone={props.tone as never}>
        {children}
      </JimboPanel>
    ),

    JimboInnerPanel: ({ props, children }) => (
      <JimboInnerPanel className={props.className}>{children}</JimboInnerPanel>
    ),

    JimboRow: ({ props, children }) => (
      <JimboRow
        gap={props.gap as never}
        wrap={props.wrap}
        align={props.align as never}
        justify={props.justify as never}
      >
        {children}
      </JimboRow>
    ),

    JimboStack: ({ props, children }) => (
      <JimboStack gap={props.gap as never} align={props.align as never}>
        {children}
      </JimboStack>
    ),

    JimboBox: ({ props, children }) => (
      <JimboBox className={props.className}>{children}</JimboBox>
    ),

    // ── Game & Balatro Sprites ────────────────────────────────────────────
    JamlGameCard: ({ props }) => (
      <JamlGameCard
        card={{ name: props.name, scale: props.scale }}
        type={props.type}
      />
    ),

    StandardCard: ({ props }) => (
      <StandardCard
        rank={(props.rank as CardRank) ?? CardRank.Two}
        suit={(props.suit as CardSuit) ?? CardSuit.Spades}
        enhancement={props.enhancement as never}
        edition={props.edition as never}
        seal={props.seal as never}
        size={props.size ?? 52}
      />
    ),

    DeckSprite: ({ props }) => (
      <DeckSprite
        deck={props.deck as never}
        stake={props.stake as never}
        size={props.size ?? 50}
      />
    ),

    // ── JAMLyzer ──────────────────────────────────────────────────────────
    JamlyzerSeedCard: ({ props, emit }) => {
      const syntheticResult = {
        seed: props.seed,
        score: props.score ?? 0,
        antes: [],
        events: [],
        streamStates: [],
      } as unknown as MotelyJamlyzerSeedResult;
      return (
        <JamlyzerSeedCard
          result={syntheticResult}
          pinned={props.pinned ?? false}
          onSelect={() => emit("selectSeed")}
        />
      );
    },

    // ── Atoms & Primitives ────────────────────────────────────────────────
    JimboButton: ({ props, emit }) => (
      <JimboButton
        tone={props.tone as never}
        size={props.size as never}
        onClick={() => {
          if (props.action) emit(props.action);
        }}
      >
        {props.label}
      </JimboButton>
    ),

    JimboBadge: ({ props }) => (
      <JimboBadge tone={props.tone as never} size={props.size as never}>
        {props.text}
      </JimboBadge>
    ),

    JimboText: ({ props }) => (
      <JimboText tone={props.tone as never} size={props.size as never}>
        {props.text}
      </JimboText>
    ),

    JimboSeedCopyChip: ({ props }) => (
      <JimboSeedCopyChip value={props.value} />
    ),

    JimboStatusPill: ({ props }) => (
      <JimboStatusPill
        label={props.label}
        status={props.status as never}
      />
    ),
  },

  actions: {
    copySeed: async (params) => {
      const seed = params && "seed" in params ? String(params.seed) : undefined;
      if (seed && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(seed);
      }
    },
    selectSeed: async (params) => {
      const seed = params && "seed" in params ? String(params.seed) : undefined;
      console.log("[JimboRenderer] Selected seed:", seed);
    },
    loadJaml: async (params) => {
      const jaml = params && "jaml" in params ? String(params.jaml) : undefined;
      console.log("[JimboRenderer] Loaded JAML:", jaml);
    },
  },
});
