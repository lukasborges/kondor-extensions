# YouTube Dislike Counts

## What it does

Shows the dislike count next to the dislike button on YouTube watch pages and on Shorts, and a
like/dislike ratio bar under the buttons on watch pages. The ratio bar can be turned off in the
extension's settings.

- The counts come from Return YouTube Dislike and are estimates, since YouTube no longer
  publishes dislikes.
- The extension does not change votes and does not send your own vote.
- It works on `www.youtube.com` only, and "Run on <site>" turns it off there.
- Nothing is saved, in normal and in private tabs.

## Permissions

- https://www.youtube.com/*: needed to find the like and dislike buttons.
- It asks for no API permission.

## Network

`returnyoutubedislikeapi.com`, once for each video opened while the page is open.

- Sent: the id of the open video, with no cookies and no referrer. The service can see which
  videos are opened.
- Received: the like and dislike counts of that video, kept in memory until the page is closed.

Dislike counts from [Return YouTube Dislike](https://returnyoutubedislike.com), used under its
[usage rights](https://returnyoutubedislike.com/docs/usage-rights). This extension is not
affiliated with Return YouTube Dislike.
