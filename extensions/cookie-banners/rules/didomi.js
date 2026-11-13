cookieBannerRules.push({
  id: "didomi",
  name: "Didomi",
  detect: ["#didomi-host"],
  reject: ["#didomi-notice-disagree-button"],
  hide: ["#didomi-popup", "#didomi-notice"],
  scrollLockClasses: ["didomi-popup-open"],
});
