/**
 * JAMLYZE — the standalone seed x-ray. /jamlyze/LOLAEFGT → every ante of
 * one seed as ONE magnetic-scroll page. No tabs, no filter machinery, no
 * ceremony: souls, legendaries, shop, packs, boss, voucher, tags — the
 * whole story, shareable as a link.
 *
 * Deck/stake default to Red/White; ?deck=Ghost&stake=Gold overrides.
 * The engine (motely-wasm) boots on the main thread exactly like the lab —
 * the server never runs a search.
 */
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import bootsharp, { MotelyDeck, MotelyStake } from "motely-wasm";
import { analyzeSeedToAntes } from "./seedlab/run-card";
import { JamlyzeBlocks } from "./seedlab/JamlyzePanel";
import "./seedlab/seedlab.css";
import "./seedlab/card-blocks.css";
import "./jamlyze-page.css";

document.documentElement.classList.add("standalone");

const SEED_RE = /^[A-Z0-9]{5,8}$/;

function seedFromPath() {
  try {
    const m = window.location.pathname.match(/^\/jamlyze\/?([A-Za-z0-9]{0,8})/);
    return m && m[1] ? m[1].toUpperCase() : "";
  } catch { return ""; }
}

function enumKey(enumObj, raw, fallback) {
  if (!raw) return fallback;
  const hit = Object.keys(enumObj).find((k) => k.toLowerCase() === String(raw).toLowerCase());
  return hit || fallback;
}

const params = new URLSearchParams(window.location.search);
const DECK = enumKey(MotelyDeck, params.get("deck"), "Red");
const STAKE = enumKey(MotelyStake, params.get("stake"), "White");
const PAGE_JAML = `name: Jamlyze\ndeck: ${DECK}\nstake: ${STAKE}`;

function JamlyzePage() {
  const [seed, setSeed] = useState(seedFromPath);
  const [boot, setBoot] = useState("booting");
  const [clipSeed, setClipSeed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (bootsharp.getStatus() === bootsharp.BootStatus.Standby) await bootsharp.boot();
        if (!cancelled) setBoot("ready");
      } catch (ex) {
        if (!cancelled) setBoot("error: " + ((ex && ex.message) || ex));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // No seed in the URL? Offer the clipboard's — one tap, magic moment.
  useEffect(() => {
    if (seed || !(navigator.clipboard && navigator.clipboard.readText)) return;
    navigator.clipboard.readText()
      .then((t) => {
        const clean = (t || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (SEED_RE.test(clean)) setClipSeed(clean);
      })
      .catch(() => {});
  }, [seed]);

  // Keep the URL truthful so copying the address bar always shares THIS seed.
  useEffect(() => {
    if (!SEED_RE.test(seed)) return;
    const url = "/jamlyze/" + seed + (params.get("deck") || params.get("stake") ? window.location.search : "");
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
      document.title = "JAMLYZE — " + seed;
    }
  }, [seed]);

  // The analysis error is DERIVED from (boot, seed), not an event — computing
  // it inside the same memo keeps it in lockstep with `antes` and avoids the
  // setState-during-render loop the old separate error state risked.
  const { antes, analyzeErr } = useMemo(() => {
    if (boot !== "ready" || !SEED_RE.test(seed)) return { antes: null, analyzeErr: "" };
    try {
      return { antes: analyzeSeedToAntes(PAGE_JAML, seed), analyzeErr: "" };
    } catch (ex) {
      return { antes: null, analyzeErr: String((ex && ex.message) || ex) };
    }
  }, [boot, seed]);

  return (
    <div className="jz-root">
      <header className="jz-head">
        <div className="jz-word">JAMLYZE</div>
        <input
          className="j-seed-input__field lab-jamlyze-seed-input jz-input"
          value={seed}
          onChange={(e) => setSeed(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
          maxLength={8}
          placeholder="SEED"
          autoFocus
        />
        <div className="jz-meta">{DECK} · {STAKE}</div>
      </header>

      {antes && antes.length ? (
        <div className="jz-scroll">
          {antes.map((a) => (
            <section key={a.ante} className="jz-ante">
              <div className="jz-ante__num">ANTE {a.ante}</div>
              <div className="jz-ante__body">
                <JamlyzeBlocks ante={a} watch={[]} />
              </div>
            </section>
          ))}
          <div className="jz-end">— end of the line · {antes.length} antes deep —</div>
        </div>
      ) : (
        <div className="jz-empty">
          {boot === "ready" ? (
            analyzeErr ? (
              <div>{analyzeErr}</div>
            ) : clipSeed ? (
              <button type="button" className="jam-clip-chip jz-clip" onClick={() => setSeed(clipSeed)}>
                seed in clipboard — tap to analyze {clipSeed}
              </button>
            ) : (
              <div>type a seed — the whole run, every ante, one page</div>
            )
          ) : (
            <div>{boot === "booting" ? "booting the engine…" : boot}</div>
          )}
        </div>
      )}

      <footer className="jz-foot">
        <div>Not affiliated with LocalThunk or Playstack</div>
        <div>Made with ♥ for the Balatro community · Motely, the Balatro seed engine</div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<JamlyzePage />);
