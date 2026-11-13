# Cookie Banner Blocker

## What it does

Hides the cookie consent banners of OneTrust, Cookiebot, Didomi, Quantcast, TrustArc,
Usercentrics, Sourcepoint, Funding Choices, Complianz and CookieYes, and restores page scrolling.
When the platform has a "Reject all" or "Only necessary" button, it clicks it once per page.
Quantcast and Funding Choices only get hidden.

- "Hide banners only, never click" hides the banners without clicking anything.
- "Run on <site>" turns it off for a site that breaks.
- A hidden banner also hides the platform's own settings dialog on that site. Turn the extension
  off there to change cookie choices.

## Permissions

- https://*/*: needed to find banners on every secure site.
- http://*/*: needed to find banners on every plain site.
- It asks for no API permission.

## Network

None

## Adding a platform

1. Add `rules/<platform>.js` with one statement, `cookieBannerRules.push({ ... });`, holding an
   object literal with these fields:
   - `id`: the file name without `.js`;
   - `name`: the platform's name;
   - `detect`: CSS selectors; the platform is present when one matches;
   - `reject`: optional CSS selectors of the "Reject all" button, tried in order; leave it empty
     when no selector is reliable;
   - `shadowHost`: optional selector of an element with an open shadow root, where `reject` is
     looked up;
   - `hide`: CSS selectors of the banner and its overlay;
   - `scrollLockClasses`: optional classes the platform puts on `html` or `body` to block scrolling.
2. List the file in the manifest's `js` list, after `rules.js` and in alphabetical order.
3. Bump the `version` in `manifest.json`.
4. Test it on a live site of that platform.
