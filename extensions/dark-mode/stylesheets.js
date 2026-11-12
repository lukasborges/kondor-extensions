const OWN_ID_PREFIX = "kondor-dark-mode";
const RULES_STYLE_ID = "kondor-dark-mode-rules";
const VAR_USE = /([a-z-]+)\s*:[^;{}]*?var\(\s*(--[\w-]+)/gi;
const sheetLayer = { style: null, observer: null, frame: 0 };

function isOwnNode(node) {
  return node !== null && typeof node.id === "string" && node.id.startsWith(OWN_ID_PREFIX);
}

function readRules(sheet) {
  try {
    return sheet.cssRules;
  } catch (error) {
    return null;
  }
}

function readableRuleLists() {
  const sheets = Array.from(document.styleSheets);
  return sheets.filter((sheet) => !sheet.disabled && !isOwnNode(sheet.ownerNode)).map(readRules).filter(Boolean);
}

function isConditionRule(rule) {
  return rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule;
}

function* styleRulesIn(rules) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) yield rule;
    else if (isConditionRule(rule)) yield* styleRulesIn(rule.cssRules);
  }
}

function roleOfProperty(property) {
  if (property in ROLE_BY_PROPERTY) return ROLE_BY_PROPERTY[property];
  if (property.startsWith("background")) return "background";
  return /^(border|outline|column-rule)/.test(property) ? "border" : null;
}

function recordVarUsage(rule, usage) {
  for (const [, property, name] of rule.cssText.matchAll(VAR_USE)) {
    const role = roleOfProperty(property);
    if (role && !(name in usage)) usage[name] = role;
  }
}

function collectVarUsage(ruleLists) {
  const usage = {};
  ruleLists.forEach((rules) => Array.from(styleRulesIn(rules)).forEach((rule) => recordVarUsage(rule, usage)));
  return usage;
}

function transformDeclaration(property, value, usage) {
  if (property.startsWith("--")) return transformColor(value, usage[property] || "background");
  if (!(property in ROLE_BY_PROPERTY)) return null;
  return transformValue(property, value);
}

function declarationFor(property, style, usage) {
  const transformed = transformDeclaration(property, style.getPropertyValue(property), usage);
  return transformed ? `${property}: ${transformed} !important;` : "";
}

function styleRuleCss(rule, usage) {
  const declarations = Array.from(rule.style, (property) => declarationFor(property, rule.style, usage));
  const text = declarations.filter(Boolean).join(" ");
  return text ? `${rule.selectorText} { ${text} }` : "";
}

function conditionPrelude(rule) {
  return rule.cssText.slice(0, rule.cssText.indexOf("{")).trim();
}

function conditionRuleCss(rule, usage) {
  const inner = ruleListCss(rule.cssRules, usage);
  return inner ? `${conditionPrelude(rule)} {\n${inner}\n}` : "";
}

function ruleCss(rule, usage) {
  if (rule instanceof CSSStyleRule) return styleRuleCss(rule, usage);
  return isConditionRule(rule) ? conditionRuleCss(rule, usage) : "";
}

function ruleListCss(rules, usage) {
  return Array.from(rules, (rule) => ruleCss(rule, usage)).join("\n");
}

function buildOverrideCss() {
  const lists = readableRuleLists();
  const usage = collectVarUsage(lists);
  return lists.map((rules) => ruleListCss(rules, usage)).join("\n");
}

function rebuildRules() {
  sheetLayer.frame = 0;
  sheetLayer.style.textContent = buildOverrideCss();
  document.documentElement.appendChild(sheetLayer.style);
}

function scheduleRebuild() {
  if (!sheetLayer.frame) sheetLayer.frame = requestAnimationFrame(rebuildRules);
}

function isStylesheetElement(node) {
  return node.nodeName === "STYLE" || (node.nodeName === "LINK" && node.rel.includes("stylesheet"));
}

function isForeignStylesheet(node) {
  return isStylesheetElement(node) && !isOwnNode(node);
}

function changesStylesheets(record) {
  return [...record.addedNodes, ...record.removedNodes].some(isForeignStylesheet);
}

function handleStyleMutations(records) {
  if (records.some(changesStylesheets)) scheduleRebuild();
}

function handleResourceLoad(event) {
  if (event.target.nodeName === "LINK") scheduleRebuild();
}

function startStyleSheetLayer() {
  sheetLayer.style = createStyle(RULES_STYLE_ID, "");
  sheetLayer.observer = new MutationObserver(handleStyleMutations);
  sheetLayer.observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("load", handleResourceLoad, true);
  rebuildRules();
}

function stopStyleSheetLayer() {
  if (!sheetLayer.observer) return;
  sheetLayer.observer.disconnect();
  document.removeEventListener("load", handleResourceLoad, true);
  cancelAnimationFrame(sheetLayer.frame);
  sheetLayer.style.remove();
  Object.assign(sheetLayer, { style: null, observer: null, frame: 0 });
}
