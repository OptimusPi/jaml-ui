"use client";

import { useEffect, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import { JimboBox } from "./JimboBox.js";
import { JimboOuterTab, type JimboOuterTabTone } from "./JimboOuterTab.js";
import {
  defaultPyramidDock,
  dockMapGroup,
  dockRemove,
  dockSplitAt,
  loadDock,
  saveDock,
  type DockEdge,
  type DockGroup,
  type DockNode,
} from "./dockTree.js";

export {
  defaultPyramidDock,
  dockActivate,
  type DockNode,
} from "./dockTree.js";

export interface JimboDockPane {
  label: string;
  tone: JimboOuterTabTone;
  content: ReactNode;
}

export interface JimboDockProps {
  panes: Record<string, JimboDockPane>;
  /** Filter / search / results / jamlyze keys for the pyramid default. */
  pyramid?: { filter: string; search: string; results: string; jamlyze: string };
  storageKey?: string;
  className?: string;
}

export function JimboDock({
  panes,
  pyramid,
  storageKey,
  className,
}: JimboDockProps) {
  const keys = Object.keys(panes);
  const fallback =
    pyramid && keys.includes(pyramid.filter)
      ? defaultPyramidDock(pyramid)
      : {
          type: "group" as const,
          id: "g-all",
          panes: keys,
          active: keys[0] ?? null,
        };

  const [tree, setTree] = useState<DockNode>(() =>
    storageKey && typeof localStorage !== "undefined"
      ? loadDock(storageKey, fallback, keys)
      : fallback,
  );
  const [dropZone, setDropZone] = useState<{ groupId: string; zone: DockEdge } | null>(null);
  const [fsPane, setFsPane] = useState<string | null>(null);

  useEffect(() => {
    if (storageKey) saveDock(storageKey, tree);
  }, [storageKey, tree]);

  const zoneFromEvent = (e: DragEvent): DockEdge => {
    const t = e.target as HTMLElement;
    if (t.closest(".j-dock-tabs")) return "center";
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (x < 0.25) return "left";
    if (x > 0.75) return "right";
    if (y < 0.25) return "top";
    if (y > 0.75) return "bottom";
    return "center";
  };

  const dropPane = (key: string, group: DockGroup, zone: DockEdge) => {
    if (!panes[key]) return;
    if (group.panes.length === 1 && group.panes[0] === key) return;
    setTree((prev) => {
      const removed = dockRemove(prev, key);
      if (zone === "center") {
        return dockMapGroup(removed, group.id, (g) => ({
          ...g,
          panes: [...g.panes, key],
          active: key,
        }));
      }
      return dockSplitAt(removed, group.id, key, zone);
    });
  };

  const renderTab = (key: string, active: boolean) => {
    const meta = panes[key];
    if (!meta) return null;
    return (
      <JimboOuterTab
        key={key}
        label={meta.label}
        tone={meta.tone}
        active={active}
        fullscreen={fsPane === key}
        onToggleFullscreen={() => setFsPane((v) => (v === key ? null : key))}
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", key)}
      />
    );
  };

  const renderGroup = (group: DockGroup) => {
    const drop = dropZone && dropZone.groupId === group.id ? dropZone.zone : null;
    const dropClass =
      drop && drop !== "center" ? ` j-dock-pane--drop-${drop}` : "";
    return (
      <JimboBox
        key={group.id}
        className={`j-dock-pane${dropClass}`}
        onDragOver={(e) => {
          e.preventDefault();
          const zone = zoneFromEvent(e);
          setDropZone((v) =>
            v && v.groupId === group.id && v.zone === zone ? v : { groupId: group.id, zone },
          );
        }}
        onDragLeave={() =>
          setDropZone((v) => (v && v.groupId === group.id ? null : v))
        }
        onDrop={(e) => {
          e.preventDefault();
          const key = e.dataTransfer.getData("text/plain");
          const zone = zoneFromEvent(e);
          setDropZone(null);
          dropPane(key, group, zone);
        }}
      >
        <JimboBox
          className={`j-dock-tabs${drop === "center" ? " j-dock-tabs--drop" : ""}`}
        >
          {group.panes.map((key) => (
            <JimboBox
              key={key}
              onClick={() =>
                setTree((t) => dockMapGroup(t, group.id, (g) => ({ ...g, active: key })))
              }
            >
              {renderTab(key, group.active === key)}
            </JimboBox>
          ))}
        </JimboBox>
        <JimboBox className="j-dock-body">
          {group.active && panes[group.active] ? panes[group.active].content : null}
        </JimboBox>
      </JimboBox>
    );
  };

  const renderNode = (node: DockNode) => {
    if (node.type === "group") return renderGroup(node);
    const [a, b] = node.children;
    return (
      <JimboBox
        key={node.id}
        className={`j-dock-split j-dock-split--${node.dir}`}
        style={
          {
            "--j-dock-a": `${node.ratio}fr`,
            "--j-dock-b": `${1 - node.ratio}fr`,
          } as CSSProperties
        }
      >
        {renderNode(a)}
        <JimboBox className={`j-dock-gutter j-dock-gutter--${node.dir}`} />
        {renderNode(b)}
      </JimboBox>
    );
  };

  if (fsPane && panes[fsPane]) {
    return (
      <JimboBox className={`j-dock j-dock--fs ${className ?? ""}`.trim()}>
        <JimboBox className="j-dock-tabs">
          {renderTab(fsPane, true)}
        </JimboBox>
        <JimboBox className="j-dock-body">{panes[fsPane].content}</JimboBox>
      </JimboBox>
    );
  }

  return (
    <JimboBox className={`j-dock ${className ?? ""}`.trim()}>{renderNode(tree)}</JimboBox>
  );
}
