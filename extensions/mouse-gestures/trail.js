const TRAIL_WIDTH = 3;
const TRAIL_STYLES = [
  ["position", "fixed"],
  ["inset", "0"],
  ["width", "100vw"],
  ["height", "100vh"],
  ["pointer-events", "none"],
  ["z-index", "2147483647"],
  ["margin", "0"],
  ["border", "0"],
  ["padding", "0"],
  ["background", "transparent"],
];

function createTrailCanvas() {
  const canvas = document.createElement("canvas");
  for (const [name, value] of TRAIL_STYLES) canvas.style.setProperty(name, value, "important");
  canvas.width = Math.round(window.innerWidth * window.devicePixelRatio);
  canvas.height = Math.round(window.innerHeight * window.devicePixelRatio);
  return canvas;
}

function createTrailContext(canvas, color) {
  const context = canvas.getContext("2d");
  context.scale(window.devicePixelRatio, window.devicePixelRatio);
  context.lineWidth = TRAIL_WIDTH;
  context.strokeStyle = color;
  context.lineCap = "round";
  context.lineJoin = "round";
  return context;
}

function extendTrail(trail, point) {
  trail.context.beginPath();
  trail.context.moveTo(trail.last.x, trail.last.y);
  trail.context.lineTo(point.x, point.y);
  trail.context.stroke();
  trail.last = point;
}

function createTrail(color, points) {
  const canvas = createTrailCanvas();
  const trail = { canvas, context: createTrailContext(canvas, color), last: points[0] };
  document.documentElement.appendChild(canvas);
  points.slice(1).forEach((point) => extendTrail(trail, point));
  return trail;
}

function removeTrail(trail) {
  trail.canvas.remove();
}
