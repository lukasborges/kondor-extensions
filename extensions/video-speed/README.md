# Video Speed Controller

## What it does

Changes the playback speed of any HTML5 video. A small overlay in the top left corner of each
video shows its current speed.

- Default keys: S slower, D faster, R reset to normal speed, Z rewind, X advance, V show or hide
  the overlay. Every key, the speed step and the rewind and advance time can be changed in
  Configure.
- The same commands are in the toolbar Extensions menu: Slower, Faster, Reset Speed and
  Show Speed Overlay. The overlay setting is remembered across tabs and restarts.
- "Remember the speed for each site" restores the speed you chose the next time you open the
  same site. Reset Speed forgets it.
- A video inside an embedded frame is controlled with the keys after clicking into it.
- In a private tab nothing is saved.
- "Run on <site>" turns it off for a site.

## Permissions

- https://*/*: needed to control videos on every secure site.
- http://*/*: needed to control videos on every plain site.
- It asks for no API permission.

## Network

None
