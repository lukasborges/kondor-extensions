function createButton(label, extraClass, onClick) {
  const button = createNode("button", ["button", extraClass], label);
  setAttributes(button, { type: "button", "data-label": label });
  button.addEventListener("click", onClick);
  return button;
}

function createToolbar() {
  const toolbar = createNode("div", ["toolbar"], "");
  setAttributes(toolbar, { role: "toolbar", "aria-label": textsForLocale().toolbarLabel });
  return toolbar;
}

function showView(viewer, view) {
  viewer.toolbar.dataset.mode = view;
  viewer.toolbar.querySelectorAll("[data-view]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.view === view));
  });
  setHidden(viewer.tree, view === "raw");
  setHidden(viewer.pre, view === "pretty");
}

function createViewButton(viewer, view, label) {
  const button = createButton(label, "view", () => showView(viewer, view));
  button.dataset.view = view;
  return button;
}

function createViewSwitch(viewer) {
  const group = createNode("div", ["switch"], "");
  group.setAttribute("role", "group");
  const texts = textsForLocale();
  group.append(createViewButton(viewer, "pretty", texts.pretty), createViewButton(viewer, "raw", texts.raw));
  return group;
}

function selectedEntry(viewer) {
  return rowData.get(selectedRow(viewer.tree));
}

function createCopyButton(label, extraClass, getText) {
  return createButton(label, extraClass, (event) => copyWithFeedback(event.currentTarget, getText()));
}

function createSeparator() {
  return createNode("span", ["separator"], "");
}

function createTreeButtons(viewer) {
  const texts = textsForLocale();
  return [
    createButton(texts.collapseAll, "collapse", () => collapseAll(viewer.tree)),
    createButton(texts.expandAll, "expand", () => expandAll(viewer.tree)),
  ];
}

function createCopyButtons(viewer) {
  const texts = textsForLocale();
  return [
    createCopyButton(texts.copyValue, "copy-value", () => copiedText(selectedEntry(viewer).value)),
    createCopyButton(texts.copyPath, "copy-path", () => selectedEntry(viewer).path),
  ];
}

function createTools(viewer) {
  const tools = createNode("div", ["tools"], "");
  const path = createNode("span", ["path"], "");
  tools.append(createSeparator(), ...createTreeButtons(viewer), createSeparator());
  tools.append(...createCopyButtons(viewer), path);
  return tools;
}

function updateSelectionControls(viewer) {
  const path = selectedEntry(viewer).path;
  const pathNode = viewer.toolbar.querySelector(".kondor-json-path");
  pathNode.textContent = path;
  pathNode.title = path;
  viewer.toolbar.querySelector(".kondor-json-copy-path").disabled = path === "";
}

function fillViewerToolbar(viewer) {
  viewer.toolbar.replaceChildren(createViewSwitch(viewer), createTools(viewer));
  viewer.tree.addEventListener("kondorjsonselect", () => updateSelectionControls(viewer));
  updateSelectionControls(viewer);
}

function fillNoticeToolbar(viewer, onFormat) {
  const notice = createNode("span", ["notice"], sizeNoticeText(viewer.text.length));
  viewer.toolbar.replaceChildren(notice, createButton(textsForLocale().formatAnyway, "format", onFormat));
}
