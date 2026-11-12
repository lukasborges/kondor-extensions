import hashlib
import zipfile
from pathlib import Path

from .contents import package_files
from .manifest import MANIFEST

FIXED_TIMESTAMP = (1980, 1, 1, 0, 0, 0)
FILE_MODE = 0o644 << 16
UNIX = 3


def package_name(manifest):
    return f"{manifest['id']}-{manifest['version']}.kondorext"


def ordered_names(ext_dir):
    names = package_files(ext_dir)
    return [MANIFEST] + [name for name in names if name != MANIFEST]


def entry_info(name):
    info = zipfile.ZipInfo(name, FIXED_TIMESTAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = FILE_MODE
    info.create_system = UNIX
    return info


def build_package(ext_dir, out_file):
    with zipfile.ZipFile(out_file, "w", zipfile.ZIP_DEFLATED) as archive:
        for name in ordered_names(ext_dir):
            archive.writestr(entry_info(name), (ext_dir / name).read_bytes())
    return Path(out_file)


def sha256_of(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
