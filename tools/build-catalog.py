#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

from kondorlib.catalog import build_catalog, write_catalog
from kondorlib.sitepage import render_index
from kondorlib.validation import discover, validate_all


def parse_out_dir():
    parser = argparse.ArgumentParser(description="Build the catalog site.")
    parser.add_argument("out_dir", type=Path)
    return parser.parse_args().out_dir


def write_site(directories, out_dir):
    catalog = build_catalog(directories, out_dir)
    write_catalog(catalog, out_dir)
    (out_dir / "index.html").write_text(render_index(catalog["extensions"]), encoding="utf-8")


def main():
    directories = discover()
    problems = validate_all(directories)
    if problems:
        print("\n".join(problems))
        return 1
    write_site(directories, parse_out_dir())
    return 0


if __name__ == "__main__":
    sys.exit(main())
