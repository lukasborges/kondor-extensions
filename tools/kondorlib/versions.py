import json
import subprocess

from .manifest import MANIFEST


def git(repo, *args):
    done = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True)
    return done.returncode, done.stdout, done.stderr.strip()


def parse_version(version):
    return tuple(int(part) for part in version.split("."))


def base_version(repo, base, relative):
    code, out, _ = git(repo, "show", f"{base}:{relative}/{MANIFEST}")
    if code != 0:
        return None
    try:
        return json.loads(out)["version"]
    except (ValueError, KeyError, TypeError):
        return None


def changed_since(repo, base, relative):
    code, out, error = git(repo, "diff", "--name-only", base, "--", relative)
    return code, bool(out.strip()), error


def version_problems(version, old, base):
    if parse_version(version) > parse_version(old):
        return []
    return [(MANIFEST, f"version {version} must be greater than {old} on {base}")]


def check_version_bump(ext_dir, manifest, baseline):
    repo, base = baseline
    relative = ext_dir.resolve().relative_to(repo.resolve()).as_posix()
    code, changed, error = changed_since(repo, base, relative)
    if code != 0:
        return [(MANIFEST, f"cannot compare with {base}: {error}")]
    old = base_version(repo, base, relative)
    if not changed or old is None:
        return []
    return version_problems(manifest["version"], old, base)
