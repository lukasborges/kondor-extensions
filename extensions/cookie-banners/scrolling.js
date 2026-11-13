function removeLockClasses(element, rule) {
  const locks = (rule.scrollLockClasses || []).filter((name) => element.classList.contains(name));
  locks.forEach((name) => element.classList.remove(name));
}

function unlockOverflow(element) {
  if (getComputedStyle(element).overflowY !== "hidden") return;
  element.style.setProperty("overflow-y", "auto", "important");
}

function restoreScrolling(rule) {
  [document.documentElement, document.body].filter(Boolean).forEach((element) => {
    removeLockClasses(element, rule);
    unlockOverflow(element);
  });
}
