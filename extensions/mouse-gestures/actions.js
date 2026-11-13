function scrollToBottom() {
  window.scrollTo({ top: document.scrollingElement.scrollHeight });
}

const ACTIONS = {
  none: () => {},
  back: () => kondor.tabs.back(),
  forward: () => kondor.tabs.forward(),
  reload: () => kondor.tabs.reload(),
  closeTab: () => kondor.tabs.close(),
  duplicateTab: () => kondor.tabs.open(location.href, { background: false }),
  nextTab: () => kondor.tabs.next(),
  previousTab: () => kondor.tabs.previous(),
  scrollTop: () => window.scrollTo({ top: 0 }),
  scrollBottom: scrollToBottom,
};

function actionNamed(name) {
  return Object.hasOwn(ACTIONS, name) ? ACTIONS[name] : ACTIONS.none;
}

function runAction(name) {
  Promise.resolve().then(actionNamed(name)).catch(() => {});
}
