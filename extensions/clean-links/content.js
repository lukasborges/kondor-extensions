let cleanLinksSettings = readCleanLinksSettings(kondor.settings.values);

function cleanAddress() {
  const cleaned = cleanUrl(location.href, cleanLinksSettings);
  if (cleaned === location.href) return;
  try {
    history.replaceState(history.state, "", cleaned);
  } catch (error) {
    return;
  }
}

function findLink(event) {
  if (!(event.target instanceof Element)) return null;
  const link = event.target.closest("a[href], area[href]");
  return link && typeof link.href === "string" ? link : null;
}

function cleanLink(event) {
  const link = findLink(event);
  if (!link) return;
  const cleaned = cleanUrl(unwrapUrl(link.href), cleanLinksSettings);
  if (cleaned !== link.href) link.href = cleaned;
}

function listenToLinkEvents() {
  const names = ["mouseover", "focusin", "click", "auxclick", "contextmenu"];
  names.forEach(name => document.addEventListener(name, cleanLink, true));
}

cleanAddress();
listenToLinkEvents();
kondor.settings.onChanged(values => {
  cleanLinksSettings = readCleanLinksSettings(values);
});
