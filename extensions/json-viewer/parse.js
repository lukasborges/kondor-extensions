const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function reviveNumber(key, value, context) {
  return typeof value === "number" ? JSON.rawJSON(context.source) : value;
}

function parseJson(text) {
  try {
    return JSON.parse(text, reviveNumber);
  } catch (error) {
    return undefined;
  }
}

function memberPath(parentPath, key) {
  if (!IDENTIFIER.test(key)) return parentPath + "[" + JSON.stringify(key) + "]";
  return parentPath === "" ? key : parentPath + "." + key;
}

function elementPath(parentPath, index) {
  return parentPath + "[" + index + "]";
}

function copiedText(value) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}
