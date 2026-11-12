import unittest

import support


class PackageContentsTest(support.ExtensionTestCase):
    def test_rejects_file_not_referenced_by_manifest(self):
        directory = self.install()
        (directory / "extra.txt").write_text("x")
        self.assertProblem(directory, "extra.txt: not referenced by manifest.json")

    def test_allows_readme_and_icon_without_references(self):
        self.assertEqual(self.messages(self.install()), [])

    def test_rejects_missing_readme(self):
        directory = self.install()
        (directory / "README.md").unlink()
        self.assertProblem(directory, "README.md: file not found")

    def test_rejects_readme_without_network_section(self):
        directory = self.install()
        text = (directory / "README.md").read_text().replace("## Network", "## Other")
        (directory / "README.md").write_text(text)
        self.assertProblem(directory, 'section "Network" is missing or empty')

    def test_rejects_permissions_section_missing_lines(self):
        directory = self.install()
        text = (directory / "README.md").read_text().replace("- http://*/*: runs on plain pages.\n", "")
        (directory / "README.md").write_text(text)
        self.assertProblem(directory, "needs one line per permission and site pattern")

    def test_rejects_more_than_200_files(self):
        directory = self.install()
        for number in range(200):
            (directory / f"f{number}.txt").write_text("x")
        self.assertProblem(directory, "the limit is 200")

    def test_rejects_package_over_5_mib(self):
        directory = self.install()
        (directory / "big.bin").write_bytes(b"0" * (5 * 1024 * 1024 + 1))
        self.assertProblem(directory, "the limit is 5242880")

    def test_accepts_png_icon_of_128_pixels(self):
        self.assertEqual(self.messages(self.install("second-ext")), [])

    def test_rejects_png_icon_of_other_size(self):
        directory = self.install("second-ext")
        data = bytearray((directory / "icon.png").read_bytes())
        data[19] = 64
        (directory / "icon.png").write_bytes(bytes(data))
        self.assertProblem(directory, "must be a PNG of 128x128 pixels")

    def test_rejects_icon_of_other_format(self):
        directory = self.install()
        (directory / "icon.svg").rename(directory / "icon.gif")
        self.edit_manifest(directory, icon="icon.gif")
        self.assertProblem(directory, "must be an SVG or a PNG")


if __name__ == "__main__":
    unittest.main()
