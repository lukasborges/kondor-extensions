const MATCHER_TESTS = {
  url: (value) => location.href === value,
  "url-prefix": (value) => location.href.startsWith(value),
  domain: (value) => location.hostname === value || location.hostname.endsWith("." + value),
  regexp: regexpMatchesLocation,
  host: (value) => location.hostname === value,
};

function regexpMatchesLocation(value) {
  try {
    return new RegExp("^(?:" + value + ")$").test(location.href);
  } catch (error) {
    return false;
  }
}

function matcherApplies(matcher) {
  const test = MATCHER_TESTS[matcher.type];
  return test ? test(matcher.value) : false;
}

function sectionApplies(section) {
  return section.matchers.length === 0 || section.matchers.some(matcherApplies);
}

function styleApplies(style) {
  return style.sections.some(sectionApplies);
}

function describeMatcher(matcher) {
  const texts = textsForLocale();
  const templates = { "url-prefix": texts.prefix, url: texts.page, regexp: texts.pattern };
  const template = templates[matcher.type];
  return template ? fillText(template, [matcher.value]) : matcher.value;
}

function describeSection(section) {
  if (section.matchers.length === 0) return [textsForLocale().allSites];
  return section.matchers.map(describeMatcher);
}

function describeSites(style) {
  return Array.from(new Set(style.sections.flatMap(describeSection)));
}

function summarizeSites(style) {
  const lines = describeSites(style);
  const summary = lines.slice(0, 2).join(", ");
  if (lines.length <= 2) return summary;
  return summary + ", " + fillText(textsForLocale().moreSites, [lines.length - 2]);
}

function sortedByName(styles) {
  return styles.slice().sort((first, second) => first.name.localeCompare(second.name));
}

function groupStyles(styles) {
  const texts = textsForLocale();
  const sorted = sortedByName(styles);
  const groups = [
    { title: texts.thisSite, styles: sorted.filter(styleApplies) },
    { title: texts.otherSites, styles: sorted.filter((style) => !styleApplies(style)) },
  ];
  return groups.filter((group) => group.styles.length > 0);
}

function orderedIds(styles) {
  return groupStyles(styles).flatMap((group) => group.styles.map((style) => style.id));
}

function neighborId(ids, position) {
  return ids[Math.min(position, ids.length - 1)] || null;
}
