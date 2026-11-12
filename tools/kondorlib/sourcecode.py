import re

MAX_LINE = 500
MAX_AVERAGE_LINE = 120
MIN_SIZE_FOR_AVERAGE = 1000

FORBIDDEN = (
    (r"\beval\s*\(", "eval( is not allowed"),
    (r"\bnew\s+Function\s*\(", "new Function( is not allowed"),
    (r"\b(?:setTimeout|setInterval)\s*\(\s*[\"'`]", "setTimeout/setInterval with a string argument is not allowed"),
    (r"\bimport\s*\(\s*(?![\"'][^\"'\n]*[\"']\s*\))", "import( with a non-literal argument is not allowed"),
    (r"\bimportScripts\s*\(", "importScripts( is not allowed"),
    (r"<script\b[^>]*\bsrc\b", "a <script> tag with a src attribute is not allowed"),
    (r"createElement\s*\(\s*[\"'`]script[\"'`]\s*\)", "creating a script element is not allowed"),
    (r"\bdocument\s*\.\s*write(?:ln)?\s*\(", "document.write( is not allowed"),
)


def line_of(text, offset):
    return text.count("\n", 0, offset) + 1


def check_forbidden(name, text):
    problems = []
    for pattern, message in FORBIDDEN:
        for found in re.finditer(pattern, text):
            problems.append((name, f"line {line_of(text, found.start())}: {message}"))
    return problems


def long_line_problem(name, lines):
    for number, line in enumerate(lines, 1):
        if len(line) > MAX_LINE:
            return [(name, f"line {number} is longer than {MAX_LINE} characters (minified code)")]
    return []


def average_line_problem(name, text, lines):
    filled = [line for line in lines if line.strip()]
    if len(text) < MIN_SIZE_FOR_AVERAGE or not filled:
        return []
    if sum(map(len, filled)) / len(filled) <= MAX_AVERAGE_LINE:
        return []
    return [(name, "average line length is too long (minified code)")]


def check_minified(name, text):
    lines = text.splitlines()
    return long_line_problem(name, lines) or average_line_problem(name, text, lines)


def check_file(name, text):
    problems = check_minified(name, text)
    return problems + (check_forbidden(name, text) if name.endswith(".js") else [])


def check_sources(ext_dir):
    problems = []
    for path in sorted(ext_dir.rglob("*")):
        if path.suffix in (".js", ".css") and path.is_file() and not path.is_symlink():
            name = path.relative_to(ext_dir).as_posix()
            problems += check_file(name, path.read_text(encoding="utf-8", errors="replace"))
    return problems
