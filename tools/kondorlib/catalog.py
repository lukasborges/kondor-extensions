import json
import shutil
from datetime import datetime, timezone

from .manifest import read_manifest
from .packaging import build_package, package_name, sha256_of
from .paths import REPOSITORY_URL

CATALOG_VERSION = 1


def translations(manifest, field):
    keys = sorted(key for key in manifest if key.startswith(f"{field}["))
    return {key: manifest[key] for key in keys}


def union_of_matches(manifest):
    matches = [m for script in manifest.get("contentScripts", []) for m in script["matches"]]
    return list(dict.fromkeys(matches))


def homepage_of(manifest):
    default = f"{REPOSITORY_URL}/tree/main/extensions/{manifest['id']}"
    return manifest.get("homepage", default)


def describe(manifest):
    return {"id": manifest["id"], "name": manifest["name"],
            **translations(manifest, "name"), "description": manifest["description"],
            **translations(manifest, "description"), "version": manifest["version"],
            "author": manifest["author"], "homepage": homepage_of(manifest),
            "license": manifest["license"]}


def catalog_entry(manifest, package, icon_url):
    return {**describe(manifest), "icon": icon_url,
            "permissions": manifest.get("permissions", []),
            "matches": union_of_matches(manifest),
            "package": f"packages/{package.name}", "sha256": sha256_of(package),
            "size": package.stat().st_size}


def publish_extension(ext_dir, out_dir):
    manifest, _ = read_manifest(ext_dir)
    package = build_package(ext_dir, out_dir / "packages" / package_name(manifest))
    icon_name = f"{manifest['id']}{(ext_dir / manifest['icon']).suffix.lower()}"
    shutil.copyfile(ext_dir / manifest["icon"], out_dir / "icons" / icon_name)
    return catalog_entry(manifest, package, f"icons/{icon_name}")


def utc_timestamp(now=None):
    moment = now or datetime.now(timezone.utc)
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


def build_catalog(ext_dirs, out_dir, now=None):
    (out_dir / "packages").mkdir(parents=True, exist_ok=True)
    (out_dir / "icons").mkdir(parents=True, exist_ok=True)
    entries = sorted((publish_extension(d, out_dir) for d in ext_dirs), key=lambda e: e["id"])
    return {"version": CATALOG_VERSION, "generated": utc_timestamp(now), "extensions": entries}


def write_catalog(catalog, out_dir):
    text = json.dumps(catalog, indent=2, ensure_ascii=False) + "\n"
    (out_dir / "catalog.json").write_text(text, encoding="utf-8")
