"use client";

import React from "react";

export type JamlIdeMode = "code" | "map" | "results";

export interface JamlIdeToolbarProps {
  mode: JamlIdeMode;
  onModeChange: (mode: JamlIdeMode) => void;
  resultCount?: number;
  className?: string;
  onSearch?: () => void;
  isSearching?: boolean;
}

const TABS: Array<{ id: JamlIdeMode; label: string }> = [
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
        padding: "8px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {TABS.map((tab) => {
          const selected = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onModeChange(tab.id)}
              style={{
                cursor: "pointer",
                borderRadius: 8,
                border: selected ? "1px solid rgba(247,185,85,0.55)" : "1px solid transparent",
                background: selected ? "rgba(247,185,85,0.16)" : "transparent",
                color: selected ? "#f7b955" : "rgba(255,255,255,0.58)",
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {tab.label}
              {tab.id === "results" && resultCount > 0 ? (
                <span
                  style={{
                    marginLeft: 6,
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.25)",
                    padding: "1px 6px",
                    fontSize: 10,
                  }}
                >
                  {resultCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {onSearch ? (
        <button
          type="button"
          onClick={onSearch}
          disabled={isSearching}
          style={{
            cursor: isSearching ? "not-allowed" : "pointer",
            borderRadius: 8,
            border: "1px solid rgba(74,222,128,0.4)",
            background: isSearching ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.15)",
            color: isSearching ? "#ef4444" : "#4ade80",
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {isSearching ? "Stop" : "Search"}
        </button>
      ) : null}
    </div>
  );
}
