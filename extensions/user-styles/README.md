# User Styles

## What it does

Restyles websites with your own CSS, as Stylus does.

- "Edit Style for This Site…" opens a side panel to write the CSS of the current site, with a live
  preview as you type. Saving an empty text removes the site's style.
- Opening a `.user.css` link shows an install panel. It reads UserCSS files, with their
  `@-moz-document` sections and the default values of `@var` and `@advanced` variables.
- The preprocessors supported are none, `default` and `uso`. `stylus` and `less` are not.
- "Manage Styles…" lists every style: turn each one on or off, remove it (with undo), or open a
  link to a `.user.css` file in a new tab.
- Styles apply from the start of each page. `@import` is not supported.
- Styles cannot be installed, saved or changed in private windows, but they still apply there.
- "Run on <site>" turns it off for a site.

## Permissions

- `<all_urls>`: styles can target any site, and `.user.css` links must be recognized.
- It asks for no API permission.

## Network

- The extension sends nothing.
- Opening a `.user.css` link loads it like any page.
- Images or fonts named in a style's CSS are loaded by the page that uses the style.
