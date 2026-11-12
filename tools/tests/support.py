import shutil
import sys
import tempfile
import unittest
from pathlib import Path

TOOLS = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"
sys.path.insert(0, str(TOOLS))


class ExtensionTestCase(unittest.TestCase):
    def setUp(self):
        self.workspace = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.workspace, ignore_errors=True)
        self.extensions = self.workspace / "extensions"
        self.extensions.mkdir()

    def install(self, fixture="sample-ext"):
        target = self.extensions / fixture
        shutil.rmtree(target, ignore_errors=True)
        shutil.copytree(FIXTURES / fixture, target)
        return target

    def edit_manifest(self, directory, **changes):
        import json
        path = directory / "manifest.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data.update(changes)
        path.write_text(json.dumps(data), encoding="utf-8")

    def messages(self, directory, **options):
        from kondorlib.validation import validate_extension
        return [f"{name}: {message}" for name, message in validate_extension(directory, **options)]

    def assertProblem(self, directory, fragment, **options):
        found = self.messages(directory, **options)
        self.assertTrue(any(fragment in line for line in found), f"{fragment!r} not in {found}")
