function parseHttpUrl(text) {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch (error) {
    return null;
  }
}

function hostMatches(host, name) {
  return host === name || host.endsWith("." + name);
}

function isKeptHost(host, settings) {
  return settings.keptSites.some(name => hostMatches(host, name));
}

function parameterMatches(name, pattern) {
  if (pattern.endsWith("*")) return name.startsWith(pattern.slice(0, -1));
  return name === pattern;
}

function decodeParameterName(segment) {
  const raw = segment.split("=")[0].replace(/\+/g, " ");
  try {
    return decodeURIComponent(raw).toLowerCase();
  } catch (error) {
    return raw.toLowerCase();
  }
}

function isRuleForHost(rule, host) {
  return rule.hosts.some(name => name === "*" || hostMatches(host, name));
}

function trackingParameters(host, settings) {
  return cleanLinksParameterRules
    .filter(rule => isRuleForHost(rule, host))
    .flatMap(rule => rule.parameters.map(name => name.toLowerCase()))
    .concat(settings.extraParameters);
}

function isTrackingSegment(segment, patterns) {
  const name = decodeParameterName(segment);
  return patterns.some(pattern => parameterMatches(name, pattern));
}

function splitFragment(text) {
  const hashAt = text.indexOf("#");
  if (hashAt < 0) return { rest: text, fragment: "" };
  return { rest: text.slice(0, hashAt), fragment: text.slice(hashAt) };
}

function splitQuery(text) {
  const queryAt = text.indexOf("?");
  if (queryAt < 0) return { base: text, query: null };
  return { base: text.slice(0, queryAt), query: text.slice(queryAt + 1) };
}

function removeTracking(text, patterns) {
  const { rest, fragment } = splitFragment(text);
  const { base, query } = splitQuery(rest);
  if (query === null) return text;
  const segments = query.split("&");
  const kept = segments.filter(segment => !isTrackingSegment(segment, patterns));
  if (kept.length === segments.length) return text;
  return base + (kept.length > 0 ? "?" + kept.join("&") : "") + fragment;
}

function cleanUrl(text, settings) {
  const url = parseHttpUrl(text);
  if (!url || isKeptHost(url.hostname, settings)) return text;
  return removeTracking(text, trackingParameters(url.hostname, settings));
}
