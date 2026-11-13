# Mouse Gestures

## What it does

Hold the right mouse button, draw a short stroke on the page and release it. Kondor runs the
action mapped to that stroke. A line follows the pointer while you draw.

| Gesture | Default action |
| --- | --- |
| Drag left | Go back |
| Drag right | Go forward |
| Drag up | Scroll to top |
| Drag down | Duplicate tab |
| Drag up, then down | Reload |
| Drag down, then right | Close tab |
| Drag down, then up | Do nothing |
| Drag down, then left | Do nothing |

- In Configure, each gesture can run: Do nothing, Go back, Go forward, Reload, Close tab,
  Duplicate tab, Next tab, Previous tab, Scroll to top or Scroll to bottom.
- Configure also sets the trail color and the minimum stroke length. A shorter movement is not a
  gesture.
- Escape, or switching to another window, cancels a gesture in progress.
- No context menu opens after a gesture. On Linux the page's menu is requested when the right
  button is pressed, before a gesture can be known, so a single right-click opens no menu.
  **Double right-click** (within half a second) to open it.
- Use "Run on <site>" to turn gestures off on sites that use the right button for their own drags,
  such as maps, drawing tools and games.
- Gestures over embedded frames (`<iframe>`, such as embedded videos) are not recognized.
- Nothing is saved, in normal and in private tabs.

## Permissions

- https://*/*: gestures work on every secure site.
- http://*/*: gestures work on every site without encryption.
- tabs: goes back, forward, reloads, closes, duplicates and switches tabs.

## Network

None.
