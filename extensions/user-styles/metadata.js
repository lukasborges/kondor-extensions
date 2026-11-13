const METADATA_BLOCK = new RegExp("/\\*\\s*==UserStyle==([\\s\\S]*?)==/UserStyle==\\s*\\*/");
const ENTRY_PATTERN = /^\s*@(\S+)\s*(.*)$/;
const EOT_PATTERN = /<<<EOT\s*([\s\S]*?)\s*EOT;/g;
const USO_PLACEHOLDER = new RegExp("/\\*\\[\\[([^\\]]+)\\]\\]\\*/", "g");
const VARIABLE_KEYS = ["var", "advanced"];
const META_KEYS = ["name", "namespace", "version", "description", "author", "preprocessor"];
const TOKEN = `"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\\S+`;
const VARIABLE_PATTERN = new RegExp(`^(\\S+)\\s+(\\S+)\\s+(${TOKEN})\\s*([\\s\\S]*)$`);
const OPTION_PATTERN = new RegExp(`(\\S+)\\s+(${TOKEN})\\s+(${TOKEN})`, "g");

function bracketDelta(character) {
  if (character === "{" || character === "[") return 1;
  return character === "}" || character === "]" ? -1 : 0;
}

function bracketBalance(text) {
  let balance = 0;
  let position = 0;
  while (position < text.length) {
    const skipped = skipLiteral(text, position);
    if (skipped === position) balance += bracketDelta(text[position]);
    position = Math.max(skipped, position + 1);
  }
  return balance;
}

function isOpenVariable(entry) {
  return VARIABLE_KEYS.includes(entry.key) && bracketBalance(entry.text) > 0;
}

function addEntry(entries, line) {
  const found = ENTRY_PATTERN.exec(line);
  if (found) entries.push({ key: found[1], text: found[2] });
}

function readEntries(body) {
  const entries = [];
  for (const line of body.split("\n")) {
    const last = entries[entries.length - 1];
    if (last && isOpenVariable(last)) last.text += "\n" + line;
    else addEntry(entries, line);
  }
  return entries;
}

function stringValue(token) {
  if (token[0] === '"') return parseJson(token, token.slice(1, -1));
  return token[0] === "'" ? token.slice(1, -1) : token;
}

function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return fallback;
  }
}

function arrayOptions(items) {
  return items.map((item) => ({ name: String(item), label: String(item), value: String(item).replace(/\*$/, "") }));
}

function objectOptions(object) {
  return Object.entries(object).map(([label, value]) => ({ name: label, label, value: String(value) }));
}

function usoOptions(text) {
  const inner = text.trim().replace(/^\{/, "").replace(/\}$/, "");
  return Array.from(inner.matchAll(OPTION_PATTERN), (found) => ({
    name: found[1],
    label: stringValue(found[2]),
    value: stringValue(found[3]),
  }));
}

function parseOptions(text) {
  const parsed = parseJson(text, null);
  if (Array.isArray(parsed)) return arrayOptions(parsed);
  return parsed && typeof parsed === "object" ? objectOptions(parsed) : usoOptions(text);
}

function chooseOption(options) {
  const marked = options.find((option) => option.name.endsWith("*") || option.label.endsWith("*"));
  const chosen = marked || options[0];
  return chosen ? chosen.value : null;
}

function rangeDefault(text) {
  const parsed = parseJson(text, null);
  if (!Array.isArray(parsed)) return parsed === null ? text : String(parsed);
  return String(parsed[0]) + (parsed[4] === undefined ? "" : parsed[4]);
}

function defaultValue(type, text) {
  if (type === "checkbox") return text === "1" ? "1" : "0";
  if (type === "range" || type === "number") return rangeDefault(text);
  if (["select", "dropdown", "image"].includes(type)) return chooseOption(parseOptions(text));
  return text === "" ? null : text;
}

function parseVariable(text) {
  const found = VARIABLE_PATTERN.exec(text.trim());
  const value = found ? defaultValue(found[1], found[4].trim()) : null;
  return value === null ? null : { name: found[2], value };
}

function readMeta(entries) {
  const meta = { name: "", namespace: "", version: "", description: "", author: "", preprocessor: "" };
  for (const entry of entries) {
    if (META_KEYS.includes(entry.key)) meta[entry.key] = entry.text.trim();
  }
  return meta;
}

function readVariables(entries) {
  const variables = entries.filter((entry) => VARIABLE_KEYS.includes(entry.key)).map((entry) => parseVariable(entry.text));
  return variables.includes(null) ? null : variables;
}

function applyUsoVariables(code, variables) {
  const values = new Map(variables.map((variable) => [variable.name, variable.value]));
  return code.replace(USO_PLACEHOLDER, (match, name) => (values.has(name) ? values.get(name) : match));
}

function rootRule(variables) {
  const declarations = variables.map((variable) => `--${variable.name}: ${variable.value};`);
  return `:root { ${declarations.join(" ")} }`;
}

function withRootRule(sections, variables) {
  if (variables.length === 0 || sections.length === 0) return sections;
  const first = { ...sections[0], css: rootRule(variables) + "\n" + sections[0].css };
  return [first, ...sections.slice(1)];
}

function buildStyleSections(code, meta, variables) {
  const preprocessed = meta.preprocessor === "uso" ? applyUsoVariables(code, variables) : code;
  const sections = splitSections(preprocessed);
  if (sections === null) return null;
  return meta.preprocessor === "uso" ? sections : withRootRule(sections, variables);
}

function isSupportedPreprocessor(preprocessor) {
  return ["", "default", "uso"].includes(preprocessor);
}

function readUserCss(text) {
  const block = METADATA_BLOCK.exec(text);
  if (!block) return { error: "unreadable" };
  const entries = readEntries(block[1].replace(EOT_PATTERN, (match, content) => JSON.stringify(content)));
  const meta = readMeta(entries);
  if (meta.name === "") return { error: "unreadable" };
  if (!isSupportedPreprocessor(meta.preprocessor)) return { error: "preprocessor", preprocessor: meta.preprocessor };
  const variables = readVariables(entries);
  const sections = variables && buildStyleSections(text.slice(block.index + block[0].length), meta, variables);
  return sections ? { meta, sections } : { error: "unreadable" };
}
