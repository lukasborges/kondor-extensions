import re

from .contents import README

HEADING = re.compile(r"^#{1,6}\s+(.*?)\s*#*\s*$")
SECTIONS = ("What it does", "Permissions", "Network")


def split_sections(text):
    sections, current = {}, None
    for line in text.splitlines():
        heading = HEADING.match(line)
        if heading:
            current = heading.group(1).lower()
            sections[current] = []
        elif current is not None and line.strip():
            sections[current].append(line.strip())
    return sections


def permission_lines_needed(manifest):
    matches = {m for script in manifest.get("contentScripts", []) for m in script["matches"]}
    return len(manifest.get("permissions", [])) + len(matches)


def check_permission_lines(sections, manifest):
    needed = permission_lines_needed(manifest)
    found = len(sections.get("permissions", []))
    if found >= needed:
        return []
    return [(README, f"section \"Permissions\" needs one line per permission and site pattern "
                     f"({needed} needed, {found} found)")]


def check_readme(ext_dir, manifest):
    path = ext_dir / README
    if not path.is_file():
        return [(README, "file not found")]
    sections = split_sections(path.read_text(encoding="utf-8"))
    missing = [(README, f"section \"{name}\" is missing or empty")
               for name in SECTIONS if not sections.get(name.lower())]
    return missing + ([] if missing else check_permission_lines(sections, manifest))
