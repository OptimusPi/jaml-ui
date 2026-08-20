import { schema } from "@json-render/react";
import { z } from "zod";

/**
 * Jimbo generative-UI catalog for Vercel Labs' `@json-render`.
 *
 * Defines the type-safe catalog of Jimbo design system components and
 * Balatro card sprites that an AI model may emit specs against.
 */
export const jimboCatalog = schema.createCatalog({
  components: {
    // ── Layout & Containers ───────────────────────────────────────────────
    JimboPanel: {
      props: z.object({
        title: z.string().optional(),
        tone: z.enum(["dark", "blue", "red", "green", "gold", "orange", "purple"]).optional(),
      }),
      slots: ["default"],
      description: "Outer arcade container panel with Balatro solid south drop shadow and header.",
      example: { title: "Ante 1 Shop", tone: "gold" },
    },

    JimboInnerPanel: {
      props: z.object({
        className: z.string().optional(),
      }),
      slots: ["default"],
      description: "Recessed inset card/panel inside a JimboPanel.",
      example: {},
    },

    JimboRow: {
      props: z.object({
        gap: z.enum(["xs", "sm", "md", "lg"]).optional(),
        wrap: z.boolean().optional(),
        align: z.enum(["start", "center", "end", "stretch"]).optional(),
        justify: z.enum(["start", "center", "end", "between"]).optional(),
      }),
      slots: ["default"],
      description: "Horizontal CSS Grid row layout.",
      example: { gap: "sm", align: "center" },
    },

    JimboStack: {
      props: z.object({
        gap: z.enum(["xs", "sm", "md", "lg"]).optional(),
        align: z.enum(["start", "center", "end", "stretch"]).optional(),
      }),
      slots: ["default"],
      description: "Vertical CSS Grid stack layout.",
      example: { gap: "sm", align: "start" },
    },

    JimboBox: {
      props: z.object({
        className: z.string().optional(),
      }),
      slots: ["default"],
      description: "Generic CSS Grid box container.",
      example: {},
    },

    // ── Game & Balatro Sprites ────────────────────────────────────────────
    JamlGameCard: {
      props: z.object({
        name: z.string(),
        type: z.enum(["joker", "consumable", "playing"]).default("joker"),
        scale: z.number().optional(),
      }),
      slots: [],
      description: "Authentic pixel-art Balatro card (Joker, Consumable, or Playing Card).",
      example: { name: "WeeJoker", type: "joker", scale: 0.8 },
    },

    StandardCard: {
      props: z.object({
        rank: z.string(),
        suit: z.enum(["Spades", "Hearts", "Clubs", "Diamonds"]).default("Spades"),
        enhancement: z.string().optional(),
        edition: z.string().optional(),
        seal: z.string().optional(),
        size: z.number().optional(),
      }),
      slots: [],
      description: "Authentic Balatro playing card with suit, rank, and enhancements.",
      example: { rank: "Two", suit: "Spades", size: 52 },
    },

    DeckSprite: {
      props: z.object({
        deck: z.string().default("Erratic"),
        stake: z.string().optional(),
        size: z.number().optional(),
      }),
      slots: [],
      description: "Balatro deck card sprite with optional stake chip.",
      example: { deck: "Erratic", stake: "White", size: 50 },
    },

    // ── JAMLyzer ──────────────────────────────────────────────────────────
    JamlyzerSeedCard: {
      props: z.object({
        seed: z.string(),
        score: z.number().optional(),
        pinned: z.boolean().optional(),
      }),
      slots: [],
      description: "Interactive candidate seed card with score pill, copy button, and milestone chips.",
      example: {
        seed: "18Z47K9Q",
        score: 120,
        pinned: true,
      },
    },

    // ── Atoms & Primitives ────────────────────────────────────────────────
    JimboButton: {
      props: z.object({
        label: z.string(),
        tone: z.enum(["blue", "red", "green", "orange"]).default("blue"),
        size: z.enum(["xs", "sm", "md", "lg"]).default("sm"),
        action: z.string().optional(),
      }),
      slots: [],
      description: "Tactile Balatro button with press-down spring feel.",
      example: { label: "Analyze Seed", tone: "green", size: "sm" },
    },

    JimboBadge: {
      props: z.object({
        text: z.string(),
        tone: z.enum(["dark", "blue", "red", "green", "grey", "orange", "purple"]).default("dark"),
        size: z.enum(["sm", "md"]).default("sm"),
      }),
      slots: [],
      description: "Arcade badge chip pill.",
      example: { text: "Ante 1", tone: "orange", size: "sm" },
    },

    JimboText: {
      props: z.object({
        text: z.string(),
        size: z.enum(["micro", "xs", "sm", "md", "lg", "title"]).default("sm"),
        tone: z.enum(["white", "gold", "blue", "red", "green", "grey"]).default("white"),
      }),
      slots: [],
      description: "Pixel-crisp arcade typography text.",
      example: { text: "Rare Joker Guaranteed", tone: "gold", size: "sm" },
    },

    JimboSeedCopyChip: {
      props: z.object({
        value: z.string(),
      }),
      slots: [],
      description: "1-click Balatro seed copy pill with clipboard feedback.",
      example: { value: "WEEJ0KER" },
    },

    JimboStatusPill: {
      props: z.object({
        label: z.string(),
        status: z.enum(["idle", "running", "ok", "error", "paused"]).default("idle"),
      }),
      slots: [],
      description: "Key-value status metric pill.",
      example: { label: "Score: 245", status: "ok" },
    },
  },

  actions: {
    copySeed: {
      params: z.object({ seed: z.string() }),
      description: "Copy a Balatro seed to the user's clipboard.",
    },
    selectSeed: {
      params: z.object({ seed: z.string() }),
      description: "Select a seed for deep Ante inspection.",
    },
    loadJaml: {
      params: z.object({ jaml: z.string() }),
      description: "Load a JAML filter into the editor.",
    },
  },
});
