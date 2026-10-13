"use client";

import { JimboButton } from "./JimboButton.js";

export interface JimboTabDef {
  id: string;
  label: string;
}

export interface JimboTabsProps {
  tabs: JimboTabDef[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

/**
 * Shop-style tab row. Each tab is a red JimboButton; the bouncing arrow above
 * the selected tab is the only selection marker.
 */
export function JimboTabs({ tabs, activeTab, onTabChange }: JimboTabsProps) {
  return (
    <div className="j-tabs">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <div key={tab.id} className="j-tab">
            <div className="j-tab__indicator" data-active={active}>
              <svg width="10" height="8" viewBox="0 0 10 8">
                <path d="M5 8 L0 0 L10 0 Z" />
              </svg>
            </div>
            <JimboButton
              size="sm"
              tone="red"
              label={tab.label}
              onClick={() => onTabChange(tab.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
