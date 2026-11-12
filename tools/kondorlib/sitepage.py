from html import escape

from .paths import REPOSITORY_URL

STYLE = """
:root { color-scheme: light dark; --bg: #fcfcfc; --fg: #232629; --muted: #6b7075; --card: #eff0f1; --link: #1d99f3; }
@media (prefers-color-scheme: dark) { :root { --bg: #232629; --fg: #fcfcfc; --muted: #9ea4a9; --card: #31363b; --link: #3daee9; } }
body { background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, sans-serif; margin: 0 auto; max-width: 48rem; padding: 1.5rem; }
a { color: var(--link); }
.extension { background: var(--card); border-radius: 6px; display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; }
.extension img { height: 48px; width: 48px; }
.extension h3 { margin: 0; }
.muted { color: var(--muted); }
"""

INSTALL_STEPS = """<h2>Install</h2>
<ol>
<li>In Kondor, open Settings &rarr; Extensions and choose <b>Get New Extensions&hellip;</b>.</li>
<li>Or download a package below, then choose <b>Install from File&hellip;</b>.</li>
</ol>"""


def render_card(entry):
    folder = f"{REPOSITORY_URL}/tree/main/extensions/{entry['id']}"
    return (f'<div class="extension"><img src="{escape(entry["icon"])}" alt="">'
            f'<div><h3>{escape(entry["name"])} <span class="muted">{escape(entry["version"])}</span></h3>'
            f'<p>{escape(entry["description"])}</p>'
            f'<a href="{escape(entry["package"])}">Download</a> &middot; '
            f'<a href="{escape(folder)}">Source</a></div></div>')


def render_list(entries):
    if not entries:
        return '<p class="muted">No extensions are published yet.</p>'
    return "\n".join(render_card(entry) for entry in entries)


def render_index(entries):
    return (f'<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width, initial-scale=1">'
            f'<title>Kondor extensions</title><style>{STYLE}</style></head><body>\n'
            f'<h1>Kondor extensions</h1>\n{INSTALL_STEPS}\n<h2>Extensions</h2>\n'
            f'{render_list(entries)}\n</body></html>\n')
