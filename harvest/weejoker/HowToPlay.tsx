
import { X, ExternalLink, Gamepad2, Copy, Trophy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface HowToPlayProps {
    onClose: () => void;
    onSubmit?: () => void;
    themeName?: string;
    seedId?: string;
}

export function HowToPlay({ onClose, onSubmit, themeName = "Daily Ritual", seedId = "--------" }: HowToPlayProps) {
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const totalSteps = 4;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onClose();
    };

    const prevStep = () => {
        onClose(); // Lower button ALWAYS "Back" and always closes
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />

            <div className="balatro-panel w-full max-w-sm p-8 flex flex-col gap-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="text-center relative z-10 pt-4">
                    <h2 className="text-3xl font-header text-white tracking-widest text-shadow-md flex items-center justify-center gap-2 uppercase">
                        {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : step === 3 ? 'Step 3' : 'Final Step'}
                    </h2>
                    <div className="flex gap-1 justify-center mt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center text-center gap-3 bg-[#111] border-2 border-black rounded-xl p-6 mt-2">
                    {step === 1 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">Get Balatro</h3>
                            <p className="text-zinc-200 font-pixel text-lg leading-none">
                                You need the game to participate.<br />Available on PC, Console, and Mobile.
                            </p>
                            <div className="flex flex-col gap-2 w-full px-2">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="btn btn--secondary !text-xs">
                                    <ExternalLink size={14} className="mr-2" /> Buy on Store
                                </a>
                                <span className="btn btn--secondary !bg-[#1a4731] !text-[10px] cursor-default opacity-80">
                                    Free on GamePass / Arcade
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">The Ritual</h3>
                            <p className="text-zinc-200 font-pixel text-lg leading-tight">
                                Copy the Daily Seed and enter it in the Balatro <span className="text-[var(--balatro-gold)] font-header">New Run</span> menu.
                            </p>
                            <button
                                onClick={async () => {
                                    await navigator.clipboard.writeText(seedId);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 3140);
                                }}
                                className={`w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-between px-4 transition-all duration-200 group ${copied ? 'bg-[var(--balatro-green)] border-[var(--balatro-green)]' : 'bg-[#0a0a0a] border-[var(--balatro-gold)] hover:bg-[#111]'}`}
                            >
                                <span className="font-header text-white tracking-widest text-lg">
                                    {copied ? "COPIED!" : seedId}
                                </span>
                                <div
                                    className={`p-1.5 rounded shadow-sm transition-transform ${copied ? 'bg-white/20' : 'btn btn--icon btn--primary btn--sm group-active:translate-y-0.5'}`}
                                >
                                    {copied ? <CheckCircle2 size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">The Setup</h3>
                            <div className="bg-black/20 p-4 rounded-xl border-2 border-black/30 flex flex-col gap-3 text-left">
                                <p className="font-pixel text-lg text-white leading-tight flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--balatro-gold)] flex items-center justify-center text-[10px] font-header shrink-0 text-black">1</span>
                                    <span>Start a <span className="text-[var(--balatro-gold)] font-header">New Run</span></span>
                                </p>
                                <p className="font-pixel text-lg text-white leading-tight flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--balatro-gold)] flex items-center justify-center text-[10px] font-header shrink-0 text-black">2</span>
                                    <span>Select <span className="text-[var(--balatro-red)] font-header">Erratic Deck</span></span>
                                </p>
                                <p className="font-pixel text-lg text-white leading-tight flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--balatro-gold)] flex items-center justify-center text-[10px] font-header shrink-0 text-black">3</span>
                                    <span>Select {themeName.includes("Madness") ? <span className="text-[var(--balatro-gold)] font-header">Gold Stake</span> : "White Stake"}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">The Goal</h3>
                            <div className="bg-black/20 p-3 rounded-xl border-2 border-[var(--balatro-gold)] border-dashed flex flex-col gap-2 text-left">
                                <p className="font-pixel text-md text-white leading-tight">
                                    • Find <span className="text-[var(--balatro-gold)] font-header">Wee Joker</span> and upgrade by playing Rank 2 cards!
                                </p>
                                <p className="font-pixel text-md text-white leading-tight">
                                    • Win the <span className="text-[var(--balatro-red)] font-header">Ante 8</span> Boss Blind.
                                </p>
                                <p className="font-pixel text-md text-white leading-tight">
                                    • In Ante 9 shop, select your <span className="text-[var(--balatro-gold)] font-header">Wee Joker</span>.
                                </p>
                                <p className="font-pixel text-[var(--balatro-gold)] font-header text-sm tracking-widest uppercase text-center mt-1">
                                    <span className="text-[var(--balatro-gold)] font-header">+Chips</span> is your score to submit!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={nextStep}
                        className="btn btn--primary w-full text-xl mt-2"
                    >
                        {step === 1 ? 'Got it' : step === 2 ? 'Next' : "Let's Play!"}
                    </button>

                    {/* Back Button */}
                    <button
                        onClick={prevStep}
                        className="btn btn--secondary w-full mt-1"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
