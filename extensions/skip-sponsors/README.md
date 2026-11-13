# Skip Sponsors

## What it does

Skips, or offers to skip, the segments that the [SponsorBlock](https://sponsor.ajay.app)
community marked in YouTube videos. Segments are found only for videos that the community has
marked, and only on `www.youtube.com` watch pages.

- Seven categories, each set in Configure to "Skip automatically", "Show a Skip button" or
  "Do nothing". Defaults: Sponsor skips automatically; Self-promotion and Interaction reminder
  show a Skip button; Intro, Outro, Preview or recap and Filler or tangent do nothing.
- The segments of the chosen categories are marked on the video's progress bar, in a color per
  category.
- After an automatic skip, a short notice with an "Undo" button shows for five seconds. Undo goes
  back and plays that segment through.
- Nothing happens during ads, and a segment made for a different cut of the video is ignored.
- Nothing is saved, in normal and in private tabs.
- "Run on <site>" turns it off for a site.

## Permissions

- https://www.youtube.com/*: needed to find the video player and its progress bar.
- It asks for no API permission.

## Network

`sponsor.ajay.app`, once for each video opened, and not at all when every category is set to
"Do nothing".

- Sent: the first 4 characters of the SHA-256 hash of the video id. Many videos share them, so
  the server cannot tell which video is watched. No cookies and no referrer are sent.
- Received: the segments of every video with that hash prefix. Only those of the open video are
  kept, in memory, until the page is closed.

Segment data from [SponsorBlock](https://sponsor.ajay.app) by its contributors, licensed under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). This extension is not
affiliated with SponsorBlock, and it keeps no copy of the data.
