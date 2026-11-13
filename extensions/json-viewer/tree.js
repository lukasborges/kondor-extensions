const rowData = new WeakMap();

function createNode(tag, classNames, text) {
  const node = document.createElement(tag);
  node.className = classNames.map((name) => "kondor-json-" + name).join(" ");
  node.textContent = text;
  return node;
}

function setAttributes(node, attributes) {
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
}

function punctuation(text, mode) {
  return createNode("span", mode ? ["punctuation", mode] : ["punctuation"], text);
}

function isContainer(value) {
  return typeof value === "object" && value !== null && !JSON.isRawJSON(value);
}

function memberCount(value) {
  return Array.isArray(value) ? value.length : Object.keys(value).length;
}

function hasMembers(value) {
  return isContainer(value) && memberCount(value) > 0;
}

function openChar(value) {
  return Array.isArray(value) ? "[" : "{";
}

function closeChar(value) {
  return Array.isArray(value) ? "]" : "}";
}

function commaText(isLast) {
  return isLast ? "" : ",";
}

function isWebUrl(text) {
  try {
    const protocol = new URL(text).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch (error) {
    return false;
  }
}

function linkNode(href, text) {
  const link = createNode("a", [], text);
  link.setAttribute("href", href);
  return link;
}

function stringNode(value) {
  const node = createNode("span", ["string"], "");
  const escaped = JSON.stringify(value).slice(1, -1);
  node.append('"', isWebUrl(value) ? linkNode(value, escaped) : escaped, '"');
  return node;
}

function scalarNode(value) {
  if (typeof value === "string") return stringNode(value);
  if (JSON.isRawJSON(value)) return createNode("span", ["number"], value.rawJSON);
  if (isContainer(value)) return punctuation(openChar(value) + closeChar(value));
  return createNode("span", ["literal"], String(value));
}

function keyNodes(label) {
  if (label === null) return [];
  return [createNode("span", ["key"], JSON.stringify(label)), punctuation(": ")];
}

function childEntry(parent, [key, item], isLast) {
  const isIndex = Array.isArray(parent.value);
  const path = isIndex ? elementPath(parent.path, key) : memberPath(parent.path, key);
  return { label: isIndex ? null : key, value: item, level: parent.level + 1, isLast, path };
}

function memberEntries(parent) {
  const pairs = Array.isArray(parent.value) ? [...parent.value.entries()] : Object.entries(parent.value);
  return pairs.map((pair, index) => childEntry(parent, pair, index === pairs.length - 1));
}

function createToggle() {
  const toggle = createNode("span", ["toggle"], "");
  toggle.setAttribute("aria-hidden", "true");
  return toggle;
}

function collapsedSummary(entry) {
  const summary = createNode("span", ["collapsed-only"], "");
  const closed = openChar(entry.value) + "…" + closeChar(entry.value) + commaText(entry.isLast);
  summary.append(punctuation(closed + " "), punctuation(countText(memberCount(entry.value))));
  return summary;
}

function createContainerLine(entry) {
  const line = createNode("div", ["line"], "");
  const open = punctuation(openChar(entry.value), "expanded-only");
  line.append(createToggle(), ...keyNodes(entry.label), open, collapsedSummary(entry));
  return line;
}

function createLeafLine(entry) {
  const line = createNode("div", ["line"], "");
  line.append(...keyNodes(entry.label), scalarNode(entry.value), punctuation(commaText(entry.isLast)));
  return line;
}

function createClosingLine(entry) {
  const text = closeChar(entry.value) + commaText(entry.isLast);
  const line = createNode("div", ["closing"], "");
  line.appendChild(punctuation(text));
  return line;
}

function createGroup(entry) {
  const group = createNode("div", ["group"], "");
  group.setAttribute("role", "group");
  memberEntries(entry).forEach((child) => group.appendChild(createRow(child)));
  return group;
}

function fillContainerRow(row, entry) {
  row.setAttribute("aria-expanded", "true");
  row.append(createContainerLine(entry), createGroup(entry), createClosingLine(entry));
}

function createRow(entry) {
  const row = createNode("div", ["row"], "");
  setAttributes(row, { role: "treeitem", "aria-level": entry.level, tabindex: "-1" });
  rowData.set(row, entry);
  if (hasMembers(entry.value)) fillContainerRow(row, entry);
  else row.appendChild(createLeafLine(entry));
  return row;
}

function buildTree(value) {
  const tree = createNode("div", ["tree"], "");
  const label = textsForLocale().treeLabel;
  setAttributes(tree, { role: "tree", "aria-label": label, dir: "ltr" });
  tree.appendChild(createRow({ label: null, value, level: 1, isLast: true, path: "" }));
  return tree;
}

function containerRows(tree) {
  return Array.from(tree.querySelectorAll("[aria-expanded]"));
}

function setExpanded(row, isExpanded) {
  row.setAttribute("aria-expanded", String(isExpanded));
}

function toggleRow(tree, row) {
  setExpanded(row, row.getAttribute("aria-expanded") !== "true");
  keepSelectionVisible(tree);
}

function collapseAll(tree) {
  containerRows(tree)
    .filter((row) => row !== tree.firstElementChild)
    .forEach((row) => setExpanded(row, false));
  keepSelectionVisible(tree);
}

function expandAll(tree) {
  containerRows(tree).forEach((row) => setExpanded(row, true));
}
