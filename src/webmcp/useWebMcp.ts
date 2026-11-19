"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import {
  getRegisteredWebMcpTools,
  isWebMcpSupported,
  registerWebMcpTools,
  subscribeWebMcpTools,
  type WebMcpTool,
  type WebMcpToolSnapshot,
} from "./modelContext.js";

const EMPTY_SNAPSHOT: readonly WebMcpToolSnapshot[] = [];

/**
 * Reactively reports whether the browser exposes native Chrome WebMCP (`navigator.modelContext`).
 * SSR-safe (returns `false` on the server).
 */
export function useWebMcpSupported(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => isWebMcpSupported(),
    () => false,
  );
}

/**
 * Subscribe to the live list of WebMCP tools registered by mounted `jaml-ui` components.
 */
export function useRegisteredWebMcpTools(): readonly WebMcpToolSnapshot[] {
  return useSyncExternalStore(
    subscribeWebMcpTools,
    getRegisteredWebMcpTools,
    () => EMPTY_SNAPSHOT,
  );
}

/**
 * Register a list of WebMCP tools for the lifetime of a component.
 *
 * Re-registers only when the set of tool names/schemas or `enabled` changes;
 * `execute` closures stay fresh across renders via ref indirection so typing
 * in an editor never churns Chrome's tool registry.
 */
export function useWebMcpTools(
  tools: readonly WebMcpTool<Record<string, unknown>, unknown>[],
  enabled = true,
): void {
  const latestRef = useRef<Map<string, WebMcpTool<Record<string, unknown>, unknown>>>(new Map());

  useEffect(() => {
    const map = new Map<string, WebMcpTool<Record<string, unknown>, unknown>>();
    for (const tool of tools) {
      map.set(tool.name, tool);
    }
    latestRef.current = map;
  });

  // Stable signature of tool metadata so changing callback identities alone
  // does not unregister & re-register on every keystroke.
  const signature = useMemo(
    () =>
      tools
        .map((t) => `${t.name}:${t.description}:${JSON.stringify(t.inputSchema ?? null)}`)
        .join("|"),
    [tools],
  );

  useEffect(() => {
    if (!enabled || tools.length === 0) return;

    const latest = new Map<string, WebMcpTool<Record<string, unknown>, unknown>>();
    for (const tool of tools) {
      latest.set(tool.name, tool);
    }
    latestRef.current = latest;

    const wrapped: WebMcpTool<Record<string, unknown>, unknown>[] = tools.map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
      inputSchema: t.inputSchema,
      outputSchema: t.outputSchema,
      annotations: t.annotations,
      execute: (input, ctx) => {
        const current = latestRef.current.get(t.name);
        if (!current) {
          throw new Error(`WebMCP tool "${t.name}" is no longer mounted.`);
        }
        return current.execute(input, ctx);
      },
    }));

    return registerWebMcpTools(wrapped);
    // Intentionally keyed on metadata signature + enabled so closure updates flow via latestRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, signature]);
}

/**
 * Register a single WebMCP tool for the lifetime of a component.
 */
export function useWebMcpTool<
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TOutput = unknown,
>(tool: WebMcpTool<TInput, TOutput>, enabled = true): void {
  const list = useMemo(
    () => [tool as unknown as WebMcpTool<Record<string, unknown>, unknown>],
    [tool],
  );
  useWebMcpTools(list, enabled);
}
