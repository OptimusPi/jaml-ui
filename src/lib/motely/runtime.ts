import bootsharp from "motely-wasm";
import { Program as Motely } from "motely-wasm/motely/wasm";
import type { MotelyScoredSeedResult } from "motely-wasm/motely";
import { IFileMounter } from "motely-wasm/bootsharp/file-system";

export type MotelyRuntimeStatus = "idle" | "booting" | "ready" | "error";

// Jimmolate probe dispatcher.
//
// Bootsharp snapshots [Import] bindings at boot() — assigning
// `Motely.jimmolatePredicate` AFTER boot is a silent no-op, so we bind a STABLE
// dispatcher here at module load (always before any ensureMotelyReady()/boot()
// call) and swap the inner predicate per search via setJimmolateProbe().
// `Motely.jimmolateEnabled` is a plain settable, fine to flip after boot.
//
// motely-wasm 21.1 reshaped the probe: it now receives the scored result
// ({seed, score, tallies}) instead of a search context.
export type JimmolateProbe = (result: MotelyScoredSeedResult) => boolean;
let currentProbe: JimmolateProbe = () => true;
Motely.jimmolatePredicate = (result: MotelyScoredSeedResult) => currentProbe(result);

/** Swap the active Jimmolate predicate. Safe before or after boot. */
export function setJimmolateProbe(pred: JimmolateProbe): void {
    currentProbe = pred;
}

/** Reset the probe to pass-through (the engine's default: every survivor matches). */
export function clearJimmolateProbe(): void {
    currentProbe = () => true;
}

// Must match the path the host serves motely-wasm's bin/ at.
// Used by main-thread hooks, workers, and Storybook staticDir alike.
// The Storybook staticDir in .storybook/main.ts serves it here.
// Next.js consumers must serve it at this path too (e.g. via a catch-all route).
// A bare "/bin" would 404 in every deployment context.
export const MOTELY_BIN_PATH = "/motely-wasm/bin";

// File System extension (optional peer `@rewaffle/bootsharp-file-system`).
//
// fs.init() binds the IFileMounter [Import], which — like the Jimmolate probe
// above and EVERY Bootsharp [Import] — must be assigned BEFORE boot()
// (Bootsharp docs: extensions/file-system). The package is an OPTIONAL peer, so
// we dynamically import it and swallow its absence: consumers without it simply
// get no library mount (useJamlLibrary reports status "unsupported").
//
// This MUST live in the one centralized boot path, not in a component effect.
// ~8 callers (useSearch, the workers, useAnalyzer, Jamlyzer, …) each trigger
// boot via ensureMotelyReady(); whichever fires first wins. If fs.init() sat in
// useJamlLibrary's useEffect it would lose that race and the mounter would never
// be bound pre-boot — which is exactly why the library mount silently failed.
let fileSystemReady = false;
let fileSystemError: unknown = null;

/** True once the optional File System extension was bound before boot. */
export function isFileSystemReady(): boolean {
    return fileSystemReady;
}

/** The error from a failed or absent File System init, if any. */
export function getFileSystemError(): unknown {
    return fileSystemError;
}

// Single boot promise: fs.init() (pre-boot) → boot(), run exactly once and
// awaited by every caller, so the ordering holds no matter who boots first.
let bootPromise: Promise<void> | null = null;

export async function ensureMotelyReady(): Promise<void> {
    if (bootPromise) return bootPromise;
    if (bootsharp.getStatus() !== bootsharp.BootStatus.Standby) return;
    bootPromise = (async () => {
        // Pre-boot: bind the optional File System mounter if it's installed.
        try {
            // @vite-ignore — optional peer; may be absent on disk. Keep it a
            // runtime import() so Vite's dev import-analysis (Storybook, demo)
            // doesn't try to resolve it at transform time and hard-fail. When
            // missing it throws here and is swallowed → status "unsupported".
            // (The library build externalizes it via PEER_EXTERNALS regardless.)
            const fs = await import(/* @vite-ignore */ "@rewaffle/bootsharp-file-system");
            fs.init(IFileMounter);
            fileSystemReady = true;
        } catch (error) {
            fileSystemError = error;
        }
        // motely-wasm is an EMBEDDED build (the runtime is inlined into the JS as
        // base64 — see dist/generated/resources.g.mjs), so boot() takes no args and
        // needs no served binaries. The old boot("/motely-wasm/bin") was leftover
        // sideloaded config and 404'd in every context.
        await bootsharp.boot();
    })();
    return bootPromise;
}
