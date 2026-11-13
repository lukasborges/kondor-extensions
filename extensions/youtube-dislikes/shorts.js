const SHORTS_CLASS = "kondor-youtube-dislikes-shorts";
const LABEL_CLASS = "ytSpecButtonShapeWithLabelLabel";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const THUMB_SHAPES = [
  ["rect", { x: "2.75", y: "3.75", width: "3.5", height: "10.5", rx: "1" }],
  ["path", { d: "M6.25 13.5 L10.5 20.25 L11.6 20.25 A1.6 1.6 0 0 0 13.15 18.25 L12.25 14.25 L18.6 14.25 A2 2 0 0 0 20.55 11.8 L19 5.3 A2 2 0 0 0 17.05 3.75 L6.25 3.75" }],
];
const SVG_ATTRIBUTES = { viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linejoin": "round" };
const ITEM_STYLES = { display: "flex", "flex-direction": "column", "align-items": "center", "margin-bottom": "16px" };
const ICON_BOX_STYLES = { display: "flex", width: "48px", height: "48px", "align-items": "center", "justify-content": "center" };

function findShortsColumn() {
  const selector = "reel-action-bar-view-model";
  return document.querySelector("ytd-reel-video-renderer[is-active] " + selector) || document.querySelector("ytd-shorts " + selector);
}

function createSvgElement(name, attributes) {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  setAttributes(element, attributes);
  return element;
}

function createThumbsDownIcon() {
  const icon = createSvgElement("svg", SVG_ATTRIBUTES);
  for (const [name, attributes] of THUMB_SHAPES) icon.append(createSvgElement(name, attributes));
  return icon;
}

function createIconBox() {
  const box = document.createElement("div");
  applyStyles(box, ICON_BOX_STYLES);
  box.append(createThumbsDownIcon());
  return box;
}

function createShortsItem() {
  const item = document.createElement("div");
  const label = document.createElement("div");
  item.className = SHORTS_CLASS;
  label.className = LABEL_CLASS;
  applyStyles(item, ITEM_STYLES);
  item.append(createIconBox(), label);
  return item;
}

function updateShortsItem(item, votes) {
  const label = item.querySelector("." + LABEL_CLASS);
  if (label.textContent !== formatCompact(votes.dislikes)) label.textContent = formatCompact(votes.dislikes);
  if (item.getAttribute("aria-label") !== shortsItemText(votes)) setAttributes(item, { "aria-label": shortsItemText(votes), role: "img" });
}

function drawShortsItem(column, votes) {
  const like = column.querySelector("like-button-view-model");
  if (!like) return;
  const item = column.querySelector("." + SHORTS_CLASS) || createShortsItem();
  if (item.previousElementSibling !== like) like.after(item);
  updateShortsItem(item, votes);
}

function createShortsCount() {
  const count = document.createElement("span");
  count.className = COUNT_CLASS;
  return count;
}

function drawShortsButtonCount(button, votes) {
  const label = button.querySelector("div." + LABEL_CLASS);
  if (!label) return;
  let count = label.querySelector("." + COUNT_CLASS);
  if (!count) label.replaceChildren((count = createShortsCount()));
  if (count.textContent !== formatCompact(votes.dislikes)) count.textContent = formatCompact(votes.dislikes);
}

function drawShorts(votes) {
  const column = findShortsColumn();
  const button = column && column.querySelector("dislike-button-view-model");
  if (button) drawShortsButtonCount(button, votes);
  else if (column) drawShortsItem(column, votes);
}
