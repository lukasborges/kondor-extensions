const IMAGES_STYLE_ID = "kondor-dark-mode-images";
const DIM_IMAGES_ITEM = "dim-images";
const DIM_IMAGES_CSS = "img, video, canvas, svg image { filter: brightness(80%) !important; }";
const systemScheme = window.matchMedia("(prefers-color-scheme: dark)");
const state = { values: kondor.settings.values, dimImages: false };

function isThemeWanted() {
  return !state.values.onlyWhenSystemDark || systemScheme.matches;
}

function removeDimImages() {
  const style = document.getElementById(IMAGES_STYLE_ID);
  if (style) style.remove();
}

function refreshDimImages() {
  removeDimImages();
  if (!state.dimImages || !isThemeWanted() || !document.documentElement) return;
  document.documentElement.appendChild(createStyle(IMAGES_STYLE_ID, DIM_IMAGES_CSS));
}

function refreshTheme() {
  stopTheme();
  Object.assign(adjustment, { brightness: state.values.brightness, contrast: state.values.contrast, sepia: state.values.sepia });
  if (isThemeWanted()) startTheme();
  refreshDimImages();
}

function changeSettings(values) {
  state.values = values;
  refreshTheme();
}

function showDimImages(isChecked) {
  state.dimImages = isChecked;
  kondor.action.setChecked(DIM_IMAGES_ITEM, isChecked);
  refreshDimImages();
}

function saveDimImages(isChecked) {
  kondor.storage.set("dimImages", isChecked).catch(() => {});
}

function handleAction(itemId, isChecked) {
  if (itemId !== DIM_IMAGES_ITEM) return;
  const wanted = typeof isChecked === "boolean" ? isChecked : !state.dimImages;
  showDimImages(wanted);
  saveDimImages(wanted);
}

function loadDimImages() {
  kondor.storage.get("dimImages").then((saved) => showDimImages(saved === true)).catch(() => {});
}

refreshTheme();
loadDimImages();
kondor.settings.onChanged(changeSettings);
kondor.onAction(handleAction);
systemScheme.addEventListener("change", refreshTheme);
