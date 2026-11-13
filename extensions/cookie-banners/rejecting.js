const rejectedRuleIds = new Set();

function findElement(root, selector) {
  try {
    return root.querySelector(selector);
  } catch (error) {
    return null;
  }
}

function lookupRoot(rule) {
  if (!rule.shadowHost) return document;
  const host = findElement(document, rule.shadowHost);
  return host ? host.shadowRoot : null;
}

function findRejectButton(rule) {
  const root = lookupRoot(rule);
  if (!root) return null;
  const buttons = rule.reject.map((selector) => findElement(root, selector));
  return buttons.find((button) => button && !button.disabled) || null;
}

function canReject(rule) {
  const hasButton = Array.isArray(rule.reject) && rule.reject.length > 0;
  return hasButton && !state.hideOnly && !rejectedRuleIds.has(rule.id);
}

function rejectBanner(rule) {
  if (!canReject(rule)) return;
  const button = findRejectButton(rule);
  if (!button) return;
  rejectedRuleIds.add(rule.id);
  button.click();
}
