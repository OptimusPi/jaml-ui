"use client";

import React from "react";
import { JimboButton } from "../ui/panel.js";
import { JimboColorOption } from "../ui/tokens.js";

export type JamlIdeMode = "visual" | "code" | "map" | "results";

export interface JamlIdeToolbarProps {
  mode: JamlIdeMode;
  onModeChange: (mode: JamlIdeMode) => void;
  resultCount?: number;
  className?: string;
  onSearch?: () => void;
  isSearching?: boolean;
}

const TABS: Array<{ id: JamlIdeMode; label: string }> = [
  { id: "visual", label: "Visual" },
  { id: "code", label: "Code" },
  { id: "map", label: "Map" },
  { id: "results", label: "Results" },
];

export function JamlIdeToolbar({ mode, onModeChange, resultCount = 0, className = "", onSearch, isSearching = false }: JamlIdeToolbarProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "6px 10px",
        borderBottom: `1px solid ${JimboColorOption.PANEL_EDGE}`,
        background: JimboColorOption.DARKEST,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {TABS.map((tab) => (
          <JimboButton
            key={tab.id}
            tone={mode === tab.id ? "gold" : "grey"}
            size="xs"
            onClick={() => onModeChange(tab.id)}
          >
            {tab.label}
            {tab.id === "results" && resultCount > 0 ? (
              <span style={{ marginLeft: 6, borderRadius: 999, background: "rgba(228,182,67,0.2)", color: JimboColorOption.GOLD_TEXT, padding: "1px 6px", fontSize: 10 }}>
                {resultCount}
              </span>
            ) : null}
          </JimboButton>
        ))}
      </div>

      {onSearch ? (
        <JimboButton tone={isSearching ? "red" : "blue"} size="xs" onClick={onSearch}>
          {isSearching ? "Stop" : "Search"}
        </JimboButton>
      ) : null}
    </div>
  );
}
