const BASE_STYLE_ID = "kondor-dark-mode-base";
const ALREADY_DARK_LIGHTNESS = 0.3;
const theme = { baseStyle: null, rootWatcher: null };

function createStyle(id, css) {
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  return style;
}

function buildBaseCss() {
  const background = transformColor("#ffffff", "background");
  const text = transformColor("#000000", "text");
  return `html, body { background-color: ${background} !important; color: ${text} !important; }\nhtml { color-scheme: dark; }`;
}

function addBaseStyle() {
  theme.baseStyle = createStyle(BASE_STYLE_ID, buildBaseCss());
  document.documentElement.appendChild(theme.baseStyle);
}

function removeBaseStyle() {
  if (theme.baseStyle) theme.baseStyle.remove();
  theme.baseStyle = null;
}

function declaresDarkColorScheme() {
  const meta = document.querySelector('meta[name="color-scheme"]');
  return meta !== null && meta.content === "dark";
}

function backgroundOf(element) {
  return element ? parseColor(getComputedStyle(element).backgroundColor) : null;
}

function pageBackground() {
  const body = backgroundOf(document.body);
  return body && body.a > 0 ? body : backgroundOf(document.documentElement);
}

function hasDarkBackground() {
  const color = pageBackground();
  return color !== null && color.a > 0 && toHsl(color).l < ALREADY_DARK_LIGHTNESS;
}

function isAlreadyDark() {
  theme.baseStyle.disabled = true;
  const isDark = declaresDarkColorScheme() || hasDarkBackground();
  theme.baseStyle.disabled = false;
  return isDark;
}

function evaluatePage() {
  if (isAlreadyDark()) return removeBaseStyle();
  startStyleSheetLayer();
  startElementLayer();
}

function beginTheme() {
  addBaseStyle();
  if (document.readyState !== "loading") return evaluatePage();
  document.addEventListener("DOMContentLoaded", evaluatePage, { once: true });
}

function watchForRoot() {
  if (!document.documentElement) return;
  theme.rootWatcher.disconnect();
  beginTheme();
}

function startTheme() {
  if (document.documentElement) return beginTheme();
  theme.rootWatcher = new MutationObserver(watchForRoot);
  theme.rootWatcher.observe(document, { childList: true });
}

function stopTheme() {
  if (theme.rootWatcher) theme.rootWatcher.disconnect();
  theme.rootWatcher = null;
  document.removeEventListener("DOMContentLoaded", evaluatePage);
  stopStyleSheetLayer();
  stopElementLayer();
  removeBaseStyle();
}
