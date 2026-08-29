"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayNavigationProps {
    onPrev: () => void;
    onNext: () => void;
    canPrev: boolean;
    canNext: boolean;
    children: React.ReactNode;
}

export function DayNavigation({ onPrev, onNext, canPrev, canNext, children }: DayNavigationProps) {
    return (
        <div className="flex flex-row items-stretch justify-center gap-2 w-full max-w-[28rem] mx-auto p-0 relative z-30 h-[480px] shrink-0">
            {/* Left Nav Button */}
            <button
                onClick={onPrev}
                disabled={!canPrev}
                className="btn btn--secondary btn--icon btn--lg"
                aria-label="Previous Day"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Central Stage - FLEXIBLE HEIGHT */}
            <div className="relative flex-1 z-20 flex flex-col min-w-0 shadow-[0_4px_0_#000]">
                {children}
            </div>

            {/* Right Nav Button */}
            <button
                onClick={onNext}
                disabled={!canNext}
                className="btn btn--secondary btn--icon btn--lg"
                aria-label="Next Day"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
}
