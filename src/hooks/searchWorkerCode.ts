// Worker code as an inline string — created as a Blob URL at runtime.
// This avoids bundler/import.meta.url issues when shipped as an npm package.
export const SEARCH_WORKER_CODE = `
let MotelyWasm = null;
let MotelyWasmEvents = null;
let activeSearch = null;

self.addEventListener('message', async function(e) {
  const msg = e.data;

  if (msg.type === 'init') {
    try {
      const mod = await import(msg.url);
      await mod.default.boot();
      MotelyWasm = mod.MotelyWasm;
      MotelyWasmEvents = mod.MotelyWasmEvents;
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) });
    }
    return;
  }

  if (msg.type === 'start') {
    if (!MotelyWasm) { self.postMessage({ type: 'error', message: 'Not initialized' }); return; }
    const validation = MotelyWasm.validateJaml(msg.jaml);
    if (validation !== 'valid') { self.postMessage({ type: 'error', message: validation }); return; }

    let rId, pId, cId;
    function cleanup() {
      MotelyWasmEvents.onResult.unsubscribeById(rId);
      MotelyWasmEvents.onProgress.unsubscribeById(pId);
      MotelyWasmEvents.onComplete.unsubscribeById(cId);
      activeSearch = null;
    }

    rId = MotelyWasmEvents.onResult.subscribe(function(seed, score) {
      self.postMessage({ type: 'result', seed, score });
    });
    pId = MotelyWasmEvents.onProgress.subscribe(function(searched, matching) {
      self.postMessage({ type: 'progress', searched: searched.toString(), matching: matching.toString() });
    });
    cId = MotelyWasmEvents.onComplete.subscribe(function(status, searched, matched) {
      cleanup();
      self.postMessage({ type: 'complete', status, searched: searched.toString(), matched: matched.toString() });
    });

    try {
      activeSearch = MotelyWasm.startRandomSearch(msg.jaml, msg.count);
    } catch (err) {
      cleanup();
      self.postMessage({ type: 'error', message: String(err) });
    }
    return;
  }

  if (msg.type === 'stop') {
    if (activeSearch) { activeSearch.cancel(); activeSearch = null; }
    self.postMessage({ type: 'cancelled' });
  }
});
`;
