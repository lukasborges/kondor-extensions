const LINE_COLOR = "color-mix(in srgb, CanvasText 20%, transparent)";
const STYLE_RULES = `
.kondor-json-toolbar {
  position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; gap: 6px;
  align-items: center; padding: 6px 8px; background: Canvas; color: CanvasText;
  border-bottom: 1px solid ${LINE_COLOR}; font: 13px system-ui, sans-serif;
}
.kondor-json-tools { display: contents; }
.kondor-json-toolbar[data-mode="raw"] > .kondor-json-tools { display: none; }
.kondor-json-switch { display: flex; }
.kondor-json-button {
  font: inherit; padding: 3px 10px; cursor: pointer; background: ButtonFace;
  color: ButtonText; border: 1px solid ${LINE_COLOR}; border-radius: 4px;
}
.kondor-json-button:disabled { opacity: 0.5; cursor: default; }
.kondor-json-button[aria-pressed="true"] {
  background: Highlight; color: HighlightText; border-color: Highlight;
}
.kondor-json-switch > .kondor-json-button:first-child { border-radius: 4px 0 0 4px; }
.kondor-json-switch > .kondor-json-button:last-child {
  border-radius: 0 4px 4px 0; margin-inline-start: -1px;
}
.kondor-json-separator { width: 1px; align-self: stretch; background: ${LINE_COLOR}; }
.kondor-json-path {
  flex: 1 1 8ch; min-width: 0; opacity: 0.75; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; font: 13px/1.6 monospace;
}
.kondor-json-tree {
  font: 13px/1.6 monospace; color: CanvasText; background: Canvas;
  padding: 6px 8px 6px calc(8px + 2ch);
}
.kondor-json-row:focus { outline: none; }
.kondor-json-group { margin-inline-start: 2ch; }
.kondor-json-line, .kondor-json-closing {
  white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 3px;
}
.kondor-json-row[aria-selected="true"] > .kondor-json-line {
  background: color-mix(in srgb, Highlight 25%, transparent); outline: 1px solid Highlight;
}
.kondor-json-row:focus > .kondor-json-line { outline: 2px solid Highlight; }
.kondor-json-toggle {
  display: inline-block; width: 2ch; margin-inline-start: -2ch; text-align: center;
  font-size: 1.2em; line-height: 1; opacity: 0.6; cursor: pointer; user-select: none;
}
.kondor-json-toggle::before { content: "\\25BE"; }
.kondor-json-row[aria-expanded="false"] > .kondor-json-line > .kondor-json-toggle::before {
  content: "\\25B8";
}
.kondor-json-row[aria-expanded="false"] > .kondor-json-group,
.kondor-json-row[aria-expanded="false"] > .kondor-json-closing,
.kondor-json-row[aria-expanded="false"] > .kondor-json-line > .kondor-json-expanded-only,
.kondor-json-row[aria-expanded="true"] > .kondor-json-line > .kondor-json-collapsed-only {
  display: none;
}
.kondor-json-key { color: #0057ae; }
.kondor-json-string { color: #bf0303; }
.kondor-json-string a { color: inherit; text-decoration: underline; }
.kondor-json-number { color: #b08000; }
.kondor-json-literal { color: #644a9b; font-weight: bold; }
.kondor-json-punctuation { color: CanvasText; opacity: 0.6; }
@media (prefers-color-scheme: dark) {
  .kondor-json-key { color: #2980b9; }
  .kondor-json-string { color: #f44f4f; }
  .kondor-json-number { color: #f67400; }
  .kondor-json-literal { color: #a26ac7; }
}
`;

function installStyleSheet() {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(STYLE_RULES);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

function setHidden(node, isHidden) {
  if (isHidden) node.style.setProperty("display", "none");
  else node.style.removeProperty("display");
}

function styleRawView(pre) {
  pre.style.setProperty("margin", "0");
  pre.style.setProperty("padding", "8px");
}

function prepareDocument(pre) {
  installStyleSheet();
  document.body.style.setProperty("margin", "0");
  styleRawView(pre);
  const container = document.querySelector("div.json-formatter-container");
  if (container) setHidden(container, true);
}
