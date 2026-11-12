import unittest
import zipfile

import support


class PackTest(support.ExtensionTestCase):
    def build(self, directory, name):
        from kondorlib.packaging import build_package
        return build_package(directory, self.workspace / name)

    def test_same_input_gives_same_sha256(self):
        from kondorlib.packaging import sha256_of
        directory = self.install()
        first, second = self.build(directory, "a.zip"), self.build(directory, "b.zip")
        self.assertEqual(sha256_of(first), sha256_of(second))

    def test_manifest_is_first_and_entries_are_sorted(self):
        package = self.build(self.install(), "a.zip")
        names = zipfile.ZipFile(package).namelist()
        self.assertEqual(names, ["manifest.json", "README.md", "content.js", "icon.svg", "style.css"][:1]
                         + sorted(names[1:]))

    def test_timestamps_are_fixed_and_deflate_is_used(self):
        package = self.build(self.install(), "a.zip")
        for info in zipfile.ZipFile(package).infolist():
            self.assertEqual(info.date_time, (1980, 1, 1, 0, 0, 0))
            self.assertEqual(info.compress_type, zipfile.ZIP_DEFLATED)

    def test_names_the_package_after_id_and_version(self):
        from kondorlib.manifest import read_manifest
        from kondorlib.packaging import package_name
        manifest, _ = read_manifest(self.install())
        self.assertEqual(package_name(manifest), "sample-ext-1.0.0.kondorext")


if __name__ == "__main__":
    unittest.main()
