"use client";
import { SeedData } from "@/lib/types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Sprite } from "./Sprite";
import { cn } from "@/lib/utils";

/**
 * Agnostic SeedCard Component
 * 
 * Displays a Balatro seed visualization with Jokers and Stats.
 * Decoupled from "Daily Wee" logic (countdown, scores, submit) which should be injected via props.
 */

interface SeedCardProps {
    seed: SeedData;
    className?: string; // Additional styling

    // Core Data
    lockedLabel?: string; // If 'locked', what to display? e.g. "LOCKED" or hidden

    // Actions
    onCopy?: () => void; // Override default copy behavior

    // Slots for injecting Logic/UI
    footer?: React.ReactNode;      // The bottom action bar (Play, Submit, etc)
    extraDetails?: React.ReactNode; // Content for the "Details/Strategy" view
    headerBadge?: React.ReactNode;  // Badge in top right (e.g. "Starting 2s")
}

export function SeedCard({
    seed,
    className,
    lockedLabel,
    onCopy,
    footer,
    extraDetails,
    headerBadge
}: SeedCardProps) {
    const [copied, setCopied] = useState(false);
    const isLocked = !!lockedLabel;

    const handleCopy = async () => {
        if (onCopy) {
            onCopy();
        } else {
            await navigator.clipboard.writeText(seed.seed);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to extract jokers from seed data
    const getJokers = (ante: 1 | 2) => {
        const jokers: { id: string; name: string; tally?: number }[] = [];

        // Theme Joker
        if (seed.themeJoker && seed.themeJoker !== "Joker") {
            const themeTally = ante === 1 ? seed.themeCardAnte1 : seed.themeCardAnte2;
            if ((themeTally ?? 0) > 0) {
                const jokerId = seed.themeJoker.toLowerCase().replace(/ /g, "");
                jokers.push({ id: jokerId, name: seed.themeJoker, tally: themeTally as number });
            }
        }

        // Helper to avoid dupes
        const isAlreadyAdded = (name: string) => jokers.some(j => j.name === name);

        // Standard Wee/Hack/Chad checks
        const weeTally = ante === 1 ? seed.WeeJoker_Ante1 : seed.WeeJoker_Ante2;
        if ((weeTally ?? 0) > 0 && !isAlreadyAdded("Wee Joker")) {
            jokers.push({ id: "weejoker", name: "Wee Joker", tally: weeTally as number });
        }
        const hackTally = ante === 1 ? seed.Hack_Ante1 : seed.Hack_Ante2;
        if ((hackTally ?? 0) > 0 && !isAlreadyAdded("Hack")) {
            jokers.push({ id: "hack", name: "Hack", tally: hackTally as number });
        }
        const chadTally = ante === 1 ? seed.HanginChad_Ante1 : seed.HanginChad_Ante2;
        if ((chadTally ?? 0) > 0 && !isAlreadyAdded("Hanging Chad")) {
            jokers.push({ id: "hangingchad", name: "Hanging Chad", tally: chadTally as number });
        }

        // Blueprints (Ante 1 only usually?)
        if (ante === 1) {
            if ((seed.blueprint_early ?? 0) > 0 && !isAlreadyAdded("Blueprint")) jokers.push({ id: "blueprint", name: "Blueprint", tally: seed.blueprint_early as number });
            if ((seed.brainstorm_early ?? 0) > 0 && !isAlreadyAdded("Brainstorm")) jokers.push({ id: "brainstorm", name: "Brainstorm", tally: seed.brainstorm_early as number });
        }
        return jokers;
    };

    return (
        <div className={cn("relative group flex flex-col balatro-sway", className)}>
            <div className="balatro-panel p-3 flex flex-col relative h-full z-10 grow gap-2 min-h-[345px] !overflow-visible">

                {/* Header Row */}
                <div className="flex w-full overflow-hidden rounded-lg border-2 border-black shrink-0 h-10 shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                    {/* Seed ID / Copy Button */}
                    <div className="w-1/2 bg-[var(--balatro-grey-darker)] flex items-center justify-center border-r-2 border-black overflow-hidden px-1">
                        {!isLocked ? (
                            <button onClick={handleCopy} className="flex items-center gap-2 outline-none w-full justify-center">
                                <div className={cn("p-1 rounded-md transition-colors shrink-0 border border-black/50", copied ? 'bg-[var(--balatro-green)]' : 'bg-[#222]')}>
                                    {copied ? <Check size={10} className="text-white" strokeWidth={4} /> : <Copy size={10} className="text-white/60" strokeWidth={3} />}
                                </div>
                                <span className={cn("font-header text-xs tracking-wider truncate", copied ? 'text-[var(--balatro-green)]' : 'text-white')}>{copied ? 'COPIED!' : seed.seed}</span>
                            </button>
                        ) : (
                            <span className="font-header text-sm text-white/20 tracking-widest leading-none">--------</span>
                        )}
                    </div>

                    {/* Top Right Badge (default: Twos) */}
                    <div className="w-1/2 bg-[var(--balatro-grey-dark)] flex flex-col items-center justify-center p-0.5">
                        {headerBadge || (
                            <>
                                <span className="font-header text-lg text-white tracking-widest leading-none drop-shadow-md">{seed.twos ?? 0}</span>
                                <span className="font-header text-[var(--balatro-blue)] text-[8px] tracking-widest uppercase mt-[-2px]">Starting 2&apos;s</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Area: Jokers */}
                <div className="flex-1 flex flex-col min-h-0 bg-[var(--balatro-grey-darker)] rounded-lg border-2 border-black overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">

                    {/* Joker Visualization */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5 px-2 py-1 overflow-visible">
                        {!isLocked ? (
                            <div className="flex flex-wrap gap-2 items-center justify-center">
                                {[1, 2].flatMap((anteNum) =>
                                    getJokers(anteNum as 1 | 2).map((j) => (
                                        <div key={`${anteNum}-${j.id}`} className="relative flex flex-col items-center group/joker">
                                            {/* Ante Badge */}
                                            <div className={cn(
                                                "absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-header z-20 shadow-sm border border-black",
                                                anteNum === 1 ? "bg-[var(--balatro-gold)] text-white" : "bg-[var(--balatro-blue)] text-white"
                                            )}>
                                                {anteNum}
                                            </div>

                                            {/* Count Badge */}
                                            {j.tally !== undefined && j.tally > 1 && (
                                                <div className="absolute -top-1 -right-1 bg-white text-black border border-black font-header text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-full z-20 shadow-sm">
                                                    {j.tally}
                                                </div>
                                            )}

                                            <Sprite
                                                name={j.id}
                                                width={j.id === 'weejoker' ? 18 : 32}
                                                className="drop-shadow-sm transition-transform group-hover/joker:scale-110"
                                            />
                                            <span className="font-header text-[6px] text-white uppercase mt-0.5 leading-none">{j.name}</span>
                                        </div>
                                    ))
                                )}
                                {getJokers(1).length === 0 && getJokers(2).length === 0 && (
                                    <span className="font-pixel text-white/10 text-[9px] uppercase tracking-widest py-4">No Jokers Found</span>
                                )}
                            </div>
                        ) : (
                            // LOCkED STATE
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <Sprite name="joker" width={48} className="grayscale" />
                            </div>
                        )}
                    </div>

                    {/* Optional Extra Details Slot */}
                    {extraDetails && (
                        <div className="border-t border-[#333]">
                            {extraDetails}
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                {footer && (
                    <div className="mt-1.5 shrink-0 z-50">
                        {footer}
                    </div>
                )}

                {/* LOCKED Label fallback */}
                {isLocked && !footer && (
                    <div className="mt-1.5 shrink-0 z-50 w-full bg-[#111] text-white/20 font-header text-md py-3 rounded-lg flex items-center justify-center border border-[#333] uppercase tracking-widest">
                        {lockedLabel}
                    </div>
                )}

            </div>
        </div>
    );
}
