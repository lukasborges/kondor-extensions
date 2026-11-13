cookieBannerRules.push({
  id: "sourcepoint",
  name: "Sourcepoint",
  detect: ["[id^=\"sp_message_container_\"]", ".message-container .sp_choice_type_11"],
  reject: [".sp_choice_type_13"],
  hide: ["[id^=\"sp_message_container_\"]"],
  scrollLockClasses: ["sp-message-open"],
});
