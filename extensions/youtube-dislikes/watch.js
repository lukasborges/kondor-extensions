const WATCH_HOST_SELECTOR = "ytd-watch-metadata segmented-like-dislike-button-view-model";
const COUNT_CLASS = "kondor-youtube-dislikes-count";
const RATIO_CLASS = "kondor-youtube-dislikes-ratio";
const RATIO_STYLES = {
  position: "absolute",
  "inset-inline": "12px",
  bottom: "-6px",
  height: "3px",
  "border-radius": "2px",
  overflow: "hidden",
  display: "flex",
  background: "color-mix(in srgb, currentColor 25%, transparent)",
};

function setAttributes(element, attributes) {
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
}

function applyStyles(element, styles) {
  for (const [name, value] of Object.entries(styles)) element.style.setProperty(name, value);
}

function findDislikeButton(host) {
  return host.querySelector("dislike-button-view-model button");
}

function clearWatchWidth() {
  const host = document.querySelector(WATCH_HOST_SELECTOR);
  const button = host && findDislikeButton(host);
  if (button) button.style.removeProperty("width");
}

function createWatchCount() {
  const count = document.createElement("div");
  count.className = "ytSpecButtonShapeNextButtonTextContent " + COUNT_CLASS;
  count.style.setProperty("margin-inline-start", "6px");
  return count;
}

function ensureWatchCount(button, text) {
  const icon = button.querySelector("div.ytSpecButtonShapeNextIcon");
  if (!icon) return;
  const count = button.querySelector("." + COUNT_CLASS) || createWatchCount();
  if (count.previousElementSibling !== icon) icon.after(count);
  if (count.textContent !== text) count.textContent = text;
  if (button.style.width !== "auto") button.style.width = "auto";
}

function likesShare(votes) {
  return Math.round((votes.likes / (votes.likes + votes.dislikes)) * 10000) / 100 + "%";
}

function createRatioBar() {
  const bar = document.createElement("div");
  const likes = document.createElement("div");
  bar.className = RATIO_CLASS;
  applyStyles(bar, RATIO_STYLES);
  applyStyles(likes, { height: "100%", background: "currentColor" });
  bar.append(likes);
  return bar;
}

function updateRatioBar(bar, votes) {
  const likes = bar.firstElementChild;
  const text = ratioBarText(votes);
  if (likes.style.width !== likesShare(votes)) likes.style.width = likesShare(votes);
  if (bar.getAttribute("title") !== text) setAttributes(bar, { title: text, "aria-label": text, role: "img" });
}

function ensureRatioBar(host, votes) {
  const bar = host.querySelector("." + RATIO_CLASS) || createRatioBar();
  if (bar.parentElement !== host) host.append(bar);
  updateRatioBar(bar, votes);
}

function removeRatioBar(host) {
  const bar = host.querySelector("." + RATIO_CLASS);
  if (bar) bar.remove();
}

function drawWatch(votes, showRatioBar) {
  const host = document.querySelector(WATCH_HOST_SELECTOR);
  if (!host) return;
  const button = findDislikeButton(host);
  if (button) ensureWatchCount(button, formatCompact(votes.dislikes));
  if (showRatioBar && votes.likes + votes.dislikes > 0) ensureRatioBar(host, votes);
  else removeRatioBar(host);
}
