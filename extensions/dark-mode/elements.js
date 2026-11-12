const ELEMENT_MARKER = "data-kondor-dark-mode";
const ELEMENTS_PER_FRAME = 500;
const originalInlineStyles = new WeakMap();
const elementLayer = { observer: null, queue: [], frame: 0 };

const ELEMENT_RULES = [
  { property: "background-color", role: "background", needsOverride: (color) => color.a > 0 && toHsl(color).l > 0.6 },
  { property: "color", role: "text", needsOverride: (color) => toHsl(color).l < 0.25 },
];

function saveInlineStyle(element, property) {
  const saved = originalInlineStyles.get(element) || new Map();
  const original = { value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) };
  if (!saved.has(property)) saved.set(property, original);
  originalInlineStyles.set(element, saved);
  element.setAttribute(ELEMENT_MARKER, "");
}

function overrideProperty(element, property, darkValue) {
  saveInlineStyle(element, property);
  element.style.setProperty(property, darkValue, "important");
}

function darkenProperty(element, computed, rule) {
  const value = computed.getPropertyValue(rule.property);
  const color = parseColor(value);
  if (color && rule.needsOverride(color)) overrideProperty(element, rule.property, transformColor(value, rule.role));
}

function darkenElement(element) {
  if (!element.style) return;
  const computed = getComputedStyle(element);
  ELEMENT_RULES.forEach((rule) => darkenProperty(element, computed, rule));
}

function restoreProperty(element, property, original) {
  if (original.value) element.style.setProperty(property, original.value, original.priority);
  else element.style.removeProperty(property);
}

function restoreElement(element) {
  const saved = originalInlineStyles.get(element) || new Map();
  saved.forEach((original, property) => restoreProperty(element, property, original));
  originalInlineStyles.delete(element);
  element.removeAttribute(ELEMENT_MARKER);
  if (!element.getAttribute("style")) element.removeAttribute("style");
}

function restoreElements() {
  document.querySelectorAll(`[${ELEMENT_MARKER}]`).forEach(restoreElement);
}

function scheduleElementWork() {
  if (!elementLayer.frame) elementLayer.frame = requestAnimationFrame(runElementWork);
}

function runElementWork() {
  elementLayer.frame = 0;
  elementLayer.queue.splice(0, ELEMENTS_PER_FRAME).forEach(darkenElement);
  if (elementLayer.queue.length) scheduleElementWork();
}

function queueSubtree(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  elementLayer.queue.push(node);
  node.querySelectorAll("*").forEach((element) => elementLayer.queue.push(element));
}

function queueMutatedElements(record) {
  if (record.type === "attributes") elementLayer.queue.push(record.target);
  else record.addedNodes.forEach(queueSubtree);
}

function handleElementMutations(records) {
  records.forEach(queueMutatedElements);
  scheduleElementWork();
}

function startElementLayer() {
  elementLayer.queue = Array.from(document.querySelectorAll("*"));
  elementLayer.observer = new MutationObserver(handleElementMutations);
  elementLayer.observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  scheduleElementWork();
}

function stopElementLayer() {
  if (elementLayer.observer) elementLayer.observer.disconnect();
  cancelAnimationFrame(elementLayer.frame);
  Object.assign(elementLayer, { observer: null, queue: [], frame: 0 });
  restoreElements();
}
