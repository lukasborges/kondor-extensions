const MODIFIER_FLAGS = new Map([["ctrl", "ctrlKey"], ["alt", "altKey"], ["shift", "shiftKey"], ["meta", "metaKey"]]);
const KEY_ALIASES = new Map([["Left", "ArrowLeft"], ["Right", "ArrowRight"], ["Up", "ArrowUp"], ["Down", "ArrowDown"], ["Space", " "]]);

function createNoModifiers() {
  return { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
}

function parseModifiers(names) {
  const flags = createNoModifiers();
  for (const name of names) {
    const flag = MODIFIER_FLAGS.get(name.trim().toLowerCase());
    if (!flag) return null;
    flags[flag] = true;
  }
  return flags;
}

function parseKeys(text) {
  const parts = String(text || "").split("+");
  const key = parts.pop().trim();
  const flags = parseModifiers(parts);
  if (!key || !flags) return null;
  return { key, flags };
}

function matchesModifiers(binding, event) {
  return Object.keys(binding.flags).every((flag) => binding.flags[flag] === event[flag]);
}

function matchesKeyName(name, event) {
  const wanted = KEY_ALIASES.get(name) || name;
  if (wanted.length === 1) return event.key.toLowerCase() === wanted.toLowerCase();
  return event.key === wanted;
}

function matchesKeys(binding, event) {
  return binding !== null && matchesModifiers(binding, event) && matchesKeyName(binding.key, event);
}

function isEditableTarget(target) {
  if (!target || !target.localName) return false;
  return ["input", "textarea", "select"].includes(target.localName) || target.isContentEditable;
}
