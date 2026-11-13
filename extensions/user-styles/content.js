function pageCss(styles) {
  const applying = styles.filter((style) => style.enabled).flatMap((style) => style.sections.filter(sectionApplies));
  return applying.map((section) => section.css).join("\n");
}

function ensureSheet() {
  if (state.sheet) return state.sheet;
  state.sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, state.sheet];
  return state.sheet;
}

function applyStyles(styles) {
  const css = pageCss(styles);
  if (state.sheet || css !== "") ensureSheet().replaceSync(css);
}

function setStyles(styles) {
  state.styles = styles;
  applyStyles(styles);
}

function whenDocumentReady() {
  if (document.readyState !== "loading") return Promise.resolve();
  return new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
}

function handleAction(itemId) {
  if (itemId === "edit-style") openEditor();
  if (itemId === "manage-styles") openManager();
}

function main() {
  const loaded = loadStyles().then(setStyles);
  const ready = Promise.all([loaded, whenDocumentReady()]);
  ready.then(maybeShowInstaller);
  kondor.onAction((itemId) => ready.then(() => handleAction(itemId)));
}

main();
