function isValidLink(text) {
  try {
    return ["http:", "https:"].includes(new URL(text).protocol);
  } catch (error) {
    return false;
  }
}

function optionNodes(manager) {
  return Array.from(manager.list.querySelectorAll("[role=option]"));
}

function selectStyle(manager, id) {
  manager.selectedId = id;
  for (const option of optionNodes(manager)) {
    const isSelected = option.dataset.styleId === id;
    option.setAttribute("aria-selected", String(isSelected));
    if (isSelected) manager.list.setAttribute("aria-activedescendant", option.id);
    if (isSelected) option.scrollIntoView({ block: "nearest" });
  }
}

function moveSelection(manager, step) {
  const ids = orderedIds(state.styles);
  const index = ids.indexOf(manager.selectedId) + step;
  if (index >= 0 && index < ids.length) selectStyle(manager, ids[index]);
}

function revertToggle(manager, checkbox, error) {
  checkbox.checked = !checkbox.checked;
  setMessage(manager.view, error, "negative");
}

async function toggleStyle(manager, checkbox, id) {
  const styles = withEnabled(state.styles, id, checkbox.checked);
  const error = await saveStyles(styles);
  if (error !== null) return revertToggle(manager, checkbox, error);
  setStyles(styles);
  checkbox.closest("[role=option]").classList.toggle("off", !checkbox.checked);
}

function createCheckbox(manager, style) {
  const checkbox = createNode("input", "check", "");
  checkbox.type = "checkbox";
  checkbox.checked = style.enabled;
  checkbox.disabled = kondor.isPrivate;
  checkbox.setAttribute("aria-label", style.name);
  checkbox.addEventListener("change", () => toggleStyle(manager, checkbox, style.id));
  return checkbox;
}

function createOption(manager, style, index) {
  const option = createNode("li", style.enabled ? "option" : "option off", "");
  setAttributes(option, { role: "option", id: "style-" + index, "aria-selected": "false" });
  option.dataset.styleId = style.id;
  const row = createNode("div", "name-row", "");
  row.append(createCheckbox(manager, style), createNode("span", "name", style.name));
  option.append(row, createNode("div", "sites", summarizeSites(style)));
  return option;
}

function createHeading(title) {
  const heading = createNode("li", "heading", title);
  heading.setAttribute("role", "presentation");
  return heading;
}

function renderList(manager) {
  let index = 0;
  const nodes = groupStyles(state.styles).flatMap((group) => [
    createHeading(group.title),
    ...group.styles.map((style) => createOption(manager, style, index++)),
  ]);
  manager.list.replaceChildren(...nodes);
  manager.list.hidden = nodes.length === 0;
  manager.empty.hidden = nodes.length > 0;
}

function selectAfterRender(manager, id) {
  const ids = orderedIds(state.styles);
  selectStyle(manager, ids.includes(id) ? id : ids[0] || null);
}

function openLink(manager) {
  const link = manager.input.value.trim();
  if (isValidLink(link)) window.open(link, "_blank", "noopener");
}

function createLinkRow(manager) {
  const row = createNode("div", "link-row", "");
  manager.input = createNode("input", "field", "");
  setAttributes(manager.input, { type: "url", placeholder: textsForLocale().linkField, "aria-label": textsForLocale().linkField });
  manager.openButton = createButton(textsForLocale().open, () => openLink(manager), false);
  manager.openButton.disabled = true;
  row.append(manager.input, manager.openButton);
  return row;
}

function handleLinkInput(manager, event) {
  manager.openButton.disabled = !isValidLink(manager.input.value.trim());
  if (event.type === "keydown" && event.key === "Enter") openLink(manager);
}

function handleListKey(manager, event) {
  if (event.key === "ArrowDown") moveSelection(manager, 1);
  if (event.key === "ArrowUp") moveSelection(manager, -1);
  if (event.key === "Delete") removeSelected(manager);
  if (["ArrowDown", "ArrowUp", "Delete"].includes(event.key)) event.preventDefault();
}

function handleListClick(manager, event) {
  const option = event.target.closest("[role=option]");
  if (option && !event.target.closest("input")) selectStyle(manager, option.dataset.styleId);
}

function createList(manager) {
  const list = createNode("ul", "styles", "");
  setAttributes(list, { role: "listbox", "aria-label": textsForLocale().listTitle, tabindex: "0" });
  list.addEventListener("keydown", (event) => handleListKey(manager, event));
  list.addEventListener("click", (event) => handleListClick(manager, event));
  return list;
}

function createRemoveButton(manager) {
  const button = createButton(textsForLocale().remove, () => removeSelected(manager), false);
  button.classList.add("start");
  button.disabled = state.styles.length === 0;
  return button;
}

function showListFooter(manager) {
  setFooter(manager.view, kondor.isPrivate ? [] : [createRemoveButton(manager)]);
}

function showRemovedFooter(manager) {
  const text = fillText(textsForLocale().removed, [manager.removed.style.name]);
  const undo = createButton(textsForLocale().undo, () => undoRemoval(manager), true);
  setFooter(manager.view, [createNode("span", "start", text), undo]);
  undo.focus();
}

function finishRemoval(manager, styles, position) {
  setStyles(styles);
  renderList(manager);
  selectStyle(manager, neighborId(orderedIds(styles), position));
  showRemovedFooter(manager);
}

async function removeSelected(manager) {
  const style = state.styles.find((item) => item.id === manager.selectedId);
  if (!style || kondor.isPrivate) return;
  const position = orderedIds(state.styles).indexOf(style.id);
  const styles = withoutStyle(state.styles, style.id);
  const error = await saveStyles(styles);
  if (error !== null) return setMessage(manager.view, error, "negative");
  manager.removed = { style, index: state.styles.indexOf(style) };
  finishRemoval(manager, styles, position);
}

async function undoRemoval(manager) {
  const { style, index } = manager.removed;
  const styles = withStyleAt(state.styles, style, index);
  const error = await saveStyles(styles);
  if (error !== null) return setMessage(manager.view, error, "negative");
  manager.removed = null;
  setStyles(styles);
  renderList(manager);
  selectStyle(manager, style.id);
  showListFooter(manager);
}

function wireLinkField(manager) {
  const update = (event) => handleLinkInput(manager, event);
  manager.input.addEventListener("input", update);
  manager.input.addEventListener("keydown", update);
}

function buildManager(view) {
  const manager = { view, selectedId: null, removed: null };
  manager.list = createList(manager);
  manager.empty = createNode("div", "empty", textsForLocale().emptyList);
  view.body.append(createLinkRow(manager), manager.list, manager.empty);
  wireLinkField(manager);
  return manager;
}

function showManager() {
  const manager = buildManager(openPanel(textsForLocale().listTitle));
  if (kondor.isPrivate) setMessage(manager.view, textsForLocale().privateList, "neutral");
  renderList(manager);
  selectAfterRender(manager, null);
  showListFooter(manager);
  (manager.list.hidden ? manager.input : manager.list).focus();
}

function openManager() {
  switchView(showManager);
}
