const MIN_OVERLAY_VIDEO_WIDTH = 120;
const OVERLAY_OFFSET = 8;
const OVERLAY_HOST_STYLE = "position: absolute; z-index: 2147483647; pointer-events: none;";
const OVERLAY_CSS = "div { background: rgba(0, 0, 0, 0.6); color: #fff; border-radius: 4px;" +
  " font: 13px sans-serif; padding: 2px 6px; pointer-events: none; }";
const overlays = new Map();
const overlayState = { isVisible: true };

function createOverlayHost() {
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  const label = document.createElement("div");
  style.textContent = OVERLAY_CSS;
  host.style.cssText = OVERLAY_HOST_STYLE;
  root.append(style, label);
  return { host, label };
}

function shouldShowOverlay(video) {
  return overlayState.isVisible && video.offsetParent !== null && video.offsetWidth >= MIN_OVERLAY_VIDEO_WIDTH;
}

function refreshOverlay(overlay) {
  const { video, host, label } = overlay;
  label.textContent = video.playbackRate.toFixed(2) + "×";
  host.style.top = video.offsetTop + OVERLAY_OFFSET + "px";
  host.style.left = video.offsetLeft + OVERLAY_OFFSET + "px";
  host.style.display = shouldShowOverlay(video) ? "" : "none";
}

function refreshAllOverlays() {
  overlays.forEach(refreshOverlay);
}

function listenToOverlayVideo(overlay, isListening) {
  const method = isListening ? "addEventListener" : "removeEventListener";
  const refresh = overlay.refresh;
  overlay.video[method]("ratechange", refresh);
  overlay.video[method]("loadedmetadata", refresh);
  window[method]("resize", refresh);
}

function watchOverlay(overlay) {
  const resizeObserver = new ResizeObserver(overlay.refresh);
  listenToOverlayVideo(overlay, true);
  resizeObserver.observe(overlay.video);
  overlay.stopWatching = () => {
    listenToOverlayVideo(overlay, false);
    resizeObserver.disconnect();
  };
}

function createOverlay(video) {
  const overlay = { video, ...createOverlayHost() };
  overlay.refresh = () => refreshOverlay(overlay);
  video.before(overlay.host);
  overlays.set(video, overlay);
  watchOverlay(overlay);
  refreshOverlay(overlay);
}

function removeOverlay(video) {
  const overlay = overlays.get(video);
  if (!overlay) return;
  overlay.stopWatching();
  overlay.host.remove();
  overlays.delete(video);
}

function isOverlayPlaced(video) {
  const overlay = overlays.get(video);
  return Boolean(overlay) && overlay.host.nextSibling === video;
}

function ensureOverlay(video) {
  if (isOverlayPlaced(video)) return;
  removeOverlay(video);
  createOverlay(video);
}
