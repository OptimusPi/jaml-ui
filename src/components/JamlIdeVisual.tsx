"use client";

import React, { useRef } from "react";
import { useJamlIdeDrag } from "../ui/hooks.js";
import { JimboSprite } from "../ui/sprites.js";
import { JimboInlineEdit } from "../ui/JimboInlineEdit.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboZoneRail } from "../ui/JimboZoneRail.js";
import { JimboClauseCard, JimboAddSlotTile, JimboDragGhost } from "../ui/JimboClauseCard.js";
import type { SpriteSheetType } from "../sprites/spriteMapper.js";

export type JamlZone = "must" | "should" | "mustnot";

export interface JamlVisualClause {
  id: string;
  type: string;
  value: string;
  label?: string;
  antes?: number[];
  boosterPacks?: number[];
  score?: number;
  edition?: string;
}

export interface JamlVisualFilter {
  name?: string;
  author?: string;
  description?: string;
  deck?: string;
  stake?: string;
  must: JamlVisualClause[];
  should: JamlVisualClause[];
  mustnot: JamlVisualClause[];
}

export interface JamlIdeVisualProps {
  filter: JamlVisualFilter;
  onChange: (filter: JamlVisualFilter) => void;
  /** Tap a clause to edit it (Pass 2 wires this to the cascade picker). */
  onEditClause?: (zone: JamlZone, clause: JamlVisualClause) => void;
  /** Tap the "?" mystery tile to add a new clause to a zone (Pass 2 wires this to the cascade picker). */
  onAddClause?: (zone: JamlZone) => void;
}

function clauseSpriteSheet(type: string): SpriteSheetType | undefined {
  if (
    type === "joker" ||
    type === "jokers" ||
    type === "rareJoker" ||
    type === "rareJokers" ||
    type === "commonJoker" ||
    type === "commonJokers" ||
    type === "uncommonJoker" ||
    type === "uncommonJokers" ||
    type === "legendaryJoker"
  ) {
    return "Jokers";
  }
  if (type === "voucher") return "Vouchers";
  if (
    type === "tag" ||
    type === "tags" ||
    type === "smallBlindTag" ||
    type === "bigBlindTag" ||
    type === "smallblindtag" ||
    type === "bigblindtag"
  ) {
    return "tags";
  }
  if (type === "boss") return "BlindChips";
  if (
    type === "tarot" ||
    type === "tarotCard" ||
    type === "spectral" ||
    type === "spectralCard" ||
    type === "planet" ||
    type === "planetCard"
  ) {
    return "Tarots";
  }
  return undefined;
}

export function JamlIdeVisual({ filter, onChange, onEditClause, onAddClause }: JamlIdeVisualProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { drag, onDragStart } = useJamlIdeDrag(filter, onChange, rootRef);

  const removeClause = (zone: JamlZone, id: string) => {
    onChange({ ...filter, [zone]: filter[zone].filter((c) => c.id !== id) });
  };

  const renderClauseSprite = (clause: JamlVisualClause, size = 40) => {
    const sheet = clauseSpriteSheet(clause.type);
    if (!sheet) return null;
    return <JimboSprite name={clause.value} sheet={sheet} width={size} />;
  };

  const renderZone = (zone: JamlZone) => {
    const clauses = filter[zone];
    return (
      <JimboZoneRail zone={zone} variant="editor" count={clauses.length}>
        {clauses.map((c) => (
          <JimboClauseCard
            key={c.id}
            zone={zone}
            label={c.label || c.value}
            antes={c.antes}
            score={c.score}
            sprite={renderClauseSprite(c)}
            onRemove={() => removeClause(zone, c.id)}
            onEdit={() => onEditClause?.(zone, c)}
            onDragStart={(e) => onDragStart(e, c, zone)}
          />
        ))}
        <JimboAddSlotTile
          zone={zone}
          onTap={onAddClause ? () => onAddClause(zone) : undefined}
        />
      </JimboZoneRail>
    );
  };

  return (
    <JimboBox ref={rootRef} className="j-ide-visual">
      <JimboInnerPanel className="j-jaml-ide-visual__top-matter">
        <JimboInlineEdit
          size="lg"
          tone="white"
          value={filter.name ?? ""}
          placeholder="Untitled"
          onChange={(e) => onChange({ ...filter, name: e.target.value })}
        />
        <JimboBox className="j-jaml-ide-visual__byline">
          <JimboText size="micro" tone="white" className="j-jaml-ide-visual__by-label">
            By
          </JimboText>
          <JimboInlineEdit
            size="sm"
            tone="gold"
            value={filter.author ?? ""}
            placeholder="anonymous"
            onChange={(e) => onChange({ ...filter, author: e.target.value })}
          />
        </JimboBox>
        <JimboInlineEdit
          size="xs"
          tone="white"
          dim
          value={filter.description ?? ""}
          placeholder="description"
          onChange={(e) => onChange({ ...filter, description: e.target.value })}
        />
      </JimboInnerPanel>

      <JimboBox className="j-ide-visual__pair">
        {renderZone("must")}
        {renderZone("mustnot")}
      </JimboBox>

      {renderZone("should")}

      {drag ? (
        <JimboDragGhost x={drag.x - drag.offX} y={drag.y - drag.offY}>
          <JimboClauseCard
            zone={drag.fromZone}
            label={drag.clause.label || drag.clause.value}
            antes={drag.clause.antes}
            score={drag.clause.score}
            sprite={renderClauseSprite(drag.clause)}
          />
        </JimboDragGhost>
      ) : null}
    </JimboBox>
  );
}
