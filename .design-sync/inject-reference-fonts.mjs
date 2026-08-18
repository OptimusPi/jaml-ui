// Oracle parity: give the sb-reference the same JetBrains Mono the design
// bundle ships (cfg.extraFonts). Storybook's build knows nothing about the
// vendored face, so a bare rebuild renders --j-font-code in system monospace
// while the preview panel renders JetBrains — every font comparison then
// "fails" spuriously. Run this after EVERY sb-reference rebuild:
//
//   node .design-sync/inject-reference-fonts.mjs
//
// Idempotent: skips if the marker is already present.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(here, "fonts");
const refDir = join(here, "sb-reference");
const iframePath = join(refDir, "iframe.html");
const MARKER = "<!-- ds-parity: JetBrains Mono (OFL - see OFL.txt beside this file). jaml-ui -->";

const outFonts = join(refDir, "ds-fonts");
mkdirSync(outFonts, { recursive: true });
for (const f of readdirSync(fontsDir)) {
  if (f.endsWith(".woff2") || f === "OFL.txt") copyFileSync(join(fontsDir, f), join(outFonts, f));
}

let html = readFileSync(iframePath, "utf8");
if (html.includes(MARKER)) {
  console.log("inject-reference-fonts: already injected, nothing to do");
} else {
  const css = readFileSync(join(fontsDir, "jetbrains-mono.css"), "utf8")
    .replace(/url\("\.\//g, 'url("./ds-fonts/');
  const block = `${MARKER}\n<style>\n${css}</style>\n`;
  html = html.replace("</head>", block + "</head>");
  writeFileSync(iframePath, html);
  console.log("inject-reference-fonts: injected @font-face into iframe.html + copied ds-fonts/");
}
