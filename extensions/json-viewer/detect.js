const MAX_CHARACTERS = 1000000;
const JSON_SUFFIX_TYPE = /^application\/[A-Za-z0-9.-]+\+json$/;
const MAX_BODY_CHILDREN = 2;

function hasJsonContentType() {
  const type = document.contentType;
  return type === "application/json" || type === "text/json" || JSON_SUFFIX_TYPE.test(type);
}

function isFormatterContainer(element) {
  return element.matches("div.json-formatter-container");
}

function hasJsonStructure(children) {
  if (children.length === 0 || children.length > MAX_BODY_CHILDREN) return false;
  return children[0].tagName === "PRE" && children.slice(1).every(isFormatterContainer);
}

function findJsonPre() {
  if (!document.body || !hasJsonContentType()) return null;
  const children = Array.from(document.body.children);
  return hasJsonStructure(children) ? children[0] : null;
}
