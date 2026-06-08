import bootsharp from "motely-wasm";
import { Program as Motely } from "motely-wasm/motely/wasm";
import type { MotelyScoredSeedResult } from "motely-wasm/motely";
import { IFileMounter } from "motely-wasm/bootsharp/file-system";

export type MotelyRuntimeStatus = "idle" | "booting" | "ready" | "error";

// Jimmolate predicate dispatcher.
//
// Bootsharp snapshots [Import] bindings at boot() — assigning `Motely.jimmolatePredicate`
// AFTER boot is a silent no-op, so the C# side calls an unbound import and the
// predicate never runs. The correct order (pre-boot bind, post-boot enable) is the
// one exercised by Motely.Wasm/tests/jimmolate.test.mjs, and the rule is in the
// Bootsharp docs: imported members "have to be assigned before booting the runtime."
//
// So we bind a STABLE dispatcher here at module load (this runs on import, always
// before any ensureMotelyReady()/boot() call) and swap the inner predicate per
// search via setJimmolateProbe(). `Motely.jimmolateEnabled = true` is a C# [Export]
// prop, so setting it after boot is fine — only this [Import] must be pre-bound.
//
// motely-wasm v20 renamed `jimmolateProbe` → `jimmolatePredicate` and changed its
// argument: it now receives a `MotelyScoredSeedResult` ({ seed, score, tallies }),
// NOT a search context — deck/stake are no longer carried across the boundary. The
// public probe contract keeps them optional, so callers that read them now get
// `undefined`; only the seed survives the v20 engine semantics.
type JimmolateProbe = (seed: string, deck?: number, stake?: number) => boolean;
let currentProbe: JimmolateProbe = () => true;
Motely.jimmolatePredicate = (result: MotelyScoredSeedResult) =>
    currentProbe(result.seed);

/** Swap the active Jimmolate predicate. Safe before or after boot. */
export function setJimmolateProbe(pred: JimmolateProbe): void {
    currentProbe = pred;
}

/** Reset the probe to pass-through (the engine's default: every survivor matches). */
export function clearJimmolateProbe(): void {
    currentProbe = () => true;
}

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
        // motely-wasm v20.0.2 is an EMBEDDED build: the WASM is base64-inlined in
        // dist/generated/resources.g.mjs (~12.6 MB), so boot() takes no args and
        // needs no served binary — nothing to 404, nothing to sideload. (Was a
        // sideloaded build through 20.0.0, which required boot(root) + the host
        // serving dist/bin/motely-wasm.wasm; that whole class of failure is gone.)
        await bootsharp.boot();
    })();
    return bootPromise;
}
