/** Dock tree — layout is user data. Harvested from seedfinder.app SeedLab dock.js. */

export type DockDir = "row" | "column";
export type DockEdge = "left" | "right" | "top" | "bottom" | "center";

export interface DockGroup {
  type: "group";
  id: string;
  panes: string[];
  active: string | null;
}

export interface DockSplit {
  type: "split";
  id: string;
  dir: DockDir;
  ratio: number;
  children: [DockNode, DockNode];
}

export type DockNode = DockGroup | DockSplit;

let idCounter = 0;
function newId(prefix: string) {
  return `${prefix}${++idCounter}-${Date.now().toString(36)}`;
}

export function defaultPyramidDock(keys: {
  filter: string;
  search: string;
  results: string;
  jamlyze: string;
}): DockNode {
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
          { type: "group", id: "g-filter", panes: [keys.filter], active: keys.filter },
          { type: "group", id: "g-search", panes: [keys.search], active: keys.search },
        ],
      },
      {
        type: "group",
        id: "g-results",
        panes: [keys.results, keys.jamlyze],
        active: keys.results,
      },
    ],
  };
}

export function dockRemove(node: DockNode, key: string): DockNode {
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
  return { ...node, children: children as [DockNode, DockNode] };
}

export function dockMapGroup(node: DockNode, id: string, fn: (g: DockGroup) => DockGroup): DockNode {
  if (node.type === "group") return node.id === id ? fn(node) : node;
  return { ...node, children: node.children.map((c) => dockMapGroup(c, id, fn)) as [DockNode, DockNode] };
}

export function dockSplitAt(node: DockNode, id: string, key: string, side: DockEdge): DockNode {
  if (side === "center") return node;
  if (node.type === "group") {
    if (node.id !== id) return node;
    const newGroup: DockGroup = { type: "group", id: newId("g"), panes: [key], active: key };
    const dir: DockDir = side === "left" || side === "right" ? "row" : "column";
    const children: [DockNode, DockNode] =
      side === "left" || side === "top" ? [newGroup, node] : [node, newGroup];
    return { type: "split", id: newId("s"), dir, ratio: 0.5, children };
  }
  return { ...node, children: node.children.map((c) => dockSplitAt(c, id, key, side)) as [DockNode, DockNode] };
}

export function dockGroups(node: DockNode, acc: DockGroup[] = []): DockGroup[] {
  if (node.type === "group") {
    acc.push(node);
    return acc;
  }
  node.children.forEach((c) => dockGroups(c, acc));
  return acc;
}

export function dockActivate(node: DockNode, key: string): DockNode {
  if (node.type === "group") {
    return node.panes.includes(key) ? { ...node, active: key } : node;
  }
  return { ...node, children: node.children.map((c) => dockActivate(c, key)) as [DockNode, DockNode] };
}

export function dockIsValid(node: DockNode, paneKeys: string[]): boolean {
  const groups = dockGroups(node);
  if (!groups.length) return false;
  const panes = groups.flatMap((g) => g.panes);
  return panes.length > 0 && panes.every((p) => paneKeys.includes(p)) && groups.every((g) => g.panes.length > 0);
}

export function loadDock(storageKey: string, fallback: DockNode, paneKeys: string[]): DockNode {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const tree = JSON.parse(raw) as DockNode;
    return dockIsValid(tree, paneKeys) ? tree : fallback;
  } catch {
    return fallback;
  }
}

export function saveDock(storageKey: string, tree: DockNode) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tree));
  } catch {
    /* private mode */
  }
}
