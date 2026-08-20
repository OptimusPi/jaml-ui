"use client";

export { jimboCatalog } from "./catalog.js";
export {
  jimboRegistry,
  jimboHandlers,
  executeJimboAction,
} from "./registry.js";
export {
  JimboJsonRenderer,
  type JimboJsonRendererProps,
} from "./JimboJsonRenderer.js";

// Re-export core Vercel json-render framework primitives
export {
  defineCatalog,
  defineDirective,
  validateSpec,
  autoFixSpec,
  buildUserPrompt,
  type Catalog,
  type Spec,
  type InferSpec,
  type InferCatalogComponents,
} from "@json-render/core";

export {
  Renderer,
  defineRegistry,
  createRenderer,
  StateProvider,
  JSONUIProvider,
  useStateStore,
  useStateValue,
  type ReactSpec,
  type ReactSchema,
} from "@json-render/react";
