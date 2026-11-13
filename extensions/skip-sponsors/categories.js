const CATEGORIES = [
  { id: "sponsor", color: "#00d400", names: { en: "Sponsor", pt: "Patrocínio" } },
  { id: "selfpromo", color: "#ffff00", names: { en: "Self-promotion", pt: "Autopromoção" } },
  { id: "interaction", color: "#cc00ff", names: { en: "Interaction reminder", pt: "Lembrete de interação" } },
  { id: "intro", color: "#00ffff", names: { en: "Intro", pt: "Introdução" } },
  { id: "outro", color: "#0202ed", names: { en: "Outro", pt: "Encerramento" } },
  { id: "preview", color: "#008fd6", names: { en: "Preview", pt: "Prévia" } },
  { id: "filler", color: "#7300ff", names: { en: "Filler", pt: "Enrolação" } },
];
const TEXTS = {
  en: { skip: "Skip %1", skipped: "Skipped: %1", undo: "Undo" },
  pt: { skip: "Pular %1", skipped: "Pulado: %1", undo: "Desfazer" },
};

function currentLanguage() {
  return String(kondor.locale).startsWith("pt") ? "pt" : "en";
}

function findCategory(id) {
  return CATEGORIES.find((category) => category.id === id);
}

function categoryName(id) {
  return findCategory(id).names[currentLanguage()];
}

function textFor(key, id) {
  const text = TEXTS[currentLanguage()][key];
  return id ? text.replace("%1", categoryName(id)) : text;
}
