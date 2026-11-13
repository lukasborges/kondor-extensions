# JSON Viewer

## What it does

Shows JSON documents as a collapsible tree with syntax colors that follow the light or dark
color scheme.

- "Pretty" and "Raw" switch between the tree and the original text.
- "Collapse All" and "Expand All" fold the whole tree.
- "Copy Value" and "Copy Path" copy the selected row's value or its path, such as `items[2].id`.
- `http` and `https` strings are clickable links.
- Numbers are shown and copied exactly as written, even above 2^53.
- Documents over 1,000,000 characters start raw, with a notice and "Format Anyway".
- It does nothing on other pages, and "Run on <site>" turns it off for a site.
- Nothing is saved, in normal and in private tabs.

## Permissions

- `<all_urls>`: needed to see every page so it can recognize a JSON document, including local
  `file://` ones. It changes nothing on pages that are not JSON documents.
- It asks for no API permission.

## Network

None.
