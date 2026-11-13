const NOTICE_SECONDS = 5;
const HOST_STYLE = "position: absolute; right: 12px; bottom: 64px; z-index: 60;";
const NOTICE_CSS = "div { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 4px;" +
  " background: rgba(0, 0, 0, 0.75); color: #fff; font: 14px system-ui, sans-serif; }" +
  " button { background: transparent; border: 1px solid #fff; border-radius: 4px; color: #fff;" +
  " font: inherit; cursor: pointer; }" +
  " button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }";
const notice = { host: null, box: null, timer: null };

function createNoticeHost() {
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  const box = document.createElement("div");
  style.textContent = NOTICE_CSS;
  host.setAttribute("style", HOST_STYLE);
  host.setAttribute("role", "status");
  host.setAttribute("aria-live", "polite");
  root.append(style, box);
  return { host, box };
}

function ensureNoticeHost() {
  const player = findPlayer();
  if (!player) return false;
  if (!notice.host) Object.assign(notice, createNoticeHost());
  if (notice.host.parentNode !== player) player.append(notice.host);
  return true;
}

function createNoticeButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  button.addEventListener("keydown", (event) => event.stopPropagation());
  return button;
}

function showNotice(labelText, button) {
  if (!ensureNoticeHost()) return;
  const parts = labelText ? [Object.assign(document.createElement("span"), { textContent: labelText }), button] : [button];
  notice.box.replaceChildren(...parts);
  notice.host.style.display = "";
}

function hideNotice() {
  clearTimeout(notice.timer);
  notice.timer = null;
  if (notice.host) notice.host.style.display = "none";
}

function showSkipButton(categoryId, onClick) {
  showNotice(null, createNoticeButton(textFor("skip", categoryId), onClick));
}

function showSkippedNotice(categoryId, onUndo) {
  clearTimeout(notice.timer);
  showNotice(textFor("skipped", categoryId), createNoticeButton(textFor("undo"), onUndo));
  notice.timer = setTimeout(hideNotice, NOTICE_SECONDS * 1000);
}

function isNoticeTimerRunning() {
  return notice.timer !== null;
}
