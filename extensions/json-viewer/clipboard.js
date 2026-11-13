const COPIED_DURATION_MS = 2000;
const feedbackTimers = new WeakMap();

function copyText(text) {
  const putText = (event) => {
    event.clipboardData.setData("text/plain", text);
    event.preventDefault();
  };
  document.addEventListener("copy", putText, { once: true });
  const isCopied = document.execCommand("copy");
  document.removeEventListener("copy", putText);
  return isCopied;
}

function setButtonLabel(button, label) {
  button.textContent = label;
}

function restoreLabelLater(button) {
  clearTimeout(feedbackTimers.get(button));
  const restore = () => setButtonLabel(button, button.dataset.label);
  feedbackTimers.set(button, setTimeout(restore, COPIED_DURATION_MS));
}

function copyWithFeedback(button, text) {
  if (!copyText(text)) return;
  setButtonLabel(button, textsForLocale().copied);
  restoreLabelLater(button);
}
