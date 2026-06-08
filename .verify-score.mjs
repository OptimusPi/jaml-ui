// TEMPORARY verification harness — boots motely-wasm v20 (sideloaded, via bytes)
// and compares the engine's REAL scored result against the `sum(matches[].score)`
// my Jamlyzer port invented. Two-clause filter so `sum` and `max` modes diverge.
// Delete after use.
import bootsharp from "motely-wasm";
import { Program as Motely } from "motely-wasm/motely/wasm";

console.log("booting (embedded, no args)…");
await bootsharp.boot();
console.log("booted. status =", bootsharp.getStatus());

// Two should clauses with different scores + multiple antes, so count-based `max`
// (scores ignored) and weighted `sum` produce different aggregates.
function mk(mode) {
  return `name: verify
deck: Red
stake: White
mode: ${mode}
defaults:
  antes: [1,2,3,4,5,6,7,8]
should:
  - joker: Joker
    score: 1
  - joker: Misprint
    score: 10
`;
}

function sumMatches(snap) {
  return (snap.matches ?? []).reduce((s, m) => s + m.score, 0);
}

for (const mode of ["sum", "max"]) {
  console.log(`\n===== MODE: ${mode} =====`);
  const config = Motely.parseJaml(mk(mode));
  const plan = Motely.createPlan(config);
  console.log("tallyLabels =", plan.tallyLabels, "| columns =", plan.scoreTallyColumnCount);

  const scored = [];
  const onResult = (r) => scored.push(r);
  Motely.onScoredResult.subscribe(onResult);
  const search = Motely.runRandomSearch(config, 20000).start();
  await search.waitForCompletionAsync();
  Motely.onScoredResult.unsubscribe(onResult);

  console.log(`engine returned ${scored.length} scored seeds (searched ${search.totalSeedsSearched})`);
  for (const r of scored.slice(0, 5)) {
    const snap = Motely.jamlyzer(r.seed, config);
    const mine = sumMatches(snap);
    const flag = mine === r.score ? "OK " : "MISMATCH";
    console.log(
      `  ${flag} seed=${r.seed} engineScore=${r.score} sum(matches)=${mine} ` +
      `tallies=[${r.tallies}] matches=${(snap.matches ?? []).length}`
    );
  }
}

await bootsharp.exit?.();
console.log("\ndone.");
