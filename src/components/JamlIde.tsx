"use client";

import React, { useState } from "react";
import { JamlMapPreview } from "./JamlMapPreview.js";
import {
  JamlMapEditor,
  CategoryMenu,
  JokerPicker,
  CategoryPicker,
  VOUCHER_PICKER_CONFIG,
  TAG_PICKER_CONFIG,
  BOSS_PICKER_CONFIG,
  TAROT_PICKER_CONFIG,
  PLANET_PICKER_CONFIG,
  SPECTRAL_PICKER_CONFIG,
  PACK_PICKER_CONFIG,
  type SlotCategory,
  type SlotSelection,
} from "./jamlMap/index.js";
import { JamlIdeToolbar, type JamlIdeMode } from "./JamlIdeToolbar.js";
import {
  JamlIdeVisual,
  type JamlVisualFilter,
  type JamlZone,
  type JamlVisualClause,
} from "./JamlIdeVisual.js";
import { JamlCodeEditor } from "./JamlCodeEditor.js";
import { Jamlyzer } from "./Jamlyzer.js";
import { normalizeJamlSeed } from "./jamlSeedUtils.js";
import { JimboButton, JimboModal } from "../ui/panel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JimboResultRow } from "../ui/JimboResultRow.js";
import { mergeSeedsIntoJaml } from "../lib/jaml/jamlSeeds.js";
import { jamlTextToVisualFilter, visualFilterToJamlText } from "../utils/jamlVisualFilter.js";
import { useWebMcpTools } from "../webmcp/useWebMcp.js";
import { createJamlIdeWebMcpTools } from "../webmcp/jamlTools.js";

const CATEGORY_CONFIG_MAP = {
  voucher: VOUCHER_PICKER_CONFIG,
  tag: TAG_PICKER_CONFIG,
  boss: BOSS_PICKER_CONFIG,
  tarot: TAROT_PICKER_CONFIG,
  planet: PLANET_PICKER_CONFIG,
  spectral: SPECTRAL_PICKER_CONFIG,
  pack: PACK_PICKER_CONFIG,
} as const;

export interface JamlIdeSearchResult {
  seed: string;
  score?: number;
  tallyColumns?: number[];
  tallyLabels?: string[];
}

export interface JamlIdeProps {
  /** Controlled value. When provided alongside `onChange`, the editor is fully controlled. */
  jaml?: string;
  /** Initial value for uncontrolled mode. Ignored when `jaml` is provided on first render. */
  defaultJaml?: string;
  /** Subscriber for every edit. Optional — the editor still works without it. */
  onChange?: (jaml: string) => void;
  defaultMode?: JamlIdeMode;
  searchResults?: JamlIdeSearchResult[];
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: React.ReactNode;
  compactHeader?: boolean;
  actions?: React.ReactNode;
  codePlaceholder?: string;
  onSearch?: () => void;
  isSearching?: boolean;
  /**
   * Shows a "Load File" button in the toolbar and loads the selected file into the editor.
   * When `onLoadFile` is provided, that callback is used (for example, a mounted library flow).
   * Otherwise the component falls back to a browser file picker.
   */
  showLoadFileButton?: boolean;
  onLoadFile?: () => Promise<string | null> | string | null;
  /**
   * Controlled visual filter. When provided alongside `onVisualFilterChange`, the Visual tab
   * is fully controlled by the parent. When absent, the Visual tab auto-derives from the text.
   */
  visualFilter?: JamlVisualFilter;
  onVisualFilterChange?: (filter: JamlVisualFilter) => void;
  /**
   * Register this live IDE with the browser's WebMCP API (`navigator.modelContext`).
   * Pass `true` for default tool names (`jaml_*`) or a string prefix (e.g. `"seedfinder"`).
   */
  webMcp?: boolean | string;
}

export type { JamlVisualFilter } from "./JamlIdeVisual.js";
export type { JamlVisualClause, JamlZone } from "./JamlIdeVisual.js";

async function pickAndReadJamlFile(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const pickerWindow = window as Window & {
    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: Array<{ description?: string; accept: Record<string, string[]> }>;
    }) => Promise<Array<{ getFile(): Promise<File> }>>;
  };

  if (pickerWindow.showOpenFilePicker) {
    const [handle] = await pickerWindow.showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: "JAML Files",
          accept: {
            "text/plain": [".jaml", ".yaml", ".yml", ".txt"],
          },
        },
      ],
    });
    if (!handle) return null;
    const file = await handle.getFile();
    return await file.text();
  }

  return await new Promise<string | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jaml,.yaml,.yml,.txt,text/plain";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      resolve(await file.text());
    };
    input.click();
  });
}

export function JamlIde({
  jaml,
  defaultJaml,
  onChange,
  defaultMode = "code",
  searchResults = [],
  className = "",
  style,
  title,
  subtitle,
  compactHeader = true,
  actions,
  codePlaceholder = "Enter JAML...",
  onSearch,
  isSearching = false,
  showLoadFileButton = false,
  onLoadFile,
  visualFilter,
  onVisualFilterChange,
  webMcp = false,
}: JamlIdeProps) {
  const [mode, setMode] = useState<JamlIdeMode>(defaultMode);
  const [internalText, setInternalText] = useState<string>(jaml ?? defaultJaml ?? "");
  const [lastJamlProp, setLastJamlProp] = useState<string | undefined>(jaml);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [expandedSeed, setExpandedSeed] = useState<string | null>(null);

  // Adjust-state-during-render: sync controlled `jaml` prop into internal text.
  if (jaml !== lastJamlProp) {
    setLastJamlProp(jaml);
    if (jaml !== undefined) setInternalText(jaml);
  }

  const text = internalText;

  const handleTextChange = (next: string) => {
    setInternalText(next);
    onChange?.(next);
  };

  const handleLoadFile = async () => {
    setIsLoadingFile(true);
    try {
      const loadedText = onLoadFile ? await onLoadFile() : await pickAndReadJamlFile();
      if (loadedText === null) return;
      handleTextChange(loadedText);
      setMode("code");
    } catch {
      // Keep this non-fatal so users can keep editing if they cancel or picker fails.
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Derived visual filter state (used only when not externally controlled).
  const [lastParsedText, setLastParsedText] = useState<string>("");
  const [lastParsedFilter, setLastParsedFilter] = useState<JamlVisualFilter>(() =>
    jamlTextToVisualFilter(jaml ?? defaultJaml ?? ""),
  );

  if (visualFilter === undefined && mode === "visual" && text !== lastParsedText) {
    try {
      const parsed = jamlTextToVisualFilter(text);
      setLastParsedText(text);
      setLastParsedFilter(parsed);
    } catch {
      setLastParsedText(text);
    }
  }

  const activeFilter: JamlVisualFilter = visualFilter ?? lastParsedFilter;

  const handleVisualFilterChange = (next: JamlVisualFilter) => {
    if (onVisualFilterChange) {
      onVisualFilterChange(next);
    } else {
      const nextText = visualFilterToJamlText(next);
      setInternalText(nextText);
      setLastParsedFilter(next);
      setLastParsedText(nextText);
      onChange?.(nextText);
    }
  };

  const showResultsTab = Boolean(onSearch || searchResults.length > 0);
  const availableModes: JamlIdeMode[] = [
    "visual",
    "code",
    "map",
    ...(showResultsTab ? (["results"] as JamlIdeMode[]) : []),
    "jamlyzer",
  ];
  const headerVisible = Boolean(title || subtitle || actions);

  if (!availableModes.includes(mode)) {
    setMode("code");
  }

  // ── Add-clause picker state ──────────────────────────────────────────────
  const [addZone, setAddZone] = useState<JamlZone | null>(null);
  const [pickerFlow, setPickerFlow] = useState<"category" | SlotCategory>("category");

  const handleAddClause = (zone: JamlZone) => {
    setAddZone(zone);
    setPickerFlow("category");
  };

  const handlePickerSelect = (sel: SlotSelection) => {
    if (!addZone) return;
    const clause: JamlVisualClause = {
      id: `${Date.now()}-${Math.random()}`,
      type: sel.clauseKey,
      value: sel.value,
      label: sel.value,
    };
    handleVisualFilterChange({ ...activeFilter, [addZone]: [...activeFilter[addZone], clause] });
    setAddZone(null);
  };

  const handlePickerClose = () => {
    if (pickerFlow !== "category") {
      setPickerFlow("category");
    } else {
      setAddZone(null);
    }
  };

  const handleVerifyInJamlyzer = () => {
    const seeds = searchResults
      .map((result) => normalizeJamlSeed(result.seed))
      .filter((seed) => seed.length === 8);
    if (seeds.length === 0) return;
    handleTextChange(mergeSeedsIntoJaml(text, seeds, 1000));
    setMode("jamlyzer");
  };

  const maxScore = searchResults.length > 0
    ? Math.max(...searchResults.map((r) => r.score ?? 0))
    : 0;

  const webMcpEnabled = Boolean(webMcp);
  const webMcpTools = webMcpEnabled
    ? createJamlIdeWebMcpTools(
        {
          getJaml: () => text,
          setJaml: handleTextChange,
          getMode: () => mode,
          setMode,
          getAvailableModes: () => availableModes,
          getVisualFilter: () => {
            if (visualFilter !== undefined) return visualFilter;
            if (text === lastParsedText) return lastParsedFilter;
            try {
              return jamlTextToVisualFilter(text);
            } catch {
              return lastParsedFilter;
            }
          },
          setVisualFilter: handleVisualFilterChange,
          ...(showResultsTab ? { getSearchResults: () => searchResults } : {}),
          ...(onSearch ? { triggerSearch: onSearch, isSearching: () => isSearching } : {}),
        },
        { prefix: typeof webMcp === "string" ? webMcp : undefined },
      )
    : [];

  useWebMcpTools(webMcpTools, webMcpEnabled);

  return (
    <JimboBox className={`j-ide ${className}`.trim()} style={style}>
      {headerVisible ? (
        <JimboBox className={`j-ide__header ${compactHeader ? "j-ide__header--compact" : ""}`.trim()}>
          <JimboBox className="j-ide__header-copy">
            {title ? <JimboBox className="j-ide__title">{title}</JimboBox> : null}
            {subtitle ? <JimboBox className="j-ide__subtitle">{subtitle}</JimboBox> : null}
          </JimboBox>
          {actions ? <JimboBox className="j-ide__actions">{actions}</JimboBox> : null}
        </JimboBox>
      ) : null}

      <JamlIdeToolbar
        mode={mode}
        onModeChange={setMode}
        resultCount={searchResults.length}
        showResultsTab={showResultsTab}
        showJamlyzerTab
        onSearch={onSearch}
        isSearching={isSearching}
        onLoadFile={showLoadFileButton ? handleLoadFile : undefined}
        isLoadingFile={isLoadingFile}
      />

      <JimboBox className={`j-ide__body ${mode === "map" ? "j-ide__body--map" : ""}`.trim()}>
        {mode === "visual" ? (
          <JamlIdeVisual
            filter={activeFilter}
            onChange={handleVisualFilterChange}
            onAddClause={handleAddClause}
          />
        ) : null}

        {mode === "code" ? (
          <JamlCodeEditor
            value={text}
            onChange={handleTextChange}
            placeholder={codePlaceholder}
          />
        ) : null}

        {mode === "map" ? <JamlMapEditor onChange={handleTextChange} /> : null}

        {mode === "results" ? (
          <JimboBox className="j-ide__results">
            {searchResults.length === 0 ? (
              <JimboBox className="j-ide-results__empty">
                No results yet. Run a search to find seeds.
              </JimboBox>
            ) : (
              <JimboBox className="j-ide-results">
                <JimboBox className="j-ide-results__bridge">
                  <JimboButton tone="green" size="sm" onClick={handleVerifyInJamlyzer}>
                    Verify seeds
                  </JimboButton>
                  <JimboText size="xs" tone="white" className="j-ide-results__bridge-hint">
                    Writes {searchResults.length} hit{searchResults.length === 1 ? "" : "s"} to seeds: and opens Test
                  </JimboText>
                </JimboBox>

                <JimboBox className="j-ide-results__list">
                  {searchResults.map((result) => {
                    const isOpen = expandedSeed === result.seed;
                    const hasTally = Boolean(result.tallyColumns && result.tallyColumns.length > 0);

                    return (
                      <JimboResultRow
                        key={result.seed}
                        seed={result.seed}
                        score={result.score}
                        maxScore={maxScore}
                        expandable={hasTally}
                        expanded={isOpen}
                        onToggle={() => setExpandedSeed(isOpen ? null : result.seed)}
                        tallyLabels={result.tallyLabels}
                        tallyColumns={result.tallyColumns}
                        preview={
                          hasTally ? (
                            <JamlMapPreview
                              jaml={text}
                              tallyColumns={result.tallyColumns}
                              tallyLabels={result.tallyLabels}
                            />
                          ) : null
                        }
                      />
                    );
                  })}
                </JimboBox>
              </JimboBox>
            )}
          </JimboBox>
        ) : null}

        {mode === "jamlyzer" ? (
          <JimboBox className="j-ide__jamlyzer">
            <Jamlyzer jaml={text} />
          </JimboBox>
        ) : null}
      </JimboBox>

      <JimboModal
        open={addZone !== null}
        onClose={handlePickerClose}
        title={
          pickerFlow === "category"
            ? "Select Category"
            : pickerFlow === "joker"
            ? "Select Joker"
            : CATEGORY_CONFIG_MAP[pickerFlow as keyof typeof CATEGORY_CONFIG_MAP]?.title ?? "Select Item"
        }
        className="j-picker-modal"
      >
        {addZone !== null ? (
          pickerFlow === "category" ? (
            <CategoryMenu onSelect={(cat) => setPickerFlow(cat)} />
          ) : pickerFlow === "joker" ? (
            <JokerPicker onSelect={handlePickerSelect} />
          ) : (
            <CategoryPicker
              config={CATEGORY_CONFIG_MAP[pickerFlow as keyof typeof CATEGORY_CONFIG_MAP]}
              onSelect={handlePickerSelect}
            />
          )
        ) : null}
      </JimboModal>
    </JimboBox>
  );
}
