import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { JamlIde } from "../components/JamlIde.js";
import { JimboPanel } from "../ui/JimboPanel.js";
import { JimboInnerPanel } from "../ui/panel.js";
import { JimboButton } from "../ui/JimboButton.js";
import { JimboText } from "../ui/jimboText.js";
import { JimboStack, JimboRow } from "../ui/JimboLayout.js";
import { JimboStatusPill } from "../ui/JimboStatusPill.js";
import { JimboBadge } from "../ui/JimboBadge.js";
import {
  invokeWebMcpTool,
  useRegisteredWebMcpTools,
  useWebMcpSupported,
} from "../webmcp.js";

const SAMPLE_JAML = `name: Perkeo Blueprint Hunt
author: pifreak
description: Chrome WebMCP live filter demo
deck: Ghost
stake: White
must:
  - joker: Blueprint
    antes: [1, 2]
should:
  - legendaryJoker: Perkeo
    score: 10
`;

function WebMcpLiveDemo() {
  const nativeSupported = useWebMcpSupported();
  const tools = useRegisteredWebMcpTools();
  const [jaml, setJaml] = useState(SAMPLE_JAML);
  const [output, setOutput] = useState<string>(
    "Click any quick call below to invoke a registered WebMCP tool against the live IDE.",
  );

  const runTool = async (name: string, input: Record<string, unknown>) => {
    try {
      const res = await invokeWebMcpTool(name, input);
      setOutput(`${name}(${JSON.stringify(input)})\n\n${JSON.stringify(res, null, 2)}`);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <JimboPanel title="WebMCP Browser Bridge" tone="blue">
        <JimboStack gap="md">
          <JimboRow justify="between" align="center" wrap>
            <JimboText size="sm" tone="white">
              Native navigator.modelContext status
            </JimboText>
            <JimboStatusPill
              status={nativeSupported ? "ok" : "idle"}
              label={nativeSupported ? "Chrome WebMCP active" : "Local inspector fallback"}
            />
          </JimboRow>

          <JimboText size="xs" tone="grey">
            Passing webMcp on JamlIde registers live JAML language and editor tools directly on
            navigator.modelContext — zero ui:// iframe host or stdio server required.
          </JimboText>

          <JimboRow gap="sm" wrap>
            <JimboButton
              size="sm"
              tone="blue"
              onClick={() => void runTool("jaml_validate", { text: jaml })}
            >
              Call jaml_validate
            </JimboButton>
            <JimboButton
              size="sm"
              tone="green"
              onClick={() =>
                void runTool("jaml_add_clause", {
                  zone: "should",
                  type: "joker",
                  value: "Brainstorm",
                  antes: [1, 2],
                  score: 5,
                })
              }
            >
              Add Brainstorm
            </JimboButton>
            <JimboButton
              size="sm"
              tone="orange"
              onClick={() => void runTool("jaml_set_ide_mode", { mode: "visual" })}
            >
              Switch to Visual
            </JimboButton>
            <JimboButton
              size="sm"
              tone="purple"
              onClick={() => void runTool("jaml_vocab", { kind: "joker", query: "blue" })}
            >
              Query Vocab
            </JimboButton>
          </JimboRow>

          <JimboInnerPanel>
            <JimboStack gap="sm">
              <JimboText size="xs" tone="gold">
                Registered tools ({tools.length})
              </JimboText>
              <JimboRow gap="xs" wrap>
                {tools.map((t) => (
                  <JimboBadge key={t.name} tone={t.annotations?.readOnlyHint ? "blue" : "orange"}>
                    {t.name}
                  </JimboBadge>
                ))}
              </JimboRow>
            </JimboStack>
          </JimboInnerPanel>

          <JimboInnerPanel>
            <pre className="j-code-snippet" style={{ margin: 0, maxHeight: 180, overflow: "auto" }}>
              {output}
            </pre>
          </JimboInnerPanel>
        </JimboStack>
      </JimboPanel>

      <JamlIde
        title="JAML IDE (WebMCP enabled)"
        subtitle="Tools stay live as you switch tabs or edit."
        jaml={jaml}
        onChange={setJaml}
        defaultMode="visual"
        webMcp
      />
    </div>
  );
}

const meta: Meta = {
  title: "Wire Format/WebMCP",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const LiveBrowserTools: Story = {
  render: () => <WebMcpLiveDemo />,
};
