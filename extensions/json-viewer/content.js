function createViewer(pre) {
  const toolbar = createToolbar();
  document.body.prepend(toolbar);
  return { pre, toolbar, tree: null, text: pre.textContent };
}

function showFormatted(viewer, value) {
  viewer.tree = buildTree(value);
  viewer.toolbar.after(viewer.tree);
  enableTreeInteraction(viewer.tree);
  fillViewerToolbar(viewer);
  showView(viewer, "pretty");
}

function formatAnyway(viewer) {
  const value = parseJson(viewer.text);
  if (value === undefined) viewer.toolbar.remove();
  else showFormatted(viewer, value);
}

function showNotice(viewer) {
  fillNoticeToolbar(viewer, () => formatAnyway(viewer));
}

function openViewer(pre, show) {
  prepareDocument(pre);
  show(createViewer(pre));
}

function main() {
  const pre = findJsonPre();
  if (!pre) return;
  if (pre.textContent.length > MAX_CHARACTERS) return openViewer(pre, showNotice);
  const value = parseJson(pre.textContent);
  if (value !== undefined) openViewer(pre, (viewer) => showFormatted(viewer, value));
}

main();
