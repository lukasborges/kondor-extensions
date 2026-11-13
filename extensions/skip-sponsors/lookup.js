const API_URL = "https://sponsor.ajay.app/api/skipSegments/";
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const HASH_PREFIX_LENGTH = 4;
const FETCH_OPTIONS = { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" };
const segmentsByVideo = new Map();

function currentVideoId() {
  if (location.pathname !== "/watch") return null;
  const id = new URLSearchParams(location.search).get("v");
  return VIDEO_ID_PATTERN.test(id) ? id : null;
}

function findPlayer() {
  return document.getElementById("movie_player");
}

function findVideo() {
  const player = findPlayer();
  return player && player.querySelector("video");
}

function isAdShowing() {
  const player = findPlayer();
  return Boolean(player) && player.classList.contains("ad-showing");
}

function isPlayerEvent(event) {
  return event.target instanceof Element && Boolean(event.target.closest("#movie_player"));
}

async function hashPrefix(videoId) {
  const bytes = new TextEncoder().encode(videoId);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"));
  return hex.join("").slice(0, HASH_PREFIX_LENGTH);
}

function buildSegmentsUrl(prefix) {
  const ids = JSON.stringify(CATEGORIES.map((category) => category.id));
  const actions = JSON.stringify(["skip"]);
  return API_URL + prefix + "?categories=" + encodeURIComponent(ids) + "&actionTypes=" + encodeURIComponent(actions);
}

function isValidSegment(segment) {
  const [start, end] = segment.segment || [];
  return segment.actionType === "skip" && Boolean(findCategory(segment.category)) && start >= 0 && start < end;
}

function pickSegments(answer, videoId) {
  const entry = Array.isArray(answer) && answer.find((item) => item.videoID === videoId);
  if (!entry || !Array.isArray(entry.segments)) return [];
  return entry.segments.filter(isValidSegment).sort((a, b) => a.segment[0] - b.segment[0]);
}

async function fetchSegments(videoId) {
  try {
    const response = await fetch(buildSegmentsUrl(await hashPrefix(videoId)), FETCH_OPTIONS);
    if (response.status !== 200) return [];
    return pickSegments(await response.json(), videoId);
  } catch (error) {
    return [];
  }
}

function hasActiveCategory(values) {
  return CATEGORIES.some((category) => values[category.id] !== "ignore");
}

async function loadSegments(videoId) {
  if (!segmentsByVideo.has(videoId)) segmentsByVideo.set(videoId, await fetchSegments(videoId));
  return segmentsByVideo.get(videoId);
}
