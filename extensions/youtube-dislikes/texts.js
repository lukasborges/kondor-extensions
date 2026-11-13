const TEXTS = {
  en: { ratioBar: "Likes: %1 · Dislikes: %2", shortsItem: "Dislikes: %1" },
  pt: { ratioBar: "Gostei: %1 · Não gostei: %2", shortsItem: "Não gostei: %1" },
};
const COMPACT_FORMAT = { notation: "compact", maximumFractionDigits: 1 };

function pageLanguage() {
  return document.documentElement.lang || kondor.locale.replace("_", "-");
}

function createFormatter(options) {
  try {
    return new Intl.NumberFormat(pageLanguage(), options);
  } catch (error) {
    return new Intl.NumberFormat("en-US", options);
  }
}

function formatCompact(count) {
  return createFormatter(COMPACT_FORMAT).format(count);
}

function formatFull(count) {
  return createFormatter({}).format(count);
}

function textsForLocale() {
  return kondor.locale.startsWith("pt") ? TEXTS.pt : TEXTS.en;
}

function fillText(template, numbers) {
  return numbers.reduce((text, number, index) => text.replace("%" + (index + 1), number), template);
}

function ratioBarText(votes) {
  return fillText(textsForLocale().ratioBar, [formatFull(votes.likes), formatFull(votes.dislikes)]);
}

function shortsItemText(votes) {
  return fillText(textsForLocale().shortsItem, [formatFull(votes.dislikes)]);
}
