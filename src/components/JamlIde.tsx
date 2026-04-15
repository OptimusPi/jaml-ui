"use client";

import React, { useMemo, useState } from "react";
import { JamlMapPreview } from "./JamlMapPreview.js";
import { JamlIdeToolbar, type JamlIdeMode } from "./JamlIdeToolbar.js";

export interface JamlIdeSearchResult {
  seed: string;
  score?: number;
}

export interface JamlIdeProps {
  jaml: string;
  onChange: (jaml: string) => void;
  defaultMode?: JamlIdeMode;
  searchResults?: JamlIdeSearchResult[];
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  codePlaceholder?: string;
}

function ResultsView({ results }: { results: JamlIdeSearchResult[] }) {
  if (results.length === 0) {
    return (
      <div
        style={{
          border: "1px dashed rgba(255,255,255,0.18)",
          borderRadius: 12,
          padding: 14,
          fontSize: 12,
          opacity: 0.72,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        No results yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {results.map((result, index) => (
        <div
          key={`${result.seed}-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: 0.4 }}>{result.seed}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{result.score !== undefined ? result.score : "-"}</div>
        </div>
      ))}
    </div>
  );
}

export function JamlIde({
  jaml,
  onChange,
  defaultMode = "code",
  searchResults = [],
  className = "",
  title = "JAML IDE",
  actions,
  codePlaceholder = "Enter JAML...",
}: JamlIdeProps) {
  const [mode, setMode] = useState<JamlIdeMode>(defaultMode);
  const results = useMemo(() => searchResults, [searchResults]);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 420,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#17181c",
        color: "#f5f5f5",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 11, opacity: 0.66 }}>Reusable JAML authoring and preview surface.</div>
        </div>
        {actions ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div> : null}
      </div>

      <JamlIdeToolbar mode={mode} onModeChange={setMode} resultCount={results.length} />

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {mode === "code" ? (
          <textarea
            title="JAML IDE Editor"
            value={jaml}
            onChange={(event) => onChange(event.target.value)}
            placeholder={codePlaceholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            style={{
              width: "100%",
              minHeight: 320,
              resize: "vertical",
              border: 0,
              outline: 0,
              padding: 16,
              background: "transparent",
              color: "inherit",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          />
        ) : null}

        {mode === "map" ? <JamlMapPreview jaml={jaml} /> : null}
        {mode === "results" ? <div style={{ padding: 16 }}><ResultsView results={results} /></div> : null}
      </div>
    </div>
  );
}
