function readEntries(text) {
  return String(text || "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "" && !line.startsWith("#"));
}

function isValidParameterEntry(entry) {
  return /^[^*&=#\s]+\*?$/.test(entry);
}

function readParameterEntries(text) {
  return readEntries(text).filter(isValidParameterEntry).map(entry => entry.toLowerCase());
}

function hostOfEntry(entry) {
  const text = entry.includes("://") ? entry : "https://" + entry;
  try {
    return new URL(text).hostname.toLowerCase();
  } catch (error) {
    return "";
  }
}

function readHostEntries(text) {
  return readEntries(text).map(hostOfEntry).filter(host => host !== "");
}

function readCleanLinksSettings(values) {
  return {
    extraParameters: readParameterEntries(values.extraParameters),
    keptSites: readHostEntries(values.keptSites)
  };
}
