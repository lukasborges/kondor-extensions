import unittest

import support

FORBIDDEN_SNIPPETS = {
    "eval(": "eval('1')",
    "new Function(": "new Function('return 1')",
    "string argument": "setTimeout('run()', 10)",
    "import( with a non-literal": "import(url)",
    "importScripts(": "importScripts('a.js')",
    "src attribute": "html = '<script src=\"https://x/y.js\"></script>'",
    "creating a script element": "document.createElement('script')",
    "document.write(": "document.write('x')",
}


class ForbiddenCodeTest(support.ExtensionTestCase):
    def write_script(self, source):
        directory = self.install()
        (directory / "content.js").write_text(source, encoding="utf-8")
        return directory

    def test_reports_each_forbidden_construct(self):
        for fragment, source in FORBIDDEN_SNIPPETS.items():
            with self.subTest(fragment):
                self.assertProblem(self.write_script(source + "\n"), fragment)

    def test_reports_the_line_number(self):
        directory = self.write_script("let a = 1;\neval('x');\n")
        self.assertProblem(directory, "content.js: line 2: eval(")

    def test_allows_import_with_literal_and_function_timeouts(self):
        directory = self.write_script("import('./part.js');\nsetTimeout(() => 1, 5);\n")
        self.assertEqual(self.messages(directory), [])

    def test_rejects_line_over_500_characters(self):
        directory = self.write_script("var a = '" + "x" * 500 + "';\n")
        self.assertProblem(directory, "longer than 500 characters")

    def test_rejects_long_average_line_length(self):
        directory = self.write_script(("var a = '" + "x" * 150 + "';\n") * 10)
        self.assertProblem(directory, "average line length is too long")

    def test_rejects_minified_css(self):
        directory = self.install()
        (directory / "style.css").write_text("a{color:red}" * 60, encoding="utf-8")
        self.assertProblem(directory, "style.css: line 1 is longer")


if __name__ == "__main__":
    unittest.main()
