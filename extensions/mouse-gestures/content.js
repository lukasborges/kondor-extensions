const state = { values: kondor.settings.values };

function handlePress(event) {
  handleMouseDown(event, state.values);
}

function replaceValues(values) {
  state.values = values;
}

window.addEventListener("mousedown", handlePress, true);
window.addEventListener("mousemove", handleMouseMove, true);
window.addEventListener("mouseup", handleMouseUp, true);
window.addEventListener("contextmenu", handleContextMenu, true);
window.addEventListener("auxclick", handleAuxClick, true);
window.addEventListener("keydown", handleKeyDown, true);
window.addEventListener("blur", cancelTracking);
kondor.settings.onChanged(replaceValues);
