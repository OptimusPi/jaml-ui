/**
 * Dock tree — the layout is user data (UX.md Law 4). A tree of split nodes
 * (row/column + ratio) whose leaves are tab groups (panes + active). Tabs
 * move between groups; dropping a tab on a group's EDGE splits that group in
 * two along that axis; a group emptied by a move collapses its parent split.
 * Persisted to localStorage; corrupted/stale trees fall back to default.
 */

const PANE_KEYS = ["filter", "search", "results", "jamlyze"];

let idCounter = 0;
function newId(prefix) {
  return `${prefix}${++idCounter}-${Date.now().toString(36)}`;
}

export function defaultDock() {
  // Pyramid, not three equal columns: the entry controls (filter + search)
  // get a shallow band across the top; the payoff row below is Results.
  // Jamlyze rides that group as a sibling tab — dropping it from the tree
  // entirely (the v3 default) made dockActivate("jamlyze") a silent no-op,
  // which killed the &xray= deep link, the "tap opens Jamlyze" triage flow,
  // and the clipboard-seed analyze chip (UX.md shipped features).
  return {
    type: "split",
    id: "s-root",
    dir: "column",
    ratio: 0.34,
    children: [
      {
        type: "split",
        id: "s-entry",
        dir: "row",
        ratio: 0.55,
        children: [
          { type: "group", id: "g-filter", panes: ["filter"], active: "filter" },
          { type: "group", id: "g-search", panes: ["search"], active: "search" },
        ],
      },
      { type: "group", id: "g-results", panes: ["results", "jamlyze"], active: "results" },
    ],
  };
}

/** Remove a pane from every group; collapse splits left with a single child. */
export function dockRemove(node, key) {
  if (node.type === "group") {
    if (!node.panes.includes(key)) return node;
    const panes = node.panes.filter((k) => k !== key);
    const active = node.active === key ? panes[0] ?? null : node.active;
    return { ...node, panes, active };
  }
  const children = node.children
    .map((c) => dockRemove(c, key))
    .filter((c) => !(c.type === "group" && c.panes.length === 0));
  if (children.length === 1) return children[0];
  return { ...node, children };
}

export function dockMapGroup(node, id, fn) {
  if (node.type === "group") return node.id === id ? fn(node) : node;
  return { ...node, children: node.children.map((c) => dockMapGroup(c, id, fn)) };
}

export function dockMapSplit(node, id, fn) {
  if (node.type !== "split") return node;
  const next = node.id === id ? fn(node) : node;
  return { ...next, children: next.children.map((c) => dockMapSplit(c, id, fn)) };
}

/** Replace group `id` with a split: the old group plus a new one holding `key`. */
export function dockSplitAt(node, id, key, side) {
  if (node.type === "group") {
    if (node.id !== id) return node;
    const newGroup = { type: "group", id: newId("g"), panes: [key], active: key };
    const dir = side === "left" || side === "right" ? "row" : "column";
    const children = side === "left" || side === "top" ? [newGroup, node] : [node, newGroup];
    return { type: "split", id: newId("s"), dir, ratio: 0.5, children };
  }
  return { ...node, children: node.children.map((c) => dockSplitAt(c, id, key, side)) };
}

export function dockGroups(node, acc = []) {
  if (node.type === "group") {
    acc.push(node);
    return acc;
  }
  node.children.forEach((c) => dockGroups(c, acc));
  return acc;
}

export function dockFindGroup(node, id) {
  return dockGroups(node).find((g) => g.id === id) || null;
}

/** Bring pane `key` to the front of whichever group holds it. No-op if absent. */
export function dockActivate(node, key) {
  if (node.type === "group") {
    return node.panes.includes(key) ? { ...node, active: key } : node;
  }
  return { ...node, children: node.children.map((c) => dockActivate(c, key)) };
}

function dockIsValid(node) {
  if (!node || typeof node !== "object") return false;
  const groups = dockGroups(node);
  if (!groups.length) return false;
  const panes = groups.flatMap((g) => g.panes);
  return panes.length > 0 && panes.every((p) => PANE_KEYS.includes(p)) && groups.every((g) => g.panes.length > 0);
}

// v2: the flat three-column layouts persisted under v1 are exactly the
// information-hierarchy problem the pyramid default fixes, so the storage
// key bumps instead of migrating them. Layout is still user data (Law 4) —
// the new default is just the starting point; re-dragging persists as ever.
// v3: layouts persisted under v2 were arranged inside the 375px self-frame —
// single tab-groups that collapse every pane into tabs. With the frame gone
// they'd waste the whole window behind tabs, so the key bumps again and the
// pyramid greets the wide world. Same Law 4 deal: re-drag, it persists.
// v4 (2026-08-14): v3's default dropped the Jamlyze pane from the tree, so
// every layout persisted under v3 has no Jamlyze anywhere and no way to get
// it back short of localStorage surgery. Bump so the restored default (with
// Jamlyze tabbed next to Results) greets everyone once; re-drag as ever.
const DOCK_STORAGE_KEY = "sf-dock-v4";

export function loadDock() {
  try {
    const raw = localStorage.getItem(DOCK_STORAGE_KEY);
    if (!raw) return defaultDock();
    const tree = JSON.parse(raw);
    return dockIsValid(tree) ? tree : defaultDock();
  } catch {
    return defaultDock();
  }
}

export function saveDock(tree) {
  try {
    localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(tree));
  } catch {
    /* private mode etc. — layout just won't persist */
  }
}
