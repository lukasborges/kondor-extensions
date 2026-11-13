const DOUBLE_RIGHT_CLICK_MILLISECONDS = 500;
const AFTER_GESTURE_MILLISECONDS = 100;
const tracker = { session: null, plainClick: null, gestureEndedAt: -Infinity };

function pointOf(event) {
  return { x: event.clientX, y: event.clientY };
}

function isRightPress(event) {
  return event.button === 2 && event.buttons === 2;
}

function isDoubleRightClick(event, minimumDistance) {
  const click = tracker.plainClick;
  if (!click) return false;
  const isQuick = event.timeStamp - click.time <= DOUBLE_RIGHT_CLICK_MILLISECONDS;
  return isQuick && distanceBetween(click, pointOf(event)) <= minimumDistance;
}

function isJustAfterGesture(event) {
  return event.timeStamp - tracker.gestureEndedAt <= AFTER_GESTURE_MILLISECONDS;
}

function startTracking(event, values) {
  const start = pointOf(event);
  tracker.session = { values, points: [start], directions: createDirections(start), trail: null };
}

function finishTracking() {
  const session = tracker.session;
  tracker.session = null;
  if (session.trail) removeTrail(session.trail);
  return session;
}

function cancelTracking() {
  if (tracker.session) finishTracking();
}

function extendSession(session, point) {
  if (session.trail) return extendTrail(session.trail, point);
  session.points.push(point);
  const { values, directions } = session;
  if (addPointToDirections(directions, point, values.minimumDistance)) {
    session.trail = createTrail(values.trailColor, session.points);
  }
}

function rememberPlainClick(event) {
  tracker.plainClick = { ...pointOf(event), time: event.timeStamp };
}

function handleMouseDown(event, values) {
  if (!isRightPress(event) || tracker.session) return;
  if (!isDoubleRightClick(event, values.minimumDistance)) return startTracking(event, values);
  tracker.plainClick = null;
}

function handleMouseMove(event) {
  if (!tracker.session) return;
  if ((event.buttons & 2) === 0) return cancelTracking();
  extendSession(tracker.session, pointOf(event));
}

function handleMouseUp(event) {
  if (event.button !== 2 || !tracker.session) return;
  const { values, directions } = finishTracking();
  if (directions.sequence.length === 0) return rememberPlainClick(event);
  tracker.gestureEndedAt = event.timeStamp;
  runAction(values[gestureKeyFor(directions.sequence)]);
}

function handleKeyDown(event) {
  if (event.key !== "Escape" || !tracker.session) return;
  event.preventDefault();
  cancelTracking();
}

function handleContextMenu(event) {
  if (tracker.session || isJustAfterGesture(event)) event.preventDefault();
}

function handleAuxClick(event) {
  if (event.button !== 2 || !isJustAfterGesture(event)) return;
  event.preventDefault();
  event.stopPropagation();
}
