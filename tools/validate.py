#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

from kondorlib.validation import discover, validate_all


def parse_arguments():
    parser = argparse.ArgumentParser(description="Check Kondor extensions.")
    parser.add_argument("--base", help="git ref to compare versions against")
    parser.add_argument("directories", nargs="*", type=Path)
    return parser.parse_args()


def main():
    arguments = parse_arguments()
    directories = arguments.directories or discover()
    problems = validate_all(directories, arguments.base)
    print("\n".join(problems))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
