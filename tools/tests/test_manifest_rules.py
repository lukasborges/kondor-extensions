import json
import unittest

import support


class ManifestRulesTest(support.ExtensionTestCase):
    def test_sample_fixture_is_valid(self):
        self.assertEqual(self.messages(self.install()), [])

    def test_second_fixture_is_valid(self):
        self.assertEqual(self.messages(self.install("second-ext")), [])

    def test_rejects_invalid_json(self):
        directory = self.install()
        (directory / "manifest.json").write_text("{", encoding="utf-8")
        self.assertProblem(directory, "invalid JSON")

    def test_rejects_missing_manifest(self):
        directory = self.install()
        (directory / "manifest.json").unlink()
        self.assertProblem(directory, "manifest.json: file not found")

    def test_rejects_wrong_api_version(self):
        directory = self.install()
        self.edit_manifest(directory, kondor=2)
        self.assertProblem(directory, "kondor: must be 1")

    def test_rejects_missing_required_field(self):
        directory = self.install()
        manifest = json.loads((directory / "manifest.json").read_text())
        del manifest["author"]
        (directory / "manifest.json").write_text(json.dumps(manifest))
        self.assertProblem(directory, "author: is required")

    def test_rejects_wrong_type_with_field_path(self):
        directory = self.install()
        self.edit_manifest(directory, contentScripts=[{"matches": "https://*/*"}])
        self.assertProblem(directory, "contentScripts[0].matches: must be of type array")

    def test_rejects_bad_version(self):
        directory = self.install()
        self.edit_manifest(directory, version="1.0")
        self.assertProblem(directory, "version")

    def test_rejects_unknown_permission(self):
        directory = self.install()
        self.edit_manifest(directory, permissions=["cookies"])
        self.assertProblem(directory, "permissions[0]: must be one of")

    def test_rejects_bad_match_pattern(self):
        directory = self.install()
        self.edit_manifest(directory, contentScripts=[{"matches": ["example.com"]}])
        self.assertProblem(directory, "contentScripts[0].matches[0]")

    def test_rejects_choice_setting_without_choices(self):
        directory = self.install()
        setting = {"key": "mode", "type": "choice", "label": "Mode", "default": "a"}
        self.edit_manifest(directory, settings=[setting])
        self.assertProblem(directory, "settings[0].choices: is required")

    def edit_toggle(self, directory, keys_setting, extra_settings=()):
        manifest = json.loads((directory / "manifest.json").read_text())
        manifest["settings"] += list(extra_settings)
        manifest["action"]["items"][0]["keysSetting"] = keys_setting
        (directory / "manifest.json").write_text(json.dumps(manifest))

    def test_accepts_keys_setting_naming_a_keys_setting(self):
        directory = self.install()
        keys = {"key": "keyToggle", "type": "keys", "label": "Toggle", "default": "T"}
        self.edit_toggle(directory, "keyToggle", [keys])
        self.assertEqual(self.messages(directory), [])

    def test_rejects_keys_setting_naming_no_setting(self):
        directory = self.install()
        self.edit_toggle(directory, "missing")
        self.assertProblem(directory, "action.items[0].keysSetting: must name a keys setting")

    def test_rejects_keys_setting_naming_another_type(self):
        directory = self.install()
        self.edit_toggle(directory, "enabled")
        self.assertProblem(directory, "action.items[0].keysSetting: must name a keys setting")

    def test_rejects_keys_setting_with_bad_pattern(self):
        directory = self.install()
        self.edit_toggle(directory, "1x")
        self.assertProblem(directory, "action.items[0].keysSetting")

    def test_accepts_translated_keys_only_as_strings(self):
        directory = self.install()
        self.edit_manifest(directory, **{"name[pt_BR]": 3})
        self.assertProblem(directory, "name[pt_BR]: must be of type string")

    def test_rejects_id_that_differs_from_directory(self):
        directory = self.install()
        self.edit_manifest(directory, id="other-id")
        self.assertProblem(directory, "must equal the directory name")

    def test_rejects_license_outside_allow_list(self):
        directory = self.install()
        self.edit_manifest(directory, license="Proprietary")
        self.assertProblem(directory, "not an allowed SPDX identifier")

    def test_rejects_missing_script_file(self):
        directory = self.install()
        (directory / "content.js").unlink()
        self.assertProblem(directory, "contentScripts[0].js: file not found: content.js")

    def test_rejects_path_outside_the_package(self):
        directory = self.install()
        scripts = [{"matches": ["<all_urls>"], "js": ["../outside.js"]}]
        self.edit_manifest(directory, contentScripts=scripts)
        self.assertProblem(directory, "unsafe path: ../outside.js")

    def test_formats_one_line_per_problem(self):
        from kondorlib.validation import format_problem
        directory = self.install()
        line = format_problem(directory, ("manifest.json", "oops"))
        self.assertEqual(line, "extensions/sample-ext/manifest.json: oops")


if __name__ == "__main__":
    unittest.main()
