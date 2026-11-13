const HIDING_STYLE_ID = "kondor-cookie-banners";

function isValidSelector(selector) {
  try {
    document.querySelector(selector);
    return true;
  } catch (error) {
    return false;
  }
}

function buildHidingCss() {
  const selectors = cookieBannerRules.flatMap((rule) => rule.hide).filter(isValidSelector);
  return selectors.map((selector) => `${selector} { display: none !important; }`).join("\n");
}

function insertHidingStyle() {
  const style = document.createElement("style");
  style.id = HIDING_STYLE_ID;
  style.textContent = buildHidingCss();
  document.documentElement.appendChild(style);
}

function hideBanners() {
  if (document.documentElement) return insertHidingStyle();
  const observer = new MutationObserver(() => {
    if (!document.documentElement) return;
    observer.disconnect();
    insertHidingStyle();
  });
  observer.observe(document, { childList: true });
}
