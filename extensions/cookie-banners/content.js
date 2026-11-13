const WATCH_AFTER_LOAD_MS = 60000;
const state = { hideOnly: kondor.settings.values.hideOnly === true, isCheckScheduled: false };

function isDetected(rule) {
  return rule.detect.some((selector) => findElement(document, selector) !== null);
}

function checkRule(rule) {
  if (!isDetected(rule)) return;
  restoreScrolling(rule);
  rejectBanner(rule);
}

function checkPage() {
  cookieBannerRules.forEach(checkRule);
}

function scheduleCheck() {
  if (state.isCheckScheduled) return;
  state.isCheckScheduled = true;
  requestAnimationFrame(() => {
    state.isCheckScheduled = false;
    checkPage();
  });
}

function watchPage() {
  const observer = new MutationObserver(scheduleCheck);
  const options = { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] };
  observer.observe(document, options);
  return observer;
}

function stopWatchingAfterLoad(observer) {
  window.addEventListener("load", () => setTimeout(() => observer.disconnect(), WATCH_AFTER_LOAD_MS));
}

function changeSettings(values) {
  state.hideOnly = values.hideOnly === true;
  scheduleCheck();
}

hideBanners();
checkPage();
stopWatchingAfterLoad(watchPage());
kondor.settings.onChanged(changeSettings);
