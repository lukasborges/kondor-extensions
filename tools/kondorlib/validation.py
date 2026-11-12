from .contents import check_contents
from .manifest import check_manifest_rules, check_schema, read_manifest
from .paths import EXTENSIONS_DIR, ROOT
from .readme import check_readme
from .sourcecode import check_sources
from .versions import check_version_bump


def discover(directory=EXTENSIONS_DIR):
    if not directory.is_dir():
        return []
    return sorted(path for path in directory.iterdir() if path.is_dir())


def check_semantics(ext_dir, manifest):
    return (check_manifest_rules(ext_dir, manifest) + check_contents(ext_dir, manifest)
            + check_readme(ext_dir, manifest))


def validate_extension(ext_dir, base=None, repo=ROOT):
    manifest, problems = read_manifest(ext_dir)
    if manifest is None:
        return problems
    schema_problems = check_schema(manifest)
    if schema_problems:
        return schema_problems + check_sources(ext_dir)
    problems = check_semantics(ext_dir, manifest) + check_sources(ext_dir)
    return problems + (check_version_bump(ext_dir, manifest, (repo, base)) if base else [])


def format_problem(ext_dir, problem):
    name, message = problem
    return f"extensions/{ext_dir.name}/{name}: {message}"


def validate_all(ext_dirs, base=None, repo=ROOT):
    return [format_problem(d, p) for d in ext_dirs for p in validate_extension(d, base, repo)]
