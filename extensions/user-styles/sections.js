const DOCUMENT_RULE = /^@(?:-moz-)?document\b/;
const MATCHER_TYPES = ["url", "url-prefix", "domain", "regexp"];
const QUOTED_ARGUMENT = "\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'";
const MATCHER_PATTERN = new RegExp(`\\s*([a-z-]+)\\(\\s*(${QUOTED_ARGUMENT}|[^)]*?)\\s*\\)\\s*(?:,|$)`, "y");

function endOfComment(code, index) {
  const end = code.indexOf("*/", index + 2);
  return end === -1 ? code.length : end + 2;
}

function endOfString(code, index) {
  let position = index + 1;
  while (position < code.length && code[position] !== code[index]) {
    position += code[position] === "\\" ? 2 : 1;
  }
  return Math.min(position + 1, code.length);
}

function skipLiteral(code, index) {
  if (code.startsWith("/*", index)) return endOfComment(code, index);
  if (code[index] === '"' || code[index] === "'") return endOfString(code, index);
  return index;
}

function braceDelta(character) {
  if (character === "{") return 1;
  return character === "}" ? -1 : 0;
}

function findOutsideLiterals(code, target, from) {
  let position = from;
  while (position < code.length) {
    const skipped = skipLiteral(code, position);
    if (skipped === position && code[position] === target) return position;
    position = Math.max(skipped, position + 1);
  }
  return -1;
}

function findClosingBrace(code, openIndex) {
  let depth = 0;
  let position = openIndex;
  while (position < code.length) {
    const skipped = skipLiteral(code, position);
    if (skipped === position) depth += braceDelta(code[position]);
    if (skipped === position && depth === 0) return position;
    position = Math.max(skipped, position + 1);
  }
  return -1;
}

function unquote(raw) {
  if (raw[0] !== '"' && raw[0] !== "'") return raw;
  return raw.slice(1, -1).replace(/\\(.)/g, "$1");
}

function parseMatchers(header) {
  const matchers = [];
  MATCHER_PATTERN.lastIndex = 0;
  while (MATCHER_PATTERN.lastIndex < header.length) {
    const found = MATCHER_PATTERN.exec(header);
    if (!found || !MATCHER_TYPES.includes(found[1])) return null;
    matchers.push({ type: found[1], value: unquote(found[2]) });
  }
  return matchers.length > 0 ? matchers : null;
}

function takePlain(scan, end) {
  scan.plain += scan.code.slice(scan.position, end);
  scan.position = end;
}

function flushPlain(scan) {
  if (scan.plain.trim() !== "") scan.sections.push({ matchers: [], css: scan.plain });
  scan.plain = "";
}

function documentHeader(scan, openIndex) {
  return scan.code.slice(scan.position, openIndex).replace(DOCUMENT_RULE, "").trim();
}

function readDocumentBlock(scan) {
  flushPlain(scan);
  const open = findOutsideLiterals(scan.code, "{", scan.position);
  const close = open === -1 ? -1 : findClosingBrace(scan.code, open);
  const matchers = close === -1 ? null : parseMatchers(documentHeader(scan, open));
  scan.failed = matchers === null;
  if (scan.failed) return;
  scan.sections.push({ matchers, css: scan.code.slice(open + 1, close) });
  scan.position = close + 1;
}

function startsDocumentRule(scan) {
  return scan.depth === 0 && DOCUMENT_RULE.test(scan.code.slice(scan.position, scan.position + 16));
}

function scanStep(scan) {
  const skipped = skipLiteral(scan.code, scan.position);
  if (skipped > scan.position) return takePlain(scan, skipped);
  if (startsDocumentRule(scan)) return readDocumentBlock(scan);
  scan.depth = Math.max(0, scan.depth + braceDelta(scan.code[scan.position]));
  takePlain(scan, scan.position + 1);
}

function splitSections(code) {
  const scan = { code, position: 0, depth: 0, plain: "", sections: [], failed: false };
  while (!scan.failed && scan.position < code.length) scanStep(scan);
  if (scan.failed) return null;
  flushPlain(scan);
  return scan.sections;
}
