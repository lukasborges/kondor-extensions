kondor.settings.onChanged((values) => {
  document.documentElement.toggleAttribute("data-sample", values.enabled);
});
