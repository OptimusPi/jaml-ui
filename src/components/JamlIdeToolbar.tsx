"use client";

import React from "react";
import { JimboButton } from "../ui/panel.js";
import { JimboTabs } from "../ui/jimboTabs.js";

import { JimboBox } from "../ui/JimboBox.js";

export type JamlIdeMode = "visual" | "code" | "inspect";

export interface JamlIdeToolbarProps {
  mode: JamlIdeMode;
  onModeChange: (mode: JamlIdeMode) => void;
  className?: string;
  onSearch?: () => void;
  isSearching?: boolean;
  onLoadFile?: () => void;
  isLoadingFile?: boolean;
}

export function JamlIdeToolbar({
  mode,
  onModeChange,
  className = "",
  onSearch,
  isSearching = false,
  onLoadFile,
  isLoadingFile = false,
}: JamlIdeToolbarProps) {
  const tabs: Array<{ id: JamlIdeMode; label: string }> = [
    { id: "visual", label: "Visual" },
    { id: "code", label: "JAML" },
    { id: "inspect", label: "Inspect" },
  ];

  return (
    <JimboBox className={`j-ide-toolbar ${className}`.trim()}>
      <JimboBox className="j-ide-toolbar__tabs">
        <JimboTabs
          tabs={tabs}
          activeTab={mode}
          onTabChange={(id) => onModeChange(id as JamlIdeMode)}
        />
      </JimboBox>

      {onSearch && (
        <JimboBox className="j-ide-toolbar__action">
          <JimboButton tone="red" size="sm" onClick={onSearch}>
            {isSearching ? "Stop" : "Search"}
          </JimboButton>
        </JimboBox>
      )}

      {onLoadFile && (
        <JimboBox className="j-ide-toolbar__action">
          <JimboButton tone="blue" size="sm" onClick={onLoadFile} disabled={isLoadingFile}>
            {isLoadingFile ? "Loading..." : "Load File"}
          </JimboButton>
        </JimboBox>
      )}
    </JimboBox>
  );
}
