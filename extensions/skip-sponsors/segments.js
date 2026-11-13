const DURATION_TOLERANCE_SECONDS = 2;

function matchesDuration(segment, duration) {
  return !segment.videoDuration || Math.abs(segment.videoDuration - duration) <= DURATION_TOLERANCE_SECONDS;
}

function applyingSegments(segments, values, duration) {
  return segments.filter((segment) => values[segment.category] !== "ignore" && matchesDuration(segment, duration));
}

function segmentAt(segments, time) {
  return segments.find((segment) => segment.segment[0] <= time && time < segment.segment[1]);
}
