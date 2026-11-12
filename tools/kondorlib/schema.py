import re

TYPES = {"object": dict, "array": list, "string": str, "boolean": bool,
         "number": (int, float), "integer": int}


def is_type(value, name):
    if name in ("number", "integer") and isinstance(value, bool):
        return False
    return isinstance(value, TYPES[name])


def join(path, key):
    return f"{path}.{key}" if path else key


def label(path):
    return path or "manifest"


def check_type(value, rule, path):
    names = rule if isinstance(rule, list) else [rule]
    if any(is_type(value, name) for name in names):
        return []
    return [f"{label(path)}: must be of type {' or '.join(names)}"]


def check_enum(value, rule, path):
    if value in rule:
        return []
    return [f"{label(path)}: must be one of {', '.join(map(str, rule))}"]


def check_const(value, rule, path):
    if value == rule and not isinstance(value, bool):
        return []
    return [f"{label(path)}: must be {rule}"]


def check_pattern(value, rule, path):
    if not isinstance(value, str) or re.search(rule, value):
        return []
    return [f"{label(path)}: \"{value}\" does not match {rule}"]


def check_min_length(value, rule, path):
    if not isinstance(value, str) or len(value) >= rule:
        return []
    return [f"{label(path)}: must not be empty"]


def check_min_items(value, rule, path):
    if not isinstance(value, list) or len(value) >= rule:
        return []
    return [f"{label(path)}: needs at least {rule} item(s)"]


def check_required(value, rule, path):
    if not isinstance(value, dict):
        return []
    return [f"{join(path, key)}: is required" for key in rule if key not in value]


STATELESS = {
    "type": check_type, "enum": check_enum, "const": check_const,
    "pattern": check_pattern, "minLength": check_min_length,
    "minItems": check_min_items, "required": check_required,
}


def resolve(schema, root):
    if "$ref" not in schema:
        return schema
    return root["$defs"][schema["$ref"].rsplit("/", 1)[1]]


class SchemaChecker:
    def __init__(self, root):
        self.root = root

    def keyword_problems(self, value, item, path):
        keyword, rule = item
        if keyword in STATELESS:
            return STATELESS[keyword](value, rule, path)
        method = getattr(self, NESTED.get(keyword, ""), None)
        return method(value, rule, path) if method else []

    def check(self, value, schema, path):
        schema = resolve(schema, self.root)
        problems = []
        for keyword, rule in schema.items():
            problems += self.keyword_problems(value, (keyword, rule), path)
        return problems

    def check_properties(self, value, rule, path):
        if not isinstance(value, dict):
            return []
        found = [(key, sub) for key, sub in rule.items() if key in value]
        return [m for key, sub in found for m in self.check(value[key], sub, join(path, key))]

    def check_pattern_properties(self, value, rule, path):
        if not isinstance(value, dict):
            return []
        pairs = [(k, sub) for pattern, sub in rule.items() for k in value if re.search(pattern, k)]
        return [m for key, sub in pairs for m in self.check(value[key], sub, join(path, key))]

    def check_items(self, value, rule, path):
        if not isinstance(value, list):
            return []
        return [m for i, item in enumerate(value) for m in self.check(item, rule, f"{path}[{i}]")]


NESTED = {"properties": "check_properties",
          "patternProperties": "check_pattern_properties", "items": "check_items"}


def check(value, root):
    return SchemaChecker(root).check(value, root, "")
