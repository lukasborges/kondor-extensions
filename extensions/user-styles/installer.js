function findUserCssText() {
  const body = document.body;
  if (!body || body.children.length !== 1) return null;
  return body.children[0].tagName === "PRE" ? body.children[0].textContent : null;
}

function isUserCssPage() {
  const isPlainOrCss = ["text/plain", "text/css"].includes(document.contentType);
  return location.pathname.endsWith(".user.css") && isPlainOrCss;
}

function buildInstalledStyle(result) {
  const { meta, sections } = result;
  const id = `usercss:${meta.namespace}:${meta.name}`;
  const { name, namespace, version, author, description } = meta;
  return { id, name, kind: "usercss", enabled: true, sections, namespace, version, author, description };
}

function createDetailRow(label, lines) {
  const term = createNode("dt", "", label);
  const definition = createNode("dd", "", "");
  definition.append(...lines.map((line) => createNode("div", "", line)));
  return [term, definition];
}

function versionLine(style) {
  const installed = state.styles.find((item) => item.id === style.id);
  if (!installed) return style.version;
  return fillText(textsForLocale().installedVersion, [style.version, installed.version]);
}

function detailRows(style) {
  const texts = textsForLocale();
  const rows = [
    [texts.name, style.name],
    [texts.version, versionLine(style)],
    [texts.author, style.author],
    [texts.description, style.description],
  ];
  return rows.filter((row) => row[1] !== "").map((row) => createDetailRow(row[0], [row[1]]));
}

function createDetails(style) {
  const details = createNode("dl", "details", "");
  const sites = createDetailRow(textsForLocale().sites, describeSites(style));
  details.append(...detailRows(style).flat(), ...sites);
  return details;
}

function showInstalled(installer) {
  const texts = textsForLocale();
  installer.installButton.textContent = texts.installed;
  installer.installButton.disabled = true;
  installer.cancelButton.textContent = texts.close;
}

async function installStyle(installer) {
  const styles = upsertStyle(state.styles, installer.style);
  const error = await saveStyles(styles);
  if (error !== null) return setMessage(installer.view, error, "negative");
  setStyles(styles);
  installer.view.messages.replaceChildren();
  showInstalled(installer);
}

function isInstalled(style) {
  return state.styles.some((item) => item.id === style.id);
}

function showInstallFooter(installer) {
  const texts = textsForLocale();
  const label = isInstalled(installer.style) ? texts.update : texts.install;
  installer.installButton = createButton(label, () => installStyle(installer), true);
  installer.cancelButton = createButton(texts.cancel, closePanel, false);
  setFooter(installer.view, [installer.installButton, installer.cancelButton]);
}

function installErrorText(result) {
  const texts = textsForLocale();
  if (result.error === "preprocessor") return fillText(texts.preprocessorError, [result.preprocessor]);
  return texts.unreadableError;
}

function showInstallError(result) {
  const view = openPanel(textsForLocale().installTitle);
  setMessage(view, installErrorText(result), "negative");
  setFooter(view, [createButton(textsForLocale().close, closePanel, false)]);
}

function showInstaller(result) {
  const style = buildInstalledStyle(result);
  const view = openPanel(textsForLocale().installTitle);
  view.body.append(createDetails(style));
  if (!kondor.isPrivate) return showInstallFooter({ style, view });
  setMessage(view, textsForLocale().privateInstall, "neutral");
  setFooter(view, [createButton(textsForLocale().close, closePanel, false)]);
}

function showInstallResult(result) {
  if (result.error) showInstallError(result);
  else showInstaller(result);
}

function maybeShowInstaller() {
  const text = isUserCssPage() ? findUserCssText() : null;
  if (text !== null) showInstallResult(readUserCss(text));
}
