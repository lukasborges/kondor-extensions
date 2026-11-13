const MARKS_CLASS = "kondor-skip-sponsors-marks";
const MARKS_STYLE = "position: absolute; inset: 0; pointer-events: none; z-index: 40;";
const MIN_MARK_WIDTH = "2px";

function removeMarks() {
  document.querySelectorAll("." + MARKS_CLASS).forEach((container) => container.remove());
}

function percentOf(seconds, duration) {
  return (seconds / duration) * 100 + "%";
}

function createMark(segment, duration) {
  const [start, end] = segment.segment;
  const mark = document.createElement("div");
  const style = "position: absolute; top: 0; height: 100%; min-width: " + MIN_MARK_WIDTH + ";";
  mark.setAttribute("style", style + " left: " + percentOf(start, duration) + "; width: " + percentOf(end - start, duration) + ";");
  mark.style.backgroundColor = findCategory(segment.category).color;
  return mark;
}

function createMarksContainer(segments, duration) {
  const container = document.createElement("div");
  container.className = MARKS_CLASS;
  container.setAttribute("style", MARKS_STYLE);
  segments.forEach((segment) => container.append(createMark(segment, duration)));
  return container;
}

function drawMarks(segments, values) {
  removeMarks();
  const video = findVideo();
  const bar = document.querySelector("#movie_player .ytp-progress-bar");
  if (!video || !bar || !Number.isFinite(video.duration)) return;
  bar.append(createMarksContainer(applyingSegments(segments, values, video.duration), video.duration));
}
