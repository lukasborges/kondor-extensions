const COLOR_PARSER = document.createElement("canvas").getContext("2d");
const UNPARSED_VALUES = ["transparent", "currentcolor", "inherit", "initial", "unset"];
const SEPIA_MATRIX = [[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]];
const GRADIENT = /(?:linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)/g;
const COLOR_TOKEN = /#[0-9a-f]{3,8}\b|(?:rgb|hsl)a?\([^)]*\)|\b[a-z]+\b/gi;
const parsedColors = new Map();
const adjustment = { brightness: 100, contrast: 100, sepia: 0 };

const LIGHTNESS_BY_ROLE = {
  background: (l) => (l <= 0.3 ? l : 0.1 + (0.2 * (1 - l)) / 0.7),
  text: (l) => (l >= 0.6 ? l : 0.6 + (0.3 * (0.6 - l)) / 0.6),
  border: (l) => 0.2 + 0.3 * (1 - l),
};

const ROLE_BY_PROPERTY = {
  "background-color": "background",
  "background-image": "background",
  "color": "text",
  "text-decoration-color": "text",
  "caret-color": "text",
  "fill": "text",
  "stroke": "text",
  "border-top-color": "border",
  "border-right-color": "border",
  "border-bottom-color": "border",
  "border-left-color": "border",
  "outline-color": "border",
  "column-rule-color": "border",
};

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

function readCanvasColor(text, sentinel) {
  COLOR_PARSER.fillStyle = sentinel;
  COLOR_PARSER.fillStyle = text;
  return COLOR_PARSER.fillStyle;
}

function hexChannels(hex) {
  const number = parseInt(hex.slice(1), 16);
  return { r: ((number >> 16) & 255) / 255, g: ((number >> 8) & 255) / 255, b: (number & 255) / 255, a: 1 };
}

function channelsOf(canvasColor) {
  if (canvasColor.startsWith("#")) return hexChannels(canvasColor);
  const [r, g, b, a = 1] = canvasColor.match(/[\d.]+/g).map(Number);
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

function parseColorText(text) {
  if (!text || UNPARSED_VALUES.includes(text)) return null;
  const first = readCanvasColor(text, "#010203");
  if (first !== readCanvasColor(text, "#040506")) return null;
  return channelsOf(first);
}

function parseColor(value) {
  const text = value.trim().toLowerCase();
  if (!parsedColors.has(text)) parsedColors.set(text, parseColorText(text));
  return parsedColors.get(text);
}

function hueOf(color, max, delta) {
  if (max === color.r) return ((((color.g - color.b) / delta) % 6) + 6) % 6 * 60;
  if (max === color.g) return ((color.b - color.r) / delta + 2) * 60;
  return ((color.r - color.g) / delta + 4) * 60;
}

function toHsl(color) {
  const max = Math.max(color.r, color.g, color.b);
  const delta = max - Math.min(color.r, color.g, color.b);
  const l = max - delta / 2;
  if (delta === 0) return { h: 0, s: 0, l, a: color.a };
  return { h: hueOf(color, max, delta), s: delta / (1 - Math.abs(2 * l - 1)), l, a: color.a };
}

function hslChannel(hsl, offset) {
  const k = (offset + hsl.h / 30) % 12;
  const spread = hsl.s * Math.min(hsl.l, 1 - hsl.l);
  return hsl.l - spread * Math.max(-1, Math.min(k - 3, 9 - k, 1));
}

function toRgb(hsl) {
  return { r: hslChannel(hsl, 0), g: hslChannel(hsl, 8), b: hslChannel(hsl, 4), a: hsl.a };
}

function remapLightness(color, role) {
  const hsl = toHsl(color);
  return toRgb({ ...hsl, l: LIGHTNESS_BY_ROLE[role](hsl.l) });
}

function mapChannels(color, convert) {
  return { r: convert(color.r), g: convert(color.g), b: convert(color.b), a: color.a };
}

function applyBrightness(color) {
  return mapChannels(color, (x) => clamp((x * adjustment.brightness) / 100));
}

function applyContrast(color) {
  return mapChannels(color, (x) => clamp(((x - 0.5) * adjustment.contrast) / 100 + 0.5));
}

function mixChannel(original, toned, amount) {
  return clamp(original * (1 - amount) + toned * amount);
}

function applySepia(color) {
  const amount = adjustment.sepia / 100;
  const [r, g, b] = SEPIA_MATRIX.map((row) => row[0] * color.r + row[1] * color.g + row[2] * color.b);
  return { r: mixChannel(color.r, r, amount), g: mixChannel(color.g, g, amount), b: mixChannel(color.b, b, amount), a: color.a };
}

function formatColor(color) {
  const [r, g, b] = [color.r, color.g, color.b].map((x) => Math.round(clamp(x) * 255));
  return color.a < 1 ? `rgba(${r}, ${g}, ${b}, ${color.a})` : `rgb(${r}, ${g}, ${b})`;
}

function transformColor(value, role) {
  const color = parseColor(value);
  if (!color) return null;
  return formatColor(applySepia(applyContrast(applyBrightness(remapLightness(color, role)))));
}

function transformGradientColors(gradient) {
  return gradient.replace(COLOR_TOKEN, (token) => transformColor(token, "background") || token);
}

function transformGradients(value) {
  const transformed = value.replace(GRADIENT, transformGradientColors);
  return transformed === value ? null : transformed;
}

function transformValue(property, value) {
  if (property === "background-image") return transformGradients(value);
  return transformColor(value, ROLE_BY_PROPERTY[property]);
}
