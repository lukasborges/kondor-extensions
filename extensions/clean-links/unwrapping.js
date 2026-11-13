function matchesRedirectRule(rule, url) {
  if (!rule.host.test(url.hostname)) return false;
  return !rule.path || rule.path === url.pathname;
}

function firstTarget(url, names) {
  return names.map(name => url.searchParams.get(name)).find(value => value) || "";
}

function unwrapUrl(text) {
  const url = parseHttpUrl(text);
  const rule = url && cleanLinksRedirectRules.find(candidate => matchesRedirectRule(candidate, url));
  if (!rule) return text;
  const target = firstTarget(url, rule.parameters);
  return parseHttpUrl(target) ? target : text;
}
