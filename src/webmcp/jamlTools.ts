import { getCompletions, getDiagnostics, getHover, Severity, Vocab } from "jaml-lang";
import type { JamlIdeMode } from "../components/JamlIdeToolbar.js";
import type { JamlIdeSearchResult } from "../components/JamlIde.js";
import type { JamlVisualClause, JamlVisualFilter, JamlZone } from "../components/JamlIdeVisual.js";
import type { WebMcpTool } from "./modelContext.js";

export interface JamlWebMcpOptions {
  /** Optional prefix prepended to every tool name, e.g. `"seedfinder"` -> `"seedfinder_jaml_validate"`. */
  prefix?: string;
}

function prefixName(base: string, prefix?: string): string {
  const clean = prefix?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return clean ? `${clean}_${base}` : base;
}

function formatDiagnostics(text: string) {
  const sevLabel: Record<number, string> = {
    [Severity.Error]: "error",
    [Severity.Warning]: "warning",
    [Severity.Information]: "info",
    [Severity.Hint]: "hint",
  };
  return getDiagnostics(text).map((d) => ({
    severity: sevLabel[d.severity] ?? String(d.severity),
    line: d.range.start.line + 1,
    column: d.range.start.character + 1,
    message: d.message,
  }));
}

function resolveOffset(text: string, input: Record<string, unknown>): number {
  if (typeof input.offset === "number") {
    return Math.max(0, Math.min(input.offset, text.length));
  }
  const line = Number(input.line ?? 0);
  const character = Number(input.character ?? 0);
  const lines = text.split("\n");
  let offset = 0;
  for (let i = 0; i < Math.min(line, lines.length); i++) {
    offset += lines[i].length + 1;
  }
  return Math.min(offset + character, text.length);
}

/**
 * Pure client-side JAML language tools backed by `jaml-lang`.
 * Exposes validation, completions, hover docs, and Motely vocabulary directly
 * to Chrome WebMCP (`navigator.modelContext`) without any backend MCP server.
 */
export function createJamlLangWebMcpTools(
  options: JamlWebMcpOptions = {},
): WebMcpTool<Record<string, unknown>, unknown>[] {
  const p = options.prefix;

  return [
    {
      name: prefixName("jaml_validate", p),
      title: "Validate JAML",
      description:
        "Validate a Balatro JAML seed filter document and return line/column diagnostics.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Full JAML filter document." },
        },
        required: ["text"],
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
      execute: (input) => {
        const text = String(input.text ?? "");
        const diagnostics = formatDiagnostics(text);
        return {
          valid: diagnostics.every((d) => d.severity !== "error"),
          diagnosticCount: diagnostics.length,
          diagnostics,
        };
      },
    },
    {
      name: prefixName("jaml_vocab", p),
      title: "List JAML vocabulary",
      description:
        "List valid JAML grammar keys or enum values (e.g. joker, voucher, tag, boss, deck, stake).",
      inputSchema: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            description:
              "Enum group name (e.g. 'joker', 'voucher', 'tag', 'boss', 'deck', 'stake'). Omit for overview.",
          },
          query: {
            type: "string",
            description: "Optional case-insensitive substring filter for values.",
          },
        },
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
      execute: (input) => {
        const kind = typeof input.kind === "string" && input.kind.trim() ? input.kind.trim() : null;
        if (kind) {
          const hit = Object.entries(Vocab.Enums).find(
            ([k]) => k.toLowerCase() === kind.toLowerCase(),
          );
          if (!hit) {
            return {
              error: `Unknown vocab kind "${kind}".`,
              availableKinds: Object.keys(Vocab.Enums),
            };
          }
          const query = typeof input.query === "string" ? input.query.trim().toLowerCase() : "";
          const values = query
            ? hit[1].filter((v) => v.toLowerCase().includes(query))
            : hit[1];
          return {
            kind: hit[0],
            total: values.length,
            values,
          };
        }

        return {
          rootKeys: Vocab.RootKeys,
          discriminators: Vocab.Discriminators,
          enumGroups: Object.fromEntries(
            Object.entries(Vocab.Enums).map(([k, v]) => [k, v.length]),
          ),
        };
      },
    },
    {
      name: prefixName("jaml_completions", p),
      title: "JAML completions",
      description:
        "Get context-aware JAML completions at a cursor offset or 0-based line/character.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Full JAML document." },
          offset: { type: "integer", description: "Absolute character offset." },
          line: { type: "integer", description: "0-based line number (when offset omitted)." },
          character: { type: "integer", description: "0-based column (when offset omitted)." },
        },
        required: ["text"],
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
      execute: (input) => {
        const text = String(input.text ?? "");
        const items = getCompletions(text, resolveOffset(text, input));
        return {
          count: items.length,
          items: items.slice(0, 60).map((c) => ({
            label: c.label,
            kind: c.kind,
            detail: c.detail,
            insertText: c.insertText,
          })),
        };
      },
    },
    {
      name: prefixName("jaml_hover", p),
      title: "JAML hover docs",
      description: "Get inline documentation for the JAML keyword or value at a cursor position.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Full JAML document." },
          offset: { type: "integer", description: "Absolute character offset." },
          line: { type: "integer", description: "0-based line number (when offset omitted)." },
          character: { type: "integer", description: "0-based column (when offset omitted)." },
        },
        required: ["text"],
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
      execute: (input) => {
        const text = String(input.text ?? "");
        const hover = getHover(text, resolveOffset(text, input));
        return {
          found: Boolean(hover),
          markdown: hover?.markdown ?? null,
        };
      },
    },
  ];
}

export interface JamlIdeWebMcpController {
  getJaml: () => string;
  setJaml: (next: string) => void;
  getMode: () => JamlIdeMode;
  setMode: (mode: JamlIdeMode) => void;
  getAvailableModes: () => readonly JamlIdeMode[];
  getVisualFilter: () => JamlVisualFilter;
  setVisualFilter: (next: JamlVisualFilter) => void;
  getSearchResults?: () => readonly JamlIdeSearchResult[];
  triggerSearch?: () => void;
  isSearching?: () => boolean;
}

/**
 * Stateful WebMCP toolset bound to a live `JamlIde` instance.
 * Lets a Chrome agent read/edit the active filter, add visual clauses, switch
 * tabs, trigger seed search, and inspect matching results directly in the page.
 */
export function createJamlIdeWebMcpTools(
  controller: JamlIdeWebMcpController,
  options: JamlWebMcpOptions = {},
): WebMcpTool<Record<string, unknown>, unknown>[] {
  const p = options.prefix;
  const tools: WebMcpTool<Record<string, unknown>, unknown>[] = [
    ...createJamlLangWebMcpTools(options),
    {
      name: prefixName("jaml_get_document", p),
      title: "Read active JAML document",
      description:
        "Read the current JAML document, active IDE tab, visual clauses, and validation diagnostics.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true, idempotentHint: true },
      execute: () => {
        const jaml = controller.getJaml();
        const diagnostics = formatDiagnostics(jaml);
        return {
          mode: controller.getMode(),
          availableModes: controller.getAvailableModes(),
          jaml,
          valid: diagnostics.every((d) => d.severity !== "error"),
          diagnostics,
        };
      },
    },
    {
      name: prefixName("jaml_set_document", p),
      title: "Update active JAML document",
      description:
        "Replace the JAML text in the live IDE editor and return validation diagnostics.",
      inputSchema: {
        type: "object",
        properties: {
          jaml: { type: "string", description: "Complete replacement JAML filter document." },
        },
        required: ["jaml"],
      },
      annotations: { readOnlyHint: false, idempotentHint: true },
      execute: (input) => {
        const next = String(input.jaml ?? "");
        controller.setJaml(next);
        const diagnostics = formatDiagnostics(next);
        return {
          updated: true,
          valid: diagnostics.every((d) => d.severity !== "error"),
          diagnostics,
        };
      },
    },
    {
      name: prefixName("jaml_add_clause", p),
      title: "Add JAML clause",
      description:
        "Add a filter clause (e.g. joker Blueprint, voucher Telescope, boss The Plant) to the must, should, or mustnot zone in the live IDE.",
      inputSchema: {
        type: "object",
        properties: {
          zone: {
            type: "string",
            enum: ["must", "should", "mustnot"],
            description: "Target filter zone.",
          },
          type: {
            type: "string",
            description: "JAML clause key (e.g. joker, rareJoker, legendaryJoker, voucher, tag, boss, tarot, spectral, planet).",
          },
          value: {
            type: "string",
            description: "Item name (e.g. Blueprint, Perkeo, Blank, The Hook).",
          },
          antes: {
            type: "array",
            items: { type: "integer" },
            description: "Optional list of ante numbers where this clause applies.",
          },
          score: {
            type: "number",
            description: "Optional bonus score (used in should zone).",
          },
        },
        required: ["zone", "type", "value"],
      },
      annotations: { readOnlyHint: false },
      execute: (input) => {
        const rawZone = String(input.zone ?? "must").toLowerCase();
        const zone: JamlZone =
          rawZone === "should" ? "should" : rawZone === "mustnot" ? "mustnot" : "must";
        const type = String(input.type ?? "joker").trim();
        const value = String(input.value ?? "").trim();
        if (!value) {
          return { added: false, error: "Clause value is required." };
        }
        const antes = Array.isArray(input.antes)
          ? input.antes.map((n) => Number(n)).filter((n) => Number.isFinite(n))
          : undefined;
        const score = typeof input.score === "number" ? input.score : undefined;

        const current = controller.getVisualFilter();
        const clause: JamlVisualClause = {
          id: `webmcp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type,
          value,
          label: value,
          ...(antes && antes.length > 0 ? { antes } : {}),
          ...(score !== undefined ? { score } : {}),
        };

        controller.setVisualFilter({
          ...current,
          [zone]: [...current[zone], clause],
        });

        return {
          added: true,
          zone,
          clause,
        };
      },
    },
    {
      name: prefixName("jaml_set_ide_mode", p),
      title: "Switch JAML IDE tab",
      description: "Switch the visible tab in the live JAML IDE (visual, code, map, results, jamlyzer).",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["visual", "code", "map", "results", "jamlyzer"],
            description: "Target IDE tab.",
          },
        },
        required: ["mode"],
      },
      annotations: { readOnlyHint: false, idempotentHint: true },
      execute: (input) => {
        const requested = String(input.mode ?? "") as JamlIdeMode;
        const available = controller.getAvailableModes();
        if (!available.includes(requested)) {
          return {
            switched: false,
            error: `Mode "${requested}" is unavailable. Available: ${available.join(", ")}`,
          };
        }
        controller.setMode(requested);
        return { switched: true, mode: requested };
      },
    },
  ];

  if (controller.triggerSearch) {
    tools.push({
      name: prefixName("jaml_run_search", p),
      title: "Start or stop seed search",
      description: "Toggle the seed search wired to the live JAML IDE toolbar.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: false },
      execute: () => {
        const wasSearching = controller.isSearching?.() ?? false;
        controller.triggerSearch?.();
        return { triggered: true, previousState: wasSearching ? "searching" : "idle" };
      },
    });
  }

  if (controller.getSearchResults) {
    tools.push({
      name: prefixName("jaml_get_results", p),
      title: "Get seed search results",
      description: "Return matching Balatro seeds and scores currently loaded in the JAML IDE.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true, idempotentHint: true },
      execute: () => {
        const results = controller.getSearchResults?.() ?? [];
        return {
          count: results.length,
          results,
        };
      },
    });
  }

  return tools;
}
