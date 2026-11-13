const KEY_ACTIONS = {
  ArrowDown: (tree) => moveSelection(tree, 1),
  ArrowUp: (tree) => moveSelection(tree, -1),
  ArrowRight: expandOrEnter,
  ArrowLeft: collapseOrLeave,
  Home: (tree) => focusRow(tree, visibleRows(tree)[0]),
  End: (tree) => focusRow(tree, visibleRows(tree).at(-1)),
};

function selectedRow(tree) {
  return tree.querySelector('[aria-selected="true"]');
}

function parentRow(row) {
  return row.parentElement.closest('[role="treeitem"]');
}

function isRowVisible(row) {
  return !row.parentElement.closest('[aria-expanded="false"]');
}

function visibleRows(tree) {
  return Array.from(tree.querySelectorAll('[role="treeitem"]')).filter(isRowVisible);
}

function selectRow(tree, row) {
  const previous = selectedRow(tree);
  if (previous) setAttributes(previous, { "aria-selected": "false", tabindex: "-1" });
  setAttributes(row, { "aria-selected": "true", tabindex: "0" });
  tree.dispatchEvent(new CustomEvent("kondorjsonselect"));
}

function focusRow(tree, row) {
  selectRow(tree, row);
  row.focus();
  row.scrollIntoView({ block: "nearest" });
}

function keepSelectionVisible(tree) {
  let row = selectedRow(tree);
  while (!isRowVisible(row)) row = parentRow(row);
  if (row !== selectedRow(tree)) selectRow(tree, row);
}

function moveSelection(tree, offset) {
  const rows = visibleRows(tree);
  const index = rows.indexOf(selectedRow(tree)) + offset;
  focusRow(tree, rows[Math.min(Math.max(index, 0), rows.length - 1)]);
}

function expandOrEnter(tree) {
  const row = selectedRow(tree);
  if (!row.hasAttribute("aria-expanded")) return;
  if (row.getAttribute("aria-expanded") === "false") setExpanded(row, true);
  else focusRow(tree, row.querySelector('[role="treeitem"]'));
}

function collapseOrLeave(tree) {
  const row = selectedRow(tree);
  if (row.getAttribute("aria-expanded") === "true") toggleRow(tree, row);
  else if (parentRow(row)) focusRow(tree, parentRow(row));
}

function hasModifier(event) {
  return event.ctrlKey || event.altKey || event.metaKey || event.shiftKey;
}

function handleKey(tree, event) {
  const action = KEY_ACTIONS[event.key];
  if (!action || hasModifier(event)) return;
  event.preventDefault();
  action(tree);
}

function handleClick(tree, event) {
  if (event.target.closest("a")) return;
  const toggle = event.target.closest(".kondor-json-toggle");
  if (toggle) return toggleRow(tree, parentRow(toggle));
  const line = event.target.closest(".kondor-json-line");
  if (line) focusRow(tree, parentRow(line));
}

function enableTreeInteraction(tree) {
  selectRow(tree, tree.firstElementChild);
  tree.addEventListener("keydown", (event) => handleKey(tree, event));
  tree.addEventListener("click", (event) => handleClick(tree, event));
}
