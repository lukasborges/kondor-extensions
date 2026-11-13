import json

from .paths import SCHEMA_FILE
from . import schema

MANIFEST = "manifest.json"
ALLOWED_LICENSES = frozenset({
    "GPL-3.0-only", "GPL-3.0-or-later", "AGPL-3.0-only", "AGPL-3.0-or-later",
    "LGPL-3.0-only", "LGPL-3.0-or-later", "LGPL-2.1-or-later", "GPL-2.0-or-later",
    "MIT", "MIT-0", "ISC", "0BSD", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0",
    "Zlib", "MPL-2.0", "BSL-1.0", "Unlicense",
})


def read_manifest(ext_dir):
    try:
        data = json.loads((ext_dir / MANIFEST).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None, [(MANIFEST, "file not found")]
    except ValueError as error:
        return None, [(MANIFEST, f"invalid JSON: {error}")]
    if not isinstance(data, dict):
        return None, [(MANIFEST, "must be a JSON object")]
    return data, []


def check_schema(manifest):
    root = json.loads(SCHEMA_FILE.read_text(encoding="utf-8"))
    return [(MANIFEST, message) for message in schema.check(manifest, root)]


def check_id(ext_dir, manifest):
    if manifest["id"] == ext_dir.name:
        return []
    return [(MANIFEST, f"id \"{manifest['id']}\" must equal the directory name \"{ext_dir.name}\"")]


def check_license(manifest):
    if manifest["license"] in ALLOWED_LICENSES:
        return []
    return [(MANIFEST, f"license \"{manifest['license']}\" is not an allowed SPDX identifier")]


def check_choice_settings(manifest):
    problems = []
    for i, setting in enumerate(manifest.get("settings", [])):
        if setting["type"] == "choice" and "choices" not in setting:
            problems.append((MANIFEST, f"settings[{i}].choices: is required for type choice"))
    return problems


def keys_setting_names(manifest):
    return {setting["key"] for setting in manifest.get("settings", [])
            if setting["type"] == "keys"}


def check_keys_settings(manifest):
    names = keys_setting_names(manifest)
    items = manifest.get("action", {}).get("items", [])
    return [(MANIFEST, f"action.items[{i}].keysSetting: must name a keys setting")
            for i, item in enumerate(items)
            if "keysSetting" in item and item["keysSetting"] not in names]


def check_manifest_rules(ext_dir, manifest):
    return (check_id(ext_dir, manifest) + check_license(manifest)
            + check_choice_settings(manifest) + check_keys_settings(manifest))
