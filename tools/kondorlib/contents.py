import os
import struct
from pathlib import PurePosixPath

from .manifest import MANIFEST

README = "README.md"
MAX_BYTES = 5 * 1024 * 1024
MAX_FILES = 200
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
ICON_SIZE = (128, 128)


def normalize(name):
    return PurePosixPath(os.path.normpath(name)).as_posix()


def files_of_script(index, script):
    return ((f"contentScripts[{index}].{kind}", name)
            for kind in ("js", "css") for name in script.get(kind, []))


def script_references(manifest):
    for index, script in enumerate(manifest.get("contentScripts", [])):
        yield from files_of_script(index, script)


def file_references(manifest):
    yield "icon", manifest["icon"]
    yield from script_references(manifest)


def is_unsafe(name):
    return name.startswith(("/", "\\")) or ".." in PurePosixPath(name).parts or "\\" in name


def check_reference(ext_dir, field, name):
    if is_unsafe(name):
        return [(MANIFEST, f"{field}: unsafe path: {name}")]
    path = ext_dir / name
    if path.is_symlink():
        return [(MANIFEST, f"{field}: symbolic links are not allowed: {name}")]
    if not path.is_file():
        return [(MANIFEST, f"{field}: file not found: {name}")]
    return []


def check_references(ext_dir, manifest):
    problems = []
    for field, name in file_references(manifest):
        problems += check_reference(ext_dir, field, name)
    return problems


def package_files(ext_dir):
    paths = [p for p in ext_dir.rglob("*") if p.is_file() or p.is_symlink()]
    return sorted(p.relative_to(ext_dir).as_posix() for p in paths)


def check_unreferenced(ext_dir, manifest):
    allowed = {MANIFEST, README} | {normalize(name) for _, name in file_references(manifest)}
    return [(name, "not referenced by manifest.json") for name in package_files(ext_dir)
            if name not in allowed]


def check_limits(ext_dir):
    names = package_files(ext_dir)
    total = sum((ext_dir / name).stat().st_size for name in names)
    problems = []
    if len(names) > MAX_FILES:
        problems.append((MANIFEST, f"{len(names)} files; the limit is {MAX_FILES}"))
    if total > MAX_BYTES:
        problems.append((MANIFEST, f"{total} bytes; the limit is {MAX_BYTES}"))
    return problems


def png_size(data):
    if data[:8] != PNG_SIGNATURE:
        return None
    return struct.unpack(">II", data[16:24])


def icon_problem(path):
    data = path.read_bytes()
    if path.suffix.lower() == ".svg":
        return None if b"<svg" in data else "is not a valid SVG"
    if path.suffix.lower() == ".png":
        return None if png_size(data) == ICON_SIZE else "must be a PNG of 128x128 pixels"
    return "must be an SVG or a PNG of 128x128 pixels"


def check_icon(ext_dir, manifest):
    path = ext_dir / manifest["icon"]
    if not path.is_file():
        return []
    problem = icon_problem(path)
    return [(manifest["icon"], problem)] if problem else []


def check_contents(ext_dir, manifest):
    problems = check_references(ext_dir, manifest)
    if problems:
        return problems
    return (check_unreferenced(ext_dir, manifest) + check_limits(ext_dir)
            + check_icon(ext_dir, manifest))
