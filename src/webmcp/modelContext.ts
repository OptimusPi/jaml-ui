/**
 * WebMCP (Web Model Context Protocol) browser client adapter.
 *
 * Targets the W3C / Chrome `navigator.modelContext` imperative API so any page
 * embedding `jaml-ui` can expose live, typed tools directly to browser agents —
 * no `ui://` iframe host protocol, no stdio server, zero external dependencies.
 *
 * Also maintains an in-page mirror registry so Storybook and non-WebMCP browsers
 * can inspect and invoke registered tools locally with identical semantics.
 */

export interface WebMcpJsonSchema {
  type?: "object" | "string" | "number" | "integer" | "boolean" | "array" | "null";
  description?: string;
  enum?: readonly (string | number | boolean)[];
  properties?: Record<string, WebMcpJsonSchema>;
  items?: WebMcpJsonSchema;
  required?: readonly string[];
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean | WebMcpJsonSchema;
}

export interface WebMcpToolAnnotations {
  /** Tool only reads state and produces no side effects. */
  readOnlyHint?: boolean;
  /** Tool may mutate or delete user state in a non-trivial way. */
  destructiveHint?: boolean;
  /** Repeated calls with the same input produce the same effect. */
  idempotentHint?: boolean;
  /** Tool interacts with external/open-world resources. */
  openWorldHint?: boolean;
  /** Chrome WebMCP hint for high-impact user actions. */
  consequentialHint?: boolean;
}

export interface WebMcpExecutionContext {
  signal?: AbortSignal;
  /** Optional browser prompt hook for human-in-the-loop confirmation. */
  requestUserInteraction?: <T>(callback: () => Promise<T>) => Promise<T>;
}

export interface WebMcpTool<
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TOutput = unknown,
> {
  /** Unique snake_case or kebab-case identifier exposed to browser agents. */
  name: string;
  /** Optional human-readable display title. */
  title?: string;
  /** Natural-language description used by agents to pick and invoke this tool. */
  description: string;
  /** Standard JSON Schema object describing `input`. */
  inputSchema?: WebMcpJsonSchema;
  /** Optional JSON Schema describing the serialized return payload. */
  outputSchema?: WebMcpJsonSchema;
  /** Optional behavioral hints for browser permission / confirmation UI. */
  annotations?: WebMcpToolAnnotations;
  /** Executes when an agent (or local inspector) calls the tool. */
  execute: (input: TInput, context: WebMcpExecutionContext) => TOutput | Promise<TOutput>;
}

export interface WebMcpRegisterOptions {
  signal?: AbortSignal;
}

export interface NavigatorModelContext {
  registerTool: (
    tool: WebMcpTool<Record<string, unknown>, unknown>,
    options?: WebMcpRegisterOptions,
  ) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
  provideContext?: (options: { tools: WebMcpTool<Record<string, unknown>, unknown>[] }) => void | Promise<void>;
  clearContext?: () => void | Promise<void>;
}

export interface WebMcpToolSnapshot {
  name: string;
  title?: string;
  description: string;
  inputSchema?: WebMcpJsonSchema;
  outputSchema?: WebMcpJsonSchema;
  annotations?: WebMcpToolAnnotations;
}

type RegistryListener = () => void;

const localRegistry = new Map<string, WebMcpTool<Record<string, unknown>, unknown>>();
const listeners = new Set<RegistryListener>();
let cachedSnapshot: readonly WebMcpToolSnapshot[] = [];

function emitRegistryChange() {
  cachedSnapshot = Array.from(localRegistry.values()).map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: t.inputSchema,
    outputSchema: t.outputSchema,
    annotations: t.annotations,
  }));
  listeners.forEach((fn) => fn());
}

/**
 * Resolve the native Chrome / W3C WebMCP `modelContext` object if available.
 * Safe under SSR (returns `null` outside the browser).
 */
export function getModelContext(): NavigatorModelContext | null {
  if (typeof navigator !== "undefined") {
    const nav = navigator as Navigator & { modelContext?: NavigatorModelContext };
    if (nav.modelContext && typeof nav.modelContext.registerTool === "function") {
      return nav.modelContext;
    }
  }
  if (typeof document !== "undefined") {
    const doc = document as Document & { modelContext?: NavigatorModelContext };
    if (doc.modelContext && typeof doc.modelContext.registerTool === "function") {
      return doc.modelContext;
    }
  }
  return null;
}

/** True when the current browser exposes native WebMCP (`navigator.modelContext`). */
export function isWebMcpSupported(): boolean {
  return getModelContext() !== null;
}

/** Subscribe to changes in the local mirror of registered WebMCP tools. */
export function subscribeWebMcpTools(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable snapshot of all currently registered tools (compatible with `useSyncExternalStore`). */
export function getRegisteredWebMcpTools(): readonly WebMcpToolSnapshot[] {
  return cachedSnapshot;
}

/**
 * Invoke any currently registered WebMCP tool directly from client code or
 * an in-page inspector (uses the exact same `execute` callback Chrome invokes).
 */
export async function invokeWebMcpTool<TOutput = unknown>(
  name: string,
  input: Record<string, unknown> = {},
  context: WebMcpExecutionContext = {},
): Promise<TOutput> {
  const tool = localRegistry.get(name);
  if (!tool) {
    throw new Error(`WebMCP tool "${name}" is not registered.`);
  }
  return (await tool.execute(input, context)) as TOutput;
}

/**
 * Register a set of tools with native `navigator.modelContext` (when present)
 * AND the local mirror registry. Returns a synchronous `dispose()` cleanup
 * function that unregisters every tool cleanly.
 */
export function registerWebMcpTools(
  tools: readonly WebMcpTool<Record<string, unknown>, unknown>[],
  options: WebMcpRegisterOptions = {},
): () => void {
  const mc = getModelContext();
  const controller = new AbortController();
  const registeredNames: string[] = [];

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  for (const tool of tools) {
    localRegistry.set(tool.name, tool);
    registeredNames.push(tool.name);

    if (mc && !controller.signal.aborted) {
      try {
        const maybePromise = mc.registerTool(tool, { signal: controller.signal });
        if (maybePromise && typeof (maybePromise as Promise<void>).catch === "function") {
          (maybePromise as Promise<void>).catch(() => {
            // Non-fatal: some early browser builds reject duplicate names during HMR/StrictMode.
          });
        }
      } catch {
        // Non-fatal: keep local registry active even if host modelContext rejects.
      }
    }
  }

  emitRegistryChange();

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    controller.abort();

    for (const name of registeredNames) {
      if (localRegistry.get(name) && tools.some((t) => t.name === name && t === localRegistry.get(name))) {
        localRegistry.delete(name);
      }
      if (mc && typeof mc.unregisterTool === "function") {
        try {
          const maybePromise = mc.unregisterTool(name);
          if (maybePromise && typeof (maybePromise as Promise<void>).catch === "function") {
            (maybePromise as Promise<void>).catch(() => {});
          }
        } catch {
          // Ignore already-unregistered errors when signal abort already cleaned up.
        }
      }
    }

    emitRegistryChange();
  };
}
