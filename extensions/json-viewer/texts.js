const TEXTS = {
  en: {
    pretty: "Pretty",
    raw: "Raw",
    collapseAll: "Collapse All",
    expandAll: "Expand All",
    copyValue: "Copy Value",
    copyPath: "Copy Path",
    copied: "Copied",
    toolbarLabel: "JSON viewer",
    treeLabel: "JSON document",
    countOne: "1 item",
    countOther: "%1 items",
    notice: "This document is too large to format quickly (%1).",
    formatAnyway: "Format Anyway",
  },
  pt: {
    pretty: "Formatado",
    raw: "Bruto",
    collapseAll: "Recolher Tudo",
    expandAll: "Expandir Tudo",
    copyValue: "Copiar Valor",
    copyPath: "Copiar Caminho",
    copied: "Copiado",
    toolbarLabel: "Visualizador de JSON",
    treeLabel: "Documento JSON",
    countOne: "1 item",
    countOther: "%1 itens",
    notice: "Este documento é grande demais para formatar rapidamente (%1).",
    formatAnyway: "Formatar Mesmo Assim",
  },
};
const BYTES_PER_MEGABYTE = 1000000;

function textsForLocale() {
  return kondor.locale.startsWith("pt") ? TEXTS.pt : TEXTS.en;
}

function numberLocale() {
  try {
    return Intl.getCanonicalLocales(kondor.locale.replace("_", "-"))[0];
  } catch (error) {
    return "en-US";
  }
}

function fillText(template, value) {
  return template.replace("%1", value);
}

const formatterCache = new Map();

function cachedFormatter(key, create) {
  if (!formatterCache.has(key)) formatterCache.set(key, create());
  return formatterCache.get(key);
}

function pluralRules() {
  return cachedFormatter("plural", () => new Intl.PluralRules(numberLocale()));
}

function countFormat() {
  return cachedFormatter("count", () => new Intl.NumberFormat(numberLocale()));
}

function countText(count) {
  const texts = textsForLocale();
  const template = pluralRules().select(count) === "one" ? texts.countOne : texts.countOther;
  return fillText(template, countFormat().format(count));
}

function sizeNoticeText(length) {
  const format = { style: "unit", unit: "megabyte", maximumFractionDigits: 1 };
  const size = new Intl.NumberFormat(numberLocale(), format).format(length / BYTES_PER_MEGABYTE);
  return fillText(textsForLocale().notice, size);
}
