const state = { styles: [], sheet: null };

async function loadStyles() {
  try {
    const styles = await kondor.storage.get("styles");
    return Array.isArray(styles) ? styles : [];
  } catch (error) {
    return [];
  }
}

function errorMessage(error) {
  return error && error.message ? error.message : String(error);
}

async function saveStyles(styles) {
  try {
    await kondor.storage.set("styles", styles);
    return null;
  } catch (error) {
    return errorMessage(error);
  }
}

function siteStyleId(host) {
  return "site:" + host;
}

function createSiteStyle(host, css) {
  const sections = [{ matchers: [{ type: "host", value: host }], css }];
  const empty = { namespace: "", version: "", author: "", description: "" };
  return { id: siteStyleId(host), name: host, kind: "site", enabled: true, sections, ...empty };
}

function findSiteCss(styles, host) {
  const style = styles.find((item) => item.id === siteStyleId(host));
  return style ? style.sections[0].css : "";
}

function withSiteCss(styles, host, css) {
  const others = styles.filter((style) => style.id !== siteStyleId(host));
  if (css.trim() === "") return others;
  const created = createSiteStyle(host, css);
  const index = styles.findIndex((style) => style.id === created.id);
  return index === -1 ? [...others, created] : [...styles.slice(0, index), created, ...styles.slice(index + 1)];
}

function upsertStyle(styles, style) {
  const index = styles.findIndex((item) => item.id === style.id);
  if (index === -1) return [...styles, style];
  const replaced = { ...style, enabled: styles[index].enabled };
  return [...styles.slice(0, index), replaced, ...styles.slice(index + 1)];
}

function withEnabled(styles, id, enabled) {
  return styles.map((style) => (style.id === id ? { ...style, enabled } : style));
}

function withoutStyle(styles, id) {
  return styles.filter((style) => style.id !== id);
}

function withStyleAt(styles, style, index) {
  return [...styles.slice(0, index), style, ...styles.slice(index)];
}
