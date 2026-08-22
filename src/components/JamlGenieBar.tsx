"use client";

import React, { useState } from "react";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboTextInput } from "../ui/JimboTextInput.js";
import { JimboRow } from "../ui/JimboLayout.js";
import { JimboBox } from "../ui/JimboBox.js";
import { FiZap } from "react-icons/fi";

export interface JamlGenieBarProps {
  onGenerate: (jaml: string) => void | Promise<void>;
  generateHandler?: (prompt: string) => Promise<string>;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function JamlGenieBar({
  onGenerate,
  generateHandler,
  placeholder = "Describe what you want (e.g. 'Erratic deck with Wee Joker and Hack in Ante 1-2')...",
  className = "",
  style,
}: JamlGenieBarProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      if (generateHandler) {
        const jaml = await generateHandler(prompt.trim());
        if (jaml) {
          onGenerate(jaml);
          setPrompt("");
        }
      } else {
        // Fallback demo / template synthesis if no remote API handler provided
        const q = prompt.trim().toLowerCase();
        let syntheticJaml = "deck: Erratic\nstake: White\n";
        if (q.includes("wee")) {
          syntheticJaml += "must:\n  - joker: WeeJoker\n    antes: [1, 2]\nshould:\n  - joker: Hack\n    score: 50\n";
        } else if (q.includes("cloud") || q.includes("9")) {
          syntheticJaml += "must:\n  - joker: Cloud9\n    antes: [1, 2]\nshould:\n  - joker: ToTheMoon\n    score: 45\n";
        } else if (q.includes("blueprint")) {
          syntheticJaml += "must:\n  - joker: Blueprint\n    antes: [1, 2]\nshould:\n  - joker: Brainstorm\n    score: 50\n";
        } else {
          syntheticJaml += `must:\n  - joker: WeeJoker\n    antes: [1, 2]\n# Prompt: ${prompt.trim()}\n`;
        }
        onGenerate(syntheticJaml);
        setPrompt("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed — try rephrasing!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <JimboInnerPanel
      className={["j-genie-bar", className].filter(Boolean).join(" ")}
      style={style}
    >
      <JimboBox className="j-genie-bar__body">
        <JimboRow gap="xs" align="center" className="j-genie-bar__header">
          <FiZap className="j-genie-bar__icon" />
          <JimboText size="xs" tone="gold">
            JAML Genie
          </JimboText>
          <JimboText size="micro" tone="grey">
            — natural language to JAML filter
          </JimboText>
        </JimboRow>

        <JimboRow gap="sm" align="center" className="j-genie-bar__input-row">
          <JimboBox className="j-genie-bar__input-wrap">
            <JimboTextInput
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleGenerate();
                }
              }}
              placeholder={placeholder}
              className="j-genie-bar__input"
            />
          </JimboBox>

          <JimboButton
            size="xs"
            tone="green"
            disabled={!prompt.trim() || loading}
            onClick={() => void handleGenerate()}
          >
            {loading ? "Conjuring…" : "Generate"}
          </JimboButton>
        </JimboRow>

        {error && (
          <JimboText size="micro" tone="red" className="j-genie-bar__error">
            {error}
          </JimboText>
        )}
      </JimboBox>
    </JimboInnerPanel>
  );
}
