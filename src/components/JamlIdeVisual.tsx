"use client";

import React, { useRef } from "react";
import { FiX } from "react-icons/fi";
import { useJamlIdeDrag } from "../ui/hooks.js";
import { JimboSprite } from "../ui/sprites.js";
import { JimboIconButton } from "../ui/JimboIconButton.js";
import { JimboInlineEdit } from "../ui/JimboInlineEdit.js";
import { JimboBox } from "../ui/JimboBox.js";
import { JimboInline } from "../ui/JimboInline.js";
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


const ZONE_META: Record<JamlZone, { label: string; hint: string; color: string; accent: string }> = {
    must: { label: "Must", hint: "Seed must contain all of these.", color: "#429f79", accent: "#35bd86" },
    should: { label: "Should", hint: "Bonus points per match.", color: "#ff9800", accent: "#ff8f00" },
    mustnot: { label: "Must Not", hint: "Rejected if any appear.", color: "#fe5148", accent: "#fe5148" },
};

export function clauseSpriteSheet(type: string): SpriteSheetType | undefined {
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
    ) return "Jokers";
    if (type === "voucher") return "Vouchers";
    if (
        type === "tag" ||
        type === "tags" ||
        type === "smallBlindTag" ||
        type === "bigBlindTag" ||
        type === "smallblindtag" ||
        type === "bigblindtag"
    ) return "tags";
    if (type === "boss") return "BlindChips";
    if (
        type === "tarot" ||
        type === "tarotCard" ||
        type === "spectral" ||
        type === "spectralCard" ||
        type === "planet" ||
        type === "planetCard"
    ) return "Tarots";
    return undefined;
}

export function ClauseSprite({ clause, size = 40 }: { clause: JamlVisualClause; size?: number }) {
    const sheet = clauseSpriteSheet(clause.type);
    if (!sheet) return null;
    return <JimboSprite name={clause.value} sheet={sheet} width={size} />;
}

export function ClauseCard({
    clause,
    zone,
    onRemove,
    onEdit,
    onDragStart,
}: {
    clause: JamlVisualClause;
    zone: JamlZone;
    onRemove: () => void;
    onEdit: () => void;
    onDragStart: (e: React.MouseEvent | React.TouchEvent, clause: JamlVisualClause, zone: JamlZone) => void;
}) {
    const z = ZONE_META[zone];
    return (
        <JimboBox
            onClick={onEdit}
            onMouseDown={(e) => onDragStart(e, clause, zone)}
            onTouchStart={(e) => onDragStart(e, clause, zone)}
            className="j-jaml-ide-visual__clause-card"
            style={{ "--j-zone-color": z.color } as React.CSSProperties}
        >
            <JimboBox className="j-jaml-ide-visual__clause-card-icon">
                <ClauseSprite clause={clause} size={40} />
            </JimboBox>
            <JimboBox className="j-jaml-ide-visual__clause-card-content">
                <JimboBox className="j-jaml-ide-visual__clause-card-label">
                    {clause.label || clause.value}
                </JimboBox>
                <JimboBox className="j-jaml-ide-visual__clause-card-antes">
                    {clause.antes && clause.antes.length > 0 && (
                        <>
                            <JimboBox className="j-jaml-ide-visual__clause-card-ante-label">A</JimboBox>
                            {clause.antes.map((a) => (
                                <JimboBox
                                    key={a}
                                    className="j-jaml-ide-visual__clause-card-ante"
                                    style={{ "--j-zone-accent": z.accent } as React.CSSProperties}
                                >
                                    {a}
                                </JimboBox>
                            ))}
                        </>
                    )}
                    {zone === "should" && clause.score != null && (
                        <JimboBox className="j-jaml-ide-visual__clause-card-score">
                            +{clause.score}
                        </JimboBox>
                    )}
                </JimboBox>
            </JimboBox>
            <JimboIconButton
                size="xs"
                tone="destructive"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                aria-label={`Remove ${clause.label || clause.value}`}
            >
                <FiX />
            </JimboIconButton>
        </JimboBox>
    );
}

export function MysteryAddTile({ zone, onTap }: { zone: JamlZone; onTap?: () => void }) {
    const z = ZONE_META[zone];
    return (
        <JimboBox
            onClick={onTap}
            className={`j-jaml-ide-visual__mystery-tile ${onTap ? "j-jaml-ide-visual__mystery-tile--tappable" : ""}`}
            style={{ "--j-zone-color": z.color, "--j-zone-accent": z.accent } as React.CSSProperties}
        >
            <JimboBox className="j-jaml-ide-visual__mystery-tile-icon">
                ?
            </JimboBox>
            <JimboBox className="j-jaml-ide-visual__mystery-tile-label">
                Add to {z.label}
            </JimboBox>
        </JimboBox>
    );
}

export function ZoneRail({
    zone,
    clauses,
    onAdd,
    onRemove,
    onEdit,
    onDragStart,
}: {
    zone: JamlZone;
    clauses: JamlVisualClause[];
    onAdd?: () => void;
    onRemove: (id: string) => void;
    onEdit: (clause: JamlVisualClause) => void;
    onDragStart: (e: React.MouseEvent | React.TouchEvent, clause: JamlVisualClause, zone: JamlZone) => void;
}) {
    const z = ZONE_META[zone];
    return (
        <JimboBox
            data-zone={zone}
            className="j-jaml-ide-visual__zone-rail"
            style={{ "--j-zone-color": z.color } as React.CSSProperties}
        >
            <JimboBox className="j-jaml-ide-visual__zone-header">
                <JimboBox className="j-jaml-ide-visual__zone-label">
                    {z.label}
                </JimboBox>
                <JimboBox className="j-jaml-ide-visual__zone-divider" />
                <JimboBox className="j-jaml-ide-visual__zone-count">
                    {clauses.length}
                </JimboBox>
            </JimboBox>
            <JimboBox className="j-jaml-ide-visual__zone-hint">
                {z.hint}
            </JimboBox>

            <JimboBox className="j-jaml-ide-visual__zone-clauses">
                {clauses.map((c) => (
                    <ClauseCard
                        key={c.id}
                        clause={c}
                        zone={zone}
                        onRemove={() => onRemove(c.id)}
                        onEdit={() => onEdit(c)}
                        onDragStart={onDragStart}
                    />
                ))}
                <MysteryAddTile zone={zone} onTap={onAdd} />
            </JimboBox>
        </JimboBox>
    );
}

export function TopMatter({
    filter,
    onChange,
}: {
    filter: JamlVisualFilter;
    onChange: (filter: JamlVisualFilter) => void;
}) {
    return (
        <JimboBox className="j-inner-panel j-jaml-ide-visual__top-matter">
            <JimboInlineEdit
                size="lg"
                tone="white"
                value={filter.name ?? ""}
                placeholder="Untitled"
                onChange={(e) => onChange({ ...filter, name: e.target.value })}
            />
            <JimboBox className="j-jaml-ide-visual__byline">
                <JimboInline className="j-jaml-ide-visual__by-label">By</JimboInline>
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
        </JimboBox>
    );
}

export function JamlIdeVisual({ filter, onChange, onEditClause, onAddClause }: JamlIdeVisualProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const { drag, onDragStart } = useJamlIdeDrag(filter, onChange, rootRef);

    const removeClause = (zone: JamlZone, id: string) => {
        onChange({ ...filter, [zone]: filter[zone].filter((c) => c.id !== id) });
    };

    return (
        <JimboBox
            ref={rootRef}
            className="j-jaml-ide-visual"
        >
            <TopMatter filter={filter} onChange={onChange} />

            <JimboBox className="j-jaml-ide-visual__top-zones">
                <JimboBox className="j-jaml-ide-visual__top-zone-must">
                    <ZoneRail
                        zone="must"
                        clauses={filter.must}
                        onAdd={onAddClause ? () => onAddClause("must") : undefined}
                        onRemove={(id) => removeClause("must", id)}
                        onEdit={(c) => onEditClause?.("must", c)}
                        onDragStart={onDragStart}
                    />
                </JimboBox>
                <JimboBox className="j-jaml-ide-visual__top-zone-mustnot">
                    <ZoneRail
                        zone="mustnot"
                        clauses={filter.mustnot}
                        onAdd={onAddClause ? () => onAddClause("mustnot") : undefined}
                        onRemove={(id) => removeClause("mustnot", id)}
                        onEdit={(c) => onEditClause?.("mustnot", c)}
                        onDragStart={onDragStart}
                    />
                </JimboBox>
            </JimboBox>
            <ZoneRail
                zone="should"
                clauses={filter.should}
                onAdd={onAddClause ? () => onAddClause("should") : undefined}
                onRemove={(id) => removeClause("should", id)}
                onEdit={(c) => onEditClause?.("should", c)}
                onDragStart={onDragStart}
            />

            {drag && (
                <JimboBox
                    className="j-jaml-ide-visual__drag-ghost"
                    style={
                        {
                            "--j-drag-left": `${drag.x - drag.offX}px`,
                            "--j-drag-top": `${drag.y - drag.offY}px`,
                        } as React.CSSProperties
                    }
                >
                    <ClauseCard
                        clause={drag.clause}
                        zone={drag.fromZone}
                        onRemove={() => { }}
                        onEdit={() => { }}
                        onDragStart={() => { }}
                    />
                </JimboBox>
            )}
        </JimboBox>
    );
}
