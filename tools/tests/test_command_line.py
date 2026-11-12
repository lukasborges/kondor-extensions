import subprocess
import sys
import unittest

import support


class CommandLineTest(support.ExtensionTestCase):
    def run_tool(self, tool, *args):
        return subprocess.run([sys.executable, str(support.TOOLS / tool), *args],
                              capture_output=True, text=True)

    def test_validate_exits_zero_for_a_valid_extension(self):
        self.assertEqual(self.run_tool("validate.py", str(self.install())).returncode, 0)

    def test_validate_prints_one_line_and_exits_one_on_error(self):
        directory = self.install()
        (directory / "content.js").write_text("eval('x')\n")
        done = self.run_tool("validate.py", str(directory))
        self.assertEqual(done.returncode, 1)
        self.assertEqual(done.stdout.strip(), "extensions/sample-ext/content.js: line 1: eval( is not allowed")

    def test_validate_works_with_zero_extensions(self):
        self.assertEqual(self.run_tool("validate.py").returncode, 0)

    def test_pack_writes_the_named_file(self):
        out = self.workspace / "x.kondorext"
        self.assertEqual(self.run_tool("pack.py", str(self.install()), "-o", str(out)).returncode, 0)
        self.assertTrue(out.is_file())

    def test_build_catalog_works_with_zero_extensions(self):
        site = self.workspace / "site"
        self.assertEqual(self.run_tool("build-catalog.py", str(site)).returncode, 0)
        self.assertTrue((site / "catalog.json").is_file() and (site / "index.html").is_file())


if __name__ == "__main__":
    unittest.main()
