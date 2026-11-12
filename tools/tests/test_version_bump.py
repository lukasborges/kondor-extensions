import subprocess
import unittest

import support


class VersionBumpTest(support.ExtensionTestCase):
    def git(self, *args):
        subprocess.run(["git", "-C", str(self.workspace), "-c", "user.name=t", "-c", "user.email=t@t",
                        *args], check=True, capture_output=True)

    def setUp(self):
        super().setUp()
        self.directory = self.install()
        self.git("init", "-q", "-b", "main")
        self.git("add", ".")
        self.git("commit", "-q", "-m", "base")

    def check(self):
        return self.messages(self.directory, base="main", repo=self.workspace)

    def test_passes_when_nothing_changed(self):
        self.assertEqual(self.check(), [])

    def test_rejects_change_with_same_version(self):
        (self.directory / "content.js").write_text("// changed\n")
        self.assertProblem(self.directory, "must be greater than 1.0.0", base="main", repo=self.workspace)

    def test_passes_change_with_higher_version(self):
        (self.directory / "content.js").write_text("// changed\n")
        self.edit_manifest(self.directory, version="1.0.1")
        self.assertEqual(self.check(), [])

    def test_compares_numbers_not_text(self):
        self.edit_manifest(self.directory, version="1.0.9")
        self.git("commit", "-q", "-am", "bump")
        (self.directory / "content.js").write_text("// changed\n")
        self.edit_manifest(self.directory, version="1.0.10")
        self.assertEqual(self.check(), [])

    def test_passes_new_extension(self):
        other = self.install("second-ext")
        self.assertEqual(self.messages(other, base="main", repo=self.workspace), [])

    def test_reports_unknown_base_ref(self):
        self.assertProblem(self.directory, "cannot compare with nope", base="nope", repo=self.workspace)


if __name__ == "__main__":
    unittest.main()
