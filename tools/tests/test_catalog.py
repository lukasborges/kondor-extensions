import hashlib
import json
import unittest
from datetime import datetime, timezone

import support


class CatalogTest(support.ExtensionTestCase):
    def build(self, *fixtures):
        from kondorlib.catalog import build_catalog, write_catalog
        from kondorlib.sitepage import render_index
        directories = [self.install(name) for name in fixtures]
        self.site = self.workspace / "site"
        catalog = build_catalog(directories, self.site, datetime(2026, 11, 12, 9, 30, tzinfo=timezone.utc))
        write_catalog(catalog, self.site)
        (self.site / "index.html").write_text(render_index(catalog["extensions"]), encoding="utf-8")
        return json.loads((self.site / "catalog.json").read_text(encoding="utf-8"))

    def test_zero_extensions_gives_empty_catalog_and_page(self):
        catalog = self.build()
        self.assertEqual(catalog["extensions"], [])
        self.assertIn("No extensions are published yet", (self.site / "index.html").read_text())

    def test_header_has_version_and_utc_timestamp(self):
        catalog = self.build("sample-ext")
        self.assertEqual((catalog["version"], catalog["generated"]), (1, "2026-11-12T09:30:00Z"))

    def test_entry_fields_come_from_the_manifest(self):
        entry = self.build("sample-ext")["extensions"][0]
        self.assertEqual(
            (entry["id"], entry["name[pt_BR]"], entry["permissions"], entry["icon"]),
            ("sample-ext", "Extensão de Exemplo", ["tabs"], "icons/sample-ext.svg"))

    def test_matches_are_the_union_of_content_script_matches(self):
        entry = self.build("second-ext")["extensions"][0]
        self.assertEqual(entry["matches"], ["https://*/*", "*://*.example.com/*"])

    def test_sha256_and_size_come_from_the_package(self):
        entry = self.build("sample-ext")["extensions"][0]
        data = (self.site / entry["package"]).read_bytes()
        self.assertEqual((entry["sha256"], entry["size"]), (hashlib.sha256(data).hexdigest(), len(data)))

    def test_extensions_are_sorted_by_id(self):
        ids = [e["id"] for e in self.build("sample-ext", "second-ext")["extensions"]]
        self.assertEqual(ids, ["sample-ext", "second-ext"])

    def test_writes_package_and_icon_files(self):
        self.build("second-ext")
        self.assertTrue((self.site / "packages" / "second-ext-0.2.0.kondorext").is_file())
        self.assertTrue((self.site / "icons" / "second-ext.png").is_file())

    def test_page_lists_name_version_and_links(self):
        self.build("sample-ext")
        page = (self.site / "index.html").read_text()
        for fragment in ("Sample Extension", "1.0.0", "packages/sample-ext-1.0.0.kondorext",
                         "tree/main/extensions/sample-ext", "prefers-color-scheme"):
            self.assertIn(fragment, page)
        self.assertNotIn("<script", page)


if __name__ == "__main__":
    unittest.main()
