const MIN_SPEED = 0.1;
const MAX_SPEED = 16;
const NORMAL_SPEED = 1;
const speed = { current: NORMAL_SPEED };

function clampSpeed(value) {
  return Math.round(Math.min(MAX_SPEED, Math.max(MIN_SPEED, value)) * 100) / 100;
}

function isValidSpeed(value) {
  return typeof value === "number" && value >= MIN_SPEED && value <= MAX_SPEED;
}

function changeSpeedBy(delta) {
  speed.current = clampSpeed(speed.current + delta);
}

function resetSpeedToNormal() {
  speed.current = NORMAL_SPEED;
}

function applySpeed(video) {
  if (video.playbackRate !== speed.current) video.playbackRate = speed.current;
}

function applySpeedToAllVideos() {
  document.querySelectorAll("video").forEach(applySpeed);
}

function speedStorageKey() {
  return "speed:" + location.hostname;
}

function saveSpeed() {
  kondor.storage.set(speedStorageKey(), speed.current).catch(() => {});
}

function forgetSpeed() {
  kondor.storage.remove(speedStorageKey()).catch(() => {});
}

function restoreSpeed() {
  kondor.storage.get(speedStorageKey()).then(useSavedSpeed).catch(() => {});
}

function useSavedSpeed(saved) {
  if (!isValidSpeed(saved)) return;
  speed.current = saved;
  applySpeedToAllVideos();
}
