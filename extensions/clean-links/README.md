# Clean Links

## What it does

Removes tracking parameters, as ClearURLs does.

- **Address:** the address of the page loses its tracking parameters, with no reload and no new
  history entry.
- **Links:** a link is cleaned just before you can see or follow it: on hover, keyboard focus,
  click, middle click and context menu.
- **Redirect wrappers:** links through the redirect pages of Google, Facebook, Instagram, Reddit
  and YouTube go straight to their target. `t.co` links are not unwrapped: that needs a network
  request.
- **Extra parameters to remove:** one name per line, on every site. End a name with `*` for a
  prefix (`utm_*`). Lines starting with `#` are comments.
- **Sites to leave alone:** one site per line. Links to these sites, subdomains included, and
  their own address are never changed. Lines starting with `#` are comments.
- "Run on <site>" turns the extension off on a site that breaks.

## Permissions

- `https://*/*` and `http://*/*`: links must be cleaned on every site.
- It asks for no API permission.

## Network

None.

## Adding a rule

Rules are data in `rules.js`.

- A parameter rule is `{ hosts, parameters }`. `hosts` are domain names (subdomains match) or
  `["*"]` for every site. `parameters` are names, compared ignoring case; a trailing `*` makes a
  prefix.
- Short names such as `s`, `t` or `si` carry real data on many sites, so give them a host.
- A redirect rule is `{ host, path, parameters }`: a regular expression for the host, an optional
  exact path, and the query parameters that may hold the target.
- Bump `version` in `manifest.json`.
- Test the rule on a live link: hover it and check the status bar.
