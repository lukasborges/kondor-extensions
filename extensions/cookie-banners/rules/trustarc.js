cookieBannerRules.push({
  id: "trustarc",
  name: "TrustArc",
  detect: ["#truste-consent-track"],
  reject: ["#truste-consent-required"],
  hide: ["#truste-consent-track", ".truste_overlay", ".truste_box_overlay"],
  scrollLockClasses: [],
});
