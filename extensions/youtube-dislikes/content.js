const REFRESH_INTERVAL_MS = 1000;
const state = { values: kondor.settings.values, videoId: null, votes: null };

function removeAddedElements() {
  document.querySelectorAll('[class*="kondor-youtube-dislikes-"]').forEach((element) => element.remove());
  clearWatchWidth();
}

function acceptVotes(videoId, votes) {
  if (state.videoId !== videoId) return;
  state.votes = votes;
  refresh();
}

function resetForVideo(videoId) {
  state.videoId = videoId;
  state.votes = null;
  removeAddedElements();
  if (videoId) loadVotes(videoId).then((votes) => acceptVotes(videoId, votes));
}

function draw() {
  if (!state.votes) return;
  if (isWatchPage()) drawWatch(state.votes, state.values.showRatioBar);
  else drawShorts(state.votes);
}

function refresh() {
  const videoId = currentVideoId();
  if (videoId !== state.videoId) resetForVideo(videoId);
  draw();
}

function changeSettings(values) {
  state.values = values;
  refresh();
}

refresh();
document.addEventListener("yt-navigate-finish", refresh);
setInterval(refresh, REFRESH_INTERVAL_MS);
kondor.settings.onChanged(changeSettings);
