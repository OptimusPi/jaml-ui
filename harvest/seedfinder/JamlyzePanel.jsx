/**
 * JAMLYZE quadrant: seed input, per-ante tabs, and a clean sectioned view of
 * boss, voucher, tags, shop items, and pack contents with real sprite art.
 */
import React from "react";
import { ItemTile } from "./ItemTile";
import { parseClauseBlocks } from "./jaml-clauses";
import { anteToBlocks, BLOCK_TYPES } from "./card-blocks";

export function buildWatchList(jaml) {
  const groups = parseClauseBlocks(jaml);
  return [
    ...groups.must.map((c) => ({ name: c.name, mod: "j-stream-item--must-hit" })),
    ...groups.should.map((c) => ({ name: c.name, mod: "j-stream-item--should-hit" })),
  ];
}

function hitClass(watch, displayName) {
  const flat = String(displayName).replace(/\s+/g, "");
  const hit = watch.find((w) => flat.includes(w.name.replace(/\s+/g, "")));
  return hit ? hit.mod : "";
}

function SpriteItem({ kind, name, watch, label }) {
  if (!name) return null;
  return (
    <div className="jam-item" title={name}>
      {label && <span className="jam-item__label">{label}</span>}
      <span className={"jam-item__sprite " + hitClass(watch, name)}>
        <ItemTile kind={kind} name={name} scale={0.22} className="lab-sprite lab-sprite--stream" />
      </span>
    </div>
  );
}

export function MetaSection({ block, watch }) {
  if (!block) return null;
  const entries = [
    { key: "boss", label: "Boss", kind: "boss", name: block.boss },
    { key: "voucher", label: "Voucher", kind: "voucher", name: block.voucher },
    { key: "smallBlindTag", label: "Small Blind Tag", kind: "smallBlindTag", name: block.smallBlindTag },
    { key: "bigBlindTag", label: "Big Blind Tag", kind: "bigBlindTag", name: block.bigBlindTag },
  ].filter((e) => e.name);

  if (!entries.length) return null;

  return (
    <div className="jam-section jam-section--meta">
      <div className="jam-section__title">Meta</div>
      <div className="jam-section__grid jam-section__grid--meta">
        {entries.map((e) => (
          <SpriteItem key={e.key} kind={e.kind} name={e.name} watch={watch} label={e.label} />
        ))}
      </div>
    </div>
  );
}

export function ShopSection({ block, watch }) {
  if (!block || !block.items || !block.items.length) return null;
  return (
    <div className="jam-section jam-section--shop">
      <div className="jam-section__title">Shop</div>
      <div className="jam-section__grid jam-section__grid--shop">
        {block.items.map((it, i) => (
          <SpriteItem key={"s" + i} kind={it.type} name={it.name} watch={watch} />
        ))}
      </div>
    </div>
  );
}

function PackSection({ block, index, watch }) {
  if (!block || !block.items || !block.items.length) return null;
  return (
    <div className="jam-section jam-section--pack">
      <div className="jam-section__title">
        {block.name || `Pack ${index + 1}`}
        <span className={"jam-pick-chip" + (block.pick > 1 ? " jam-pick-chip--mega" : "")}>
          pick {block.pick} of {block.of}
        </span>
      </div>
      <div className="jam-section__grid jam-section__grid--pack">
        {block.items.map((it, j) => (
          <SpriteItem key={"pi" + index + "-" + j} kind={it.type} name={it.name} watch={watch} />
        ))}
      </div>
    </div>
  );
}

/** Law 1: where the legendaries actually come from. Each Soul sighting names
 * pack, pack slot, card position, and the legendary that Soul yields
 * (soul #k → legendaries[k]). The stream row shows the pull order so
 * "Canio is 2nd" is a fact on screen, not a hope. */
export function SoulsSection({ soulsBlock, streamBlock, watch }) {
  const souls = (soulsBlock && soulsBlock.entries) || [];
  const legendaries = (streamBlock && streamBlock.items) || [];
  if (!souls.length && !legendaries.length) return null;
  return (
    <div className="jam-section jam-section--souls">
      <div className="jam-section__title">Souls &amp; Legendaries</div>
      {souls.map((s, k) => (
        <div key={"soul" + k} className="jam-soul-line">
          <span className="jam-soul-line__where">
            {s.pack} · pack {s.packIndex + 1} · card {s.cardIndex + 1}
          </span>
          <span className="jam-soul-line__arrow">&rarr;</span>
          <span className={"jam-soul-line__yield " + hitClass(watch, s.yield || "")}>
            {s.yield || "?"}
          </span>
        </div>
      ))}
      {legendaries.length ? (
        <div className="jam-soul-stream">
          {legendaries.map((l, i) => (
            <span key={"leg" + i} className={"jam-soul-stream__item " + hitClass(watch, l.name)}>
              {l.position}. {l.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Thin block renderer: the ante view is driven by serializable blocks
 * (card-blocks.js) so a seed's story is data, not ad-hoc JSX. */
function renderBlock(block, index, blocks, watch) {
  switch (block.type) {
    case BLOCK_TYPES.META:
      return <MetaSection key="meta" block={block} watch={watch} />;
    case BLOCK_TYPES.SOULS:
      return (
        <SoulsSection
          key="souls"
          soulsBlock={block}
          streamBlock={blocks.find((b) => b.type === BLOCK_TYPES.LEGENDARY_STREAM)}
          watch={watch}
        />
      );
    case BLOCK_TYPES.LEGENDARY_STREAM:
      // rendered inside SoulsSection; skip if no souls block emitted it
      return blocks.some((b) => b.type === BLOCK_TYPES.SOULS) ? null : (
        <SoulsSection key="stream" soulsBlock={null} streamBlock={block} watch={watch} />
      );
    case BLOCK_TYPES.SHOP:
      return <ShopSection key="shop" block={block} watch={watch} />;
    case BLOCK_TYPES.PACK:
      return <PackSection key={"pack" + index} block={block} index={index} watch={watch} />;
    default:
      return null;
  }
}

/** One ante's full breakdown as sections — exported for the standalone
 * Jamlyzer page, which renders EVERY ante stacked instead of tabbed. */
export function JamlyzeBlocks({ ante, watch }) {
  return <>{anteToBlocks(ante).map((b, i, arr) => renderBlock(b, i, arr, watch || []))}</>;
}

/** Ante tabs + sectioned block view — the guts of Jamlyze, shared so any
 * panel (the standalone Jamlyze pane, or Results inline) can show the same
 * full-fidelity breakdown for a seed's `antes` array. */
export function JamlyzeBody({ antes, selectedAnte, onSelectAnte, watch, clipSeed, onClipAnalyze, analyzeMsg }) {
  const list = antes || [];
  const ante = list.find((a) => a.ante === selectedAnte) || list[0] || null;

  return (
    <div className="lab-jamlyze-body">
      <div className="lab-ante-tabs">
        <div className="lab-ante-tabs__title">ANTE</div>
        {list.map((a) => (
          <button
            key={a.ante}
            type="button"
            className={"lab-ante-tab" + (a.ante === (ante && ante.ante) ? " lab-ante-tab--active" : "")}
            onClick={() => onSelectAnte(a.ante)}
          >
            {a.ante}
          </button>
        ))}
      </div>
      <div className="j-ante-scroll lab-jamlyze-scroll">
        {ante ? (
          <div className="jam-body">
            {anteToBlocks(ante).map((b, i, arr) => renderBlock(b, i, arr, watch))}
          </div>
        ) : (
          <div className="lab-empty">
            {clipSeed ? (
              <button type="button" className="jam-clip-chip" onClick={() => onClipAnalyze && onClipAnalyze(clipSeed)}>
                seed in clipboard — tap to analyze {clipSeed}
              </button>
            ) : null}
            <div>{analyzeMsg || "enter a seed — real motely analysis"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function JamlyzePanel({ jaml, seedVal, onSeedInput, analysis, analyzeMsg, selectedAnte, onSelectAnte, clipSeed, onClipAnalyze }) {
  const watch = buildWatchList(jaml);

  return (
    <div className="lab-panel lab-panel--jamlyze" data-screen-label="Jamlyze">
      <div className="lab-jamlyze-seed-row">
        <input
          className="j-seed-input__field lab-jamlyze-seed-input"
          value={seedVal}
          onChange={(e) => onSeedInput(e.target.value)}
          maxLength={8}
          placeholder="SEED"
        />
      </div>
      <JamlyzeBody
        antes={analysis}
        selectedAnte={selectedAnte}
        onSelectAnte={onSelectAnte}
        watch={watch}
        clipSeed={clipSeed}
        onClipAnalyze={onClipAnalyze}
        analyzeMsg={analyzeMsg}
      />
    </div>
  );
}
