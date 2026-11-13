const GESTURE_KEYS = {
  L: "left",
  R: "right",
  U: "up",
  D: "down",
  UD: "upDown",
  DU: "downUp",
  DR: "downRight",
  DL: "downLeft",
};

function distanceBetween(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function directionBetween(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "L" : "R";
  return dy < 0 ? "U" : "D";
}

function createDirections(start) {
  return { anchor: start, sequence: [] };
}

function appendDirection(directions, direction) {
  const last = directions.sequence[directions.sequence.length - 1];
  if (last === direction) return false;
  directions.sequence.push(direction);
  return true;
}

function addPointToDirections(directions, point, minimumDistance) {
  if (distanceBetween(directions.anchor, point) < minimumDistance) return false;
  const direction = directionBetween(directions.anchor, point);
  directions.anchor = point;
  return appendDirection(directions, direction);
}

function gestureKeyFor(sequence) {
  return GESTURE_KEYS[sequence.join("")];
}
