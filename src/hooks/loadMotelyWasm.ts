// Module-level cache so multiple hooks share a single boot per URL.
/* eslint-disable @typescript-eslint/no-explicit-any */

interface MotelyModules {
  MotelyWasm: any;
  MotelyWasmEvents: any;
  Motely: any;
}

const cache = new Map<string, Promise<MotelyModules>>();

export function loadMotelyWasm(url: string): Promise<MotelyModules> {
  if (!cache.has(url)) {
    cache.set(url, (async () => {
      const mod: any = await import(/* @vite-ignore */ url);
      await mod.default.boot();
      return { MotelyWasm: mod.MotelyWasm, MotelyWasmEvents: mod.MotelyWasmEvents, Motely: mod.Motely };
    })().catch((err) => {
      cache.delete(url);
      throw err;
    }));
  }
  return cache.get(url)!;
}
