/**
 * Filter Browser: browse the community filter library (saved whole JAML
 * filters — /api/filters, backed by lib/db.ts's `filters` table), not the
 * item/criteria Picker. Pick one to load its JAML into the editor.
 *
 * Back button rule (CLAUDE.md): exactly "Back", full-width, always orange,
 * always the bottom-most element.
 */
import React, { useEffect, useRef, useState } from "react";
import { apiUrl } from "../api-base";
import { LabBackFoot } from "./LabBackFoot";

export function FilterBrowser({ open, onClose, onLoad }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setStatus("loading");
      try {
        const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
        const res = await fetch(apiUrl("/api/filters", qs));
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setFilters(data.filters || []);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }, query ? 250 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [open, query]);

  if (!open) return null;

  return (
    <div className="lab-modal-overlay" onClick={onClose}>
      <div className="lab-picker lab-tone-blue" onClick={(e) => e.stopPropagation()}>
        <div className="lab-picker-head">
          <span className="lab-picker-title">Filter Library</span>
        </div>
        <div className="lab-picker-body">
          <input
            className="j-seed-input__field lab-jamlyze-seed-input"
            style={{ width: "100%", marginBottom: 8, textTransform: "none", letterSpacing: "normal" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search name, notes, slug…"
          />
          {status === "loading" ? <div className="lab-empty">loading…</div> : null}
          {status === "error" ? <div className="lab-empty">the filter library is resting (database down) — the lab still works, try again in a moment</div> : null}
          {status === "idle" && filters.length === 0 ? (
            <div className="lab-empty">no filters found</div>
          ) : null}
          {filters.map((f) => (
            <button
              key={f.slug}
              type="button"
              className="lab-filter-browser-row"
              onClick={() => onLoad(f.jaml)}
            >
              <div className="lab-filter-browser-row__name">{f.name}</div>
              <div className="lab-filter-browser-row__meta">
                {[f.deck, f.stake].filter(Boolean).join(" · ") || "any deck · any stake"}
              </div>
              {f.notes ? <div className="lab-filter-browser-row__notes">{f.notes}</div> : null}
            </button>
          ))}
        </div>
        <LabBackFoot onBack={onClose} />
      </div>
    </div>
  );
}
