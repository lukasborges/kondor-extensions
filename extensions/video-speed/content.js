const OVERLAY_ITEM = "show-overlay";
const COMMANDS = {
  keySlower: slowDown,
  keyFaster: speedUp,
  keyReset: resetSpeed,
  keyRewind: rewind,
  keyAdvance: advance,
  keyOverlay: toggleOverlay,
};
const ACTION_COMMANDS = { slower: slowDown, faster: speedUp, reset: resetSpeed };
const state = { values: kondor.settings.values, bindings: {} };

function changeSpeedByStep(direction) {
  changeSpeedBy(direction * state.values.speedStep / 100);
  applySpeedToAllVideos();
  if (state.values.rememberSpeed) saveSpeed();
}

function slowDown() {
  changeSpeedByStep(-1);
}

function speedUp() {
  changeSpeedByStep(1);
}

function resetSpeed() {
  resetSpeedToNormal();
  applySpeedToAllVideos();
  if (state.values.rememberSpeed) forgetSpeed();
}

function rewind() {
  moveActiveVideo(-state.values.skipSeconds);
}

function advance() {
  moveActiveVideo(state.values.skipSeconds);
}

function showOverlay(isVisible) {
  overlayState.isVisible = isVisible;
  kondor.action.setChecked(OVERLAY_ITEM, isVisible);
  refreshAllOverlays();
}

function changeOverlayVisibility(isVisible) {
  showOverlay(isVisible);
  kondor.storage.set("showOverlay", isVisible).catch(() => {});
}

function toggleOverlay() {
  changeOverlayVisibility(!overlayState.isVisible);
}

function loadOverlayVisibility() {
  kondor.storage.get("showOverlay").then((saved) => showOverlay(saved !== false)).catch(() => {});
}

function parseAllKeys() {
  for (const name of Object.keys(COMMANDS)) state.bindings[name] = parseKeys(state.values[name]);
}

function findCommandName(event) {
  return Object.keys(COMMANDS).find((name) => matchesKeys(state.bindings[name], event));
}

function handleKeydown(event) {
  if (event.defaultPrevented || isEditableTarget(event.target) || !hasVideo()) return;
  const name = findCommandName(event);
  if (!name) return;
  COMMANDS[name]();
  event.preventDefault();
  event.stopPropagation();
}

function handleAction(itemId, isChecked) {
  if (itemId === OVERLAY_ITEM) changeOverlayVisibility(typeof isChecked === "boolean" ? isChecked : !overlayState.isVisible);
  else if (ACTION_COMMANDS[itemId]) ACTION_COMMANDS[itemId]();
}

function changeSettings(values) {
  state.values = values;
  parseAllKeys();
}

parseAllKeys();
watchVideos();
loadOverlayVisibility();
if (state.values.rememberSpeed) restoreSpeed();
window.addEventListener("keydown", handleKeydown, true);
kondor.settings.onChanged(changeSettings);
kondor.onAction(handleAction);
