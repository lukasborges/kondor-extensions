const LINE_COLOR = "color-mix(in srgb, CanvasText 20%, transparent)";
const PANEL_RULES = `
.frame {
  position: fixed; inset-block: 0; inset-inline-end: 0; width: min(440px, 100vw);
  z-index: 2147483647; display: flex; flex-direction: column; box-sizing: border-box;
  background: Canvas; color: CanvasText; border-inline-start: 1px solid ${LINE_COLOR};
  box-shadow: 0 0 14px rgb(0 0 0 / 25%); font: 13px/1.4 system-ui, sans-serif;
}
.header { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-bottom: 1px solid ${LINE_COLOR}; }
.title { flex: 1; margin: 0; font-size: 14px; font-weight: bold; overflow-wrap: anywhere; }
.body { flex: 1; min-height: 0; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.body > * { flex-shrink: 0; }
.footer {
  display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; align-items: center;
  padding: 8px 12px; border-top: 1px solid ${LINE_COLOR};
}
.footer:empty { display: none; }
.button {
  font: inherit; padding: 3px 10px; cursor: pointer; background: ButtonFace; color: ButtonText;
  border: 1px solid ${LINE_COLOR}; border-radius: 4px;
}
.button.default { background: Highlight; color: HighlightText; border-color: Highlight; }
.button:disabled { opacity: 0.5; cursor: default; }
.button:focus-visible, .field:focus-visible, .styles:focus-visible, .check:focus-visible { outline: 2px solid Highlight; }
.start { margin-inline-end: auto; }
.message { padding: 6px 8px; border-inline-start: 3px solid var(--tint); background: color-mix(in srgb, var(--tint) 12%, transparent); }
.message.neutral { --tint: #f67400; }
.message.negative { --tint: #da4453; }
.messages:empty { display: none; }
.field { font: inherit; background: Field; color: FieldText; border: 1px solid ${LINE_COLOR}; border-radius: 3px; padding: 3px 6px; }
.editor { flex: 1 1 auto; min-height: 8em; resize: none; font: 13px/1.5 monospace; }
.link-row { display: flex; gap: 6px; }
.link-row .field { flex: 1; min-width: 0; }
.styles { list-style: none; margin: 0; padding: 0; }
.heading { font-size: 12px; font-weight: bold; margin: 10px 0 4px; }
.option { padding: 4px 6px; border-radius: 3px; }
.option[aria-selected="true"] { background: color-mix(in srgb, Highlight 25%, transparent); outline: 1px solid Highlight; }
.name-row { display: flex; align-items: center; gap: 6px; }
.option.off .name { opacity: 0.6; }
.sites { opacity: 0.7; font-size: 12px; margin-inline-start: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty { text-align: center; opacity: 0.7; padding: 16px; }
.details { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; margin: 0; }
.details dt { font-weight: bold; }
.details dd { margin: 0; overflow-wrap: anywhere; }
[hidden] { display: none !important; }
`;
const panelState = { view: null, returnFocus: null };

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function setAttributes(node, attributes) {
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
}

function createButton(label, onClick, isDefault) {
  const button = createNode("button", isDefault ? "button default" : "button", label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function setMessage(view, text, kind) {
  const message = createNode("div", "message " + kind, text);
  message.setAttribute("role", kind === "negative" ? "alert" : "status");
  view.messages.replaceChildren(message);
}

function setFooter(view, nodes) {
  view.footer.replaceChildren(...nodes);
}

function createPanelSheet() {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(PANEL_RULES);
  return sheet;
}

function createHeader(title) {
  const header = createNode("div", "header", "");
  const close = createButton("✕", requestClose, false);
  setAttributes(close, { "aria-label": textsForLocale().close, title: textsForLocale().close });
  header.append(createNode("h2", "title", title), close);
  return header;
}

function stopKeyPropagation(frame) {
  for (const type of ["keydown", "keyup", "keypress"]) frame.addEventListener(type, (event) => event.stopPropagation());
}

function createFrame(title) {
  const frame = createNode("div", "frame", "");
  setAttributes(frame, { role: "dialog", "aria-label": title });
  frame.addEventListener("keydown", (event) => event.key === "Escape" && requestClose());
  stopKeyPropagation(frame);
  return frame;
}

function createPanelHost(frame) {
  const host = document.createElement("div");
  host.style.setProperty("all", "initial");
  host.style.setProperty("color-scheme", "light dark");
  const root = host.attachShadow({ mode: "closed" });
  root.adoptedStyleSheets = [createPanelSheet()];
  root.append(frame);
  return host;
}

function createPanelView(title) {
  const frame = createFrame(title);
  const messages = createNode("div", "messages", "");
  const body = createNode("div", "body", "");
  const footer = createNode("div", "footer", "");
  body.append(messages);
  frame.append(createHeader(title), body, footer);
  const host = createPanelHost(frame);
  return { host, body, messages, footer, isDirty: () => false, leave: () => {}, askDiscard: () => {}, dismiss: closePanel };
}

function openPanel(title) {
  if (panelState.view) panelState.view.host.remove();
  else panelState.returnFocus = document.activeElement;
  panelState.view = createPanelView(title);
  document.documentElement.append(panelState.view.host);
  return panelState.view;
}

function closePanel() {
  const { view, returnFocus } = panelState;
  if (!view) return;
  view.host.remove();
  panelState.view = null;
  if (returnFocus && returnFocus.isConnected) returnFocus.focus();
}

function requestClose() {
  const view = panelState.view;
  if (!view) return;
  if (view.isDirty()) view.askDiscard(closePanel);
  else view.dismiss();
}

function switchView(openView) {
  const view = panelState.view;
  if (view && view.isDirty()) view.askDiscard(openView);
  else {
    if (view) view.leave();
    openView();
  }
}
