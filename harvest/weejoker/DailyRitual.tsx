"use client";

import { useState, useEffect, useCallback } from "react";
import { SeedData } from "@/lib/types";
import { SeedCard } from "./SeedCard";
import { DayHeader } from "./DayHeader";
import { WeepochCard } from "./WeepochCard";
import { DayNavigation } from "./DayNavigation";
import { WeeWisdom } from "./WeeWisdom";
import { AdRotator } from "./AdRotator";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";

interface RitualConfig {
    id: string;
    name: string;
    tagline: string;
    description: string;
    instructions: string;
    seed_source: string;
    jaml_rule_set: any;
    theme_colors: { primary: string; secondary: string; accent: string };
    assets: { icon: string; background: string };
    epoch: string;
}

interface DailyRitualProps {
    config: RitualConfig;
}

export function DailyRitual({ config }: DailyRitualProps) {
    const [seeds, setSeeds] = useState<SeedData[]>([]);
    const [viewingDay, setViewingDay] = useState<number>(1);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'main' | 'wisdom'>('main');
    const [error, setError] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [topScore, setTopScore] = useState<{ name: string; score: number } | null>(null);

    const [showSubmit, setShowSubmit] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Parse Epoch
    const EPOCH = new Date(config.epoch).getTime();
    const getDayNumber = () => Math.floor((Date.now() - EPOCH) / (24 * 60 * 60 * 1000)) + 1;

    // Convert setter to update URL
    const updateDay = (day: number | ((prev: number) => number)) => {
        setViewingDay(prev => {
            const newDay = typeof day === 'function' ? day(prev) : day;
            return newDay;
        });
    };

    // Synchronize URL with viewingDay state
    useEffect(() => {
        if (!mounted) return;
        const url = new URL(window.location.href);
        if (url.searchParams.get('day') !== viewingDay.toString()) {
            url.searchParams.set('day', viewingDay.toString());
            window.history.pushState({}, '', url);
        }
    }, [viewingDay, mounted]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dayParam = params.get('day');
        if (dayParam) {
            const dayNum = parseInt(dayParam, 10);
            if (!isNaN(dayNum)) setViewingDay(dayNum);
        } else {
            setViewingDay(getDayNumber());
        }
        setMounted(true);

        fetch(config.seed_source)
            .then(res => {
                if (!res.ok) throw new Error("The ritual hasn't been baked yet.");
                return res.json();
            })
            .then(data => setSchedule(data))
            .catch(e => {
                console.error("Schedule Error", e);
                setError(e.message || "Failed to load the daily ritual.");
            });
    }, [config.seed_source]);

    // Use schedule to load specific day data
    // This logic mimics DailyWee.tsx but uses the generic schedule
    const loadDayData = useCallback(async (day: number) => {
        const seedRaw = schedule[day - 1];
        const todayNum = getDayNumber();

        if (day > todayNum) {
            if (!seedRaw) {
                setSeeds([]);
                if (schedule.length > 0) setError("Future seed not found.");
            } else {
                // Map raw data using existing structure (assuming compatibility for now)
                // TODO: JAML Parser integration would go here to verify fields match rules
                setSeeds([mapRawToSeed(seedRaw)]);
                setError(null);
            }
        } else if (seedRaw) {
            setSeeds([mapRawToSeed(seedRaw)]);
            setError(null);
        } else {
            setSeeds([]);
            if (schedule.length > 0) setError("Seed not found.");
        }

        try {
            const scoreRes = await fetch(`/api/scores?day=${day}&ritual=${config.id}`);
            if (scoreRes.ok) {
                const scoreData = await scoreRes.json();
                if (scoreData.scores && scoreData.scores.length > 0) {
                    const top = scoreData.scores[0];
                    setTopScore({ name: top.playerName || top.player_name || top.name, score: top.score });
                } else setTopScore(null);
            } else setTopScore(null);
        } catch (e) {
            setTopScore(null);
        }
    }, [schedule, config.id]);

    useEffect(() => {
        if (!mounted) return;
        loadDayData(viewingDay);
    }, [viewingDay, mounted, loadDayData]);

    const todayNumber = getDayNumber();
    const canGoBack = viewingDay > 0;
    const canGoForward = viewingDay < todayNumber + 1;
    const seed = seeds.length > 0 ? seeds[0] : null;

    const getDayDisplay = (day: number) => {
        const adjustedDay = day < 1 ? 1 : day;
        const date = new Date(EPOCH + (adjustedDay - 1) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Theme Logic (Defaulting to existing DailyWee logic, but could be config driven)
    const getTheme = (day: number) => {
        const date = new Date(EPOCH + (day - 1) * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getUTCDay();
        const defaultThemes = [
            { name: "Weekend Ritual", color: "var(--balatro-gold)", icon: "🔥" },    // Sunday
            { name: "Madness Monday", color: "var(--balatro-red)", icon: "🔥" },    // Monday
            { name: "Twosday", color: "var(--balatro-blue)", icon: "2️⃣" },           // Tuesday
            { name: "Wee Wednesday", color: "var(--balatro-green)", icon: "🃏" },        // Wednesday
            { name: "Threshold Thursday", color: "var(--balatro-orange)", icon: "💻" }, // Thursday
            { name: "Foil Friday", color: "var(--balatro-blue)", icon: "📐" },   // Friday
            { name: "Weekend Ritual", color: "var(--balatro-gold)", icon: "🎩" },   // Saturday
        ];
        return defaultThemes[dayOfWeek] || defaultThemes[0];
    };

    const currentTheme = getTheme(viewingDay);

    if (!mounted) return null;

    return (
        <div className="h-[100dvh] w-full relative overflow-hidden bg-transparent" style={{
            '--ritual-primary': config.theme_colors.primary,
            '--ritual-accent': config.theme_colors.accent
        } as React.CSSProperties}>
            <div className="absolute inset-0 z-10 flex flex-col items-center">
                <div className="h-full w-full relative z-10 flex flex-col items-center">

                    <div className="flex-1 flex flex-col justify-center items-center w-full min-h-0 gap-1 py-2">
                        {/* Header uses config name */}
                        <DayHeader
                            dayNumber={viewingDay}
                            displayDate={getDayDisplay(viewingDay)}
                            theme={currentTheme}
                            titleOverride={config.name}
                            taglineOverride={config.tagline}
                        />

                        <DayNavigation
                            onPrev={() => canGoBack && updateDay(v => v - 1)}
                            onNext={() => canGoForward && updateDay(v => v + 1)}
                            canPrev={canGoBack}
                            canNext={canGoForward}
                        >
                            {viewingDay === 0 ? (
                                <WeepochCard
                                    onShowHowTo={() => setShowHowTo(true)}
                                    onEnterRitual={() => updateDay(1)}
                                    description={config.description} // Pass description
                                />
                            ) : (
                                <div className="w-full h-full relative flex flex-col items-center justify-center">
                                    {seed ? (
                                        <SeedCard
                                            seed={seed}
                                            dayNumber={viewingDay}
                                            className="w-full h-full"
                                            onAnalyze={() => setShowHowTo(true)}
                                            onOpenSubmit={() => setShowSubmit(true)}
                                            isLocked={viewingDay > todayNumber}
                                            canSubmit={viewingDay === todayNumber}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[var(--balatro-grey-dark)]">
                                            {error ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-red-400 font-header text-sm uppercase">{error}</p>
                                                    <button onClick={() => window.location.reload()} className="bg-red-900 text-white font-header text-[9px] px-3 py-1 rounded">Retry</button>
                                                </div>
                                            ) : (
                                                <div className="animate-spin text-white/5"><Sprite name={config.assets?.icon || "weejoker"} width={24} /></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </DayNavigation>

                        {/* Banner Ad Rotator - Full width alignment */}
                        <div className="w-full max-w-md px-2 mt-1">
                            <AdRotator
                                onOpenWisdom={() => setViewMode('wisdom')}
                                onOpenLeaderboard={() => setShowLeaderboard(true)}
                                topScore={topScore}
                                isLocked={viewingDay > todayNumber}
                            />
                        </div>

                    </div>
                </div>

                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-150 ease-out bg-black/95 backdrop-blur-none pointer-events-auto"
                    style={{ transform: viewMode === 'wisdom' ? 'translateY(0)' : 'translateY(120vh)' }}
                >
                    <div className="scale-110 w-full max-w-2xl px-6 flex flex-col items-center">
                        <WeeWisdom onBack={() => setViewMode('main')} />
                    </div>
                </div>

                {showHowTo && (
                    <HowToPlay
                        onClose={() => setShowHowTo(false)}
                        themeName={currentTheme.name}
                        seedId={seed?.seed || '--------'}
                        onSubmit={() => { setShowHowTo(false); setShowSubmit(true); }}
                        instructions={config.instructions}
                    />
                )}
                {showLeaderboard && <LeaderboardModal dayNumber={viewingDay} onClose={() => setShowLeaderboard(false)} />}
                {showSubmit && seed && (
                    <SubmitScoreModal
                        seed={seed.seed}
                        dayNumber={viewingDay}
                        onClose={() => setShowSubmit(false)}
                        onSuccess={() => loadDayData(viewingDay)}
                        ritualId={config.id} // Pass ritual ID for submission
                    />
                )}
            </div>
        </div>
    );
}

// Helper to map raw JSON to SeedData type
function mapRawToSeed(data: any): SeedData {
    return {
        seed: data.id,
        score: data.s,
        twos: typeof data.w === 'number' ? data.w : (parseInt(data.w as any) || 0),
        WeeJoker_Ante1: data.wj1,
        WeeJoker_Ante2: data.wj2,
        HanginChad_Ante1: data.hc1,
        HanginChad_Ante2: data.hc2,
        Hack_Ante1: data.hk1,
        Hack_Ante2: data.hk2,
        blueprint_early: data.bp,
        brainstorm_early: data.bs,
        Showman_Ante1: data.sh,
        red_Seal_Two: data.rs,
        themeName: data.t,
        themeJoker: data.j,
        themeCardAnte1: data.t1,
        themeCardAnte2: data.t2
    };
}
