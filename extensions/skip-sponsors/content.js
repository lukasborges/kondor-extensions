const SKIP_MARGIN_SECONDS = 0.5;
const state = {
  values: kondor.settings.values,
  videoId: undefined,
  segments: [],
  undone: new Set(),
  buttonSegment: null,
};

function currentSegment(video) {
  return segmentAt(applyingSegments(state.segments, state.values, video.duration), video.currentTime);
}

function canSkip(video, segment) {
  return !state.undone.has(segment) && video.currentTime < segment.segment[1] - SKIP_MARGIN_SECONDS;
}

function undoSkip(video, segment) {
  video.currentTime = segment.segment[0];
  state.undone.add(segment);
  hideNotice();
}

function skipSegment(video, segment) {
  video.currentTime = segment.segment[1];
  showSkippedNotice(segment.category, () => undoSkip(video, segment));
}

function skipFromButton(video, segment) {
  video.currentTime = segment.segment[1];
  state.buttonSegment = null;
  hideNotice();
}

function showButtonFor(video, segment) {
  if (state.buttonSegment === segment) return;
  state.buttonSegment = segment;
  showSkipButton(segment.category, () => skipFromButton(video, segment));
}

function hideUnlessNoticeRunning() {
  state.buttonSegment = null;
  if (!isNoticeTimerRunning()) hideNotice();
}

function updatePlayback(video) {
  const segment = currentSegment(video);
  const mode = segment && state.values[segment.category];
  if (mode === "button") return showButtonFor(video, segment);
  if (mode === "skip" && canSkip(video, segment)) return skipSegment(video, segment);
  hideUnlessNoticeRunning();
}

function handlePlaybackEvent(event) {
  const video = findVideo();
  if (!isPlayerEvent(event) || !video || event.target !== video) return;
  if (isAdShowing()) return hideNotice();
  updatePlayback(video);
}

function redrawMarks() {
  if (state.videoId) drawMarks(state.segments, state.values);
  else removeMarks();
}

function applyLoadedSegments(videoId, segments) {
  if (state.videoId !== videoId) return;
  state.segments = segments;
  redrawMarks();
}

function lookUpCurrentVideo() {
  const videoId = state.videoId;
  if (videoId && hasActiveCategory(state.values)) loadSegments(videoId).then((segments) => applyLoadedSegments(videoId, segments));
}

function resetForVideo(videoId) {
  state.videoId = videoId;
  state.segments = [];
  state.undone.clear();
  state.buttonSegment = null;
  hideNotice();
  removeMarks();
}

function handleNavigation() {
  const videoId = currentVideoId();
  if (videoId === state.videoId) return;
  resetForVideo(videoId);
  lookUpCurrentVideo();
}

function handleMetadataEvent(event) {
  if (!isPlayerEvent(event)) return;
  handleNavigation();
  redrawMarks();
}

function handleDurationEvent(event) {
  if (isPlayerEvent(event)) redrawMarks();
}

function changeSettings(values) {
  const hadActiveCategory = hasActiveCategory(state.values);
  state.values = values;
  redrawMarks();
  if (!hadActiveCategory) lookUpCurrentVideo();
}

handleNavigation();
document.addEventListener("yt-navigate-finish", handleNavigation);
document.addEventListener("loadedmetadata", handleMetadataEvent, true);
document.addEventListener("durationchange", handleDurationEvent, true);
document.addEventListener("timeupdate", handlePlaybackEvent, true);
document.addEventListener("seeked", handlePlaybackEvent, true);
kondor.settings.onChanged(changeSettings);
