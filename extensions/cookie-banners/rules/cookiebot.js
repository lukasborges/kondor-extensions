cookieBannerRules.push({
  id: "cookiebot",
  name: "Cookiebot",
  detect: ["#CybotCookiebotDialog"],
  reject: ["#CybotCookiebotDialogBodyButtonDecline", "#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll"],
  hide: ["#CybotCookiebotDialog", "#CybotCookiebotDialogBodyUnderlay"],
  scrollLockClasses: ["CybotCookiebotDialogActive"],
});
