const setUpVideos = new WeakSet();
const pendingVideos = new Set();
const activeVideo = { element: null };

function videosIn(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const own = node.localName === "video" ? [node] : [];
  return own.concat(Array.from(node.querySelectorAll("video")));
}

function listenToVideo(video) {
  video.addEventListener("loadedmetadata", () => applySpeed(video));
  video.addEventListener("play", () => {
    activeVideo.element = video;
    applySpeed(video);
  });
}

function setUpVideo(video) {
  if (!setUpVideos.has(video)) {
    setUpVideos.add(video);
    listenToVideo(video);
  }
  applySpeed(video);
  ensureOverlay(video);
}

function setUpPendingVideos() {
  pendingVideos.forEach((video) => {
    if (video.isConnected) setUpVideo(video);
  });
  pendingVideos.clear();
}

function queueNodeVideos(node) {
  const wasIdle = pendingVideos.size === 0;
  videosIn(node).forEach((video) => pendingVideos.add(video));
  if (wasIdle && pendingVideos.size > 0) requestAnimationFrame(setUpPendingVideos);
}

function forgetNodeVideos(node) {
  videosIn(node).filter((video) => !video.isConnected).forEach(removeOverlay);
}

function handleMutations(records) {
  for (const record of records) {
    record.removedNodes.forEach(forgetNodeVideos);
    record.addedNodes.forEach(queueNodeVideos);
  }
}

function watchVideos() {
  document.querySelectorAll("video").forEach(setUpVideo);
  new MutationObserver(handleMutations).observe(document, { childList: true, subtree: true });
}

function hasVideo() {
  return document.querySelector("video") !== null;
}

function findActiveVideo() {
  const played = activeVideo.element;
  return played && played.isConnected ? played : document.querySelector("video");
}

function clampTime(time, video) {
  const end = Number.isFinite(video.duration) ? video.duration : Infinity;
  return Math.min(end, Math.max(0, time));
}

function moveActiveVideo(seconds) {
  const video = findActiveVideo();
  if (video) video.currentTime = clampTime(video.currentTime + seconds, video);
}
