cookieBannerRules.push({
  id: "cookiebot",
  name: "Cookiebot",
  detect: ["#CybotCookiebotDialog"],
  reject: ["#CybotCookiebotDialogBodyButtonDecline"],
  hide: ["#CybotCookiebotDialog", "#CybotCookiebotDialogBodyUnderlay"],
  scrollLockClasses: ["CybotCookiebotDialogActive"],
});
