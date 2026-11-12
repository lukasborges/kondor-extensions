#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

from kondorlib.manifest import read_manifest
from kondorlib.packaging import build_package, package_name, sha256_of


def parse_arguments():
    parser = argparse.ArgumentParser(description="Build a .kondorext package.")
    parser.add_argument("directory", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    return parser.parse_args()


def main():
    arguments = parse_arguments()
    manifest, problems = read_manifest(arguments.directory)
    if manifest is None:
        print(f"{arguments.directory}: {problems[0][1]}")
        return 1
    output = arguments.output or Path(package_name(manifest))
    build_package(arguments.directory, output)
    print(f"{output}  sha256:{sha256_of(output)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
