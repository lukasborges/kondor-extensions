const API_URL = "https://returnyoutubedislikeapi.com/votes?videoId=";
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const SHORT_PATH_PATTERN = /^\/shorts\/([A-Za-z0-9_-]{11})\/?$/;
const FETCH_OPTIONS = { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" };
const votesByVideo = new Map();

function isWatchPage() {
  return location.pathname === "/watch";
}

function watchVideoId() {
  const id = new URLSearchParams(location.search).get("v");
  return VIDEO_ID_PATTERN.test(id) ? id : null;
}

function shortVideoId() {
  const match = SHORT_PATH_PATTERN.exec(location.pathname);
  return match ? match[1] : null;
}

function currentVideoId() {
  return isWatchPage() ? watchVideoId() : shortVideoId();
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function parseVotes(videoId, body) {
  if (!body || body.id !== videoId || !isCount(body.likes) || !isCount(body.dislikes)) return null;
  return { likes: body.likes, dislikes: body.dislikes };
}

async function requestVotes(videoId) {
  const response = await fetch(API_URL + encodeURIComponent(videoId), FETCH_OPTIONS);
  if (response.status !== 200) return null;
  return parseVotes(videoId, await response.json());
}

async function fetchVotes(videoId) {
  try {
    return await requestVotes(videoId);
  } catch (error) {
    return null;
  }
}

function loadVotes(videoId) {
  if (!votesByVideo.has(videoId)) votesByVideo.set(videoId, fetchVotes(videoId));
  return votesByVideo.get(videoId);
}
