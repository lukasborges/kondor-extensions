# Contributing an extension

## Quick start

1. Copy an existing folder in `extensions/` to `extensions/<your-id>/`.
2. Edit `manifest.json`, the scripts, the styles and the `README.md`.
3. Check it: `python3 tools/validate.py extensions/<your-id>`.
4. Pack it: `python3 tools/pack.py extensions/<your-id>`.
5. In Kondor, open Settings → Extensions → **Install from File…** and pick the `.kondorext` file.

The tools need only Python 3. Run the tool tests with `python3 -m unittest discover tools/tests`.

## Reference

The format and the JavaScript API are described in
<https://github.com/lukasborges/kondor/blob/main/docs/extensions/api.md>.
The manifest also has a JSON Schema in `schema/manifest.schema.json`.

## Rules

Each rule exists so that the maintainer can review everything an extension does.

- **One extension per pull request.** It keeps the review small.
- **Readable source, with no minified or obfuscated code.** Reviewers must be able to read it.
- **No remote code.** Code fetched at run time cannot be reviewed.
- **No analytics or tracking.** Extensions must respect the user's privacy.
- **Outside services only when needed, and listed under "Network" in the README.** Users can see
  what leaves their computer.
- **The fewest permissions and the narrowest `matches` that work.** Each one is explained in the
  README under "Permissions", one line each.
- **A `version` bump on every change.** Kondor updates extensions by version.
- **An OSI license compatible with GPL-3.0.** The catalog redistributes the code.
- **English in the code, with translations through `key[<locale>]`**, for example `"name[pt_BR]"`.

Every extension has a `README.md` with the sections "What it does", "Permissions" and "Network".

## Icons

The icon is drawn for a toolbar button and a list row, on light and dark color schemes:

- **No background.** Draw only the symbol on a transparent 64 × 64 view box; an `icon.svg` whose
  first drawn element is a rectangle covering the whole view box is rejected.
- **Legible at 16 px.** Use thick shapes, with no thin lines or small details.
- **Colors that work on both schemes.** Use the Breeze palette (for example `#3daee9`, `#fdbc4b`,
  `#da4453`, `#27ae60`) and avoid black or white fills that disappear on one background.
- **Original artwork.**

## Review

The maintainer checks the behavior, the permissions, the network use and the privacy impact, and
then merges. The catalog is published on merge to `main`, and Kondor picks it up from there.
CI (`build`) must pass first.

## Requests and bugs

- Want an extension that does not exist? Open an *Extension request* issue.
- Found a problem in a published extension? Open a *Bug report* issue.
