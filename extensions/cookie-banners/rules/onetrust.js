cookieBannerRules.push({
  id: "onetrust",
  name: "OneTrust",
  detect: ["#onetrust-banner-sdk"],
  reject: ["#onetrust-reject-all-handler"],
  hide: ["#onetrust-banner-sdk", ".onetrust-pc-dark-filter"],
  scrollLockClasses: [],
});
