cookieBannerRules.push({
  id: "usercentrics",
  name: "Usercentrics",
  detect: ["#usercentrics-root"],
  reject: ["button[data-testid=\"uc-deny-all-button\"]"],
  shadowHost: "#usercentrics-root",
  hide: ["#usercentrics-root"],
  scrollLockClasses: [],
});
