# Finders & Co.

A cozy hidden-object puzzle game about working in a town's lost property office.
Search busy hand-drawn scenes for lost items, then find their owners in the crowd and hand the items back.

## How to play
- **Run it:** double-click `index.html` (or `Play Finders & Co.bat`). It runs in any modern browser, offline, with nothing to install.
- Click **Start Shift**. Each location has several **case files** (bottom tray). Each one shows the owner's portrait, the lost item and a clue.
- Find the exact item (colour matters, since there are decoys!) and click it to put it in your bag.
- Find the owner by matching their portrait, then click them to return the item.
- Every location hides **3 office cats**.
- Stars: ★ finish · ★ use at most 1 hint · ★ find all 3 cats.

**Controls:** drag / WASD / arrow keys to pan · mouse wheel / pinch / `+` `-` to zoom · click to interact · `H` for a hint · `Esc` to pause.

## Features
- 5 locations: Puddlewick Park (tutorial), Market Street, Sunnyside Beach, Frostmere Village, and the Midnight Carnival (a night level lit by a lantern that follows your pointer)
- 35 cases with named characters and their own dialogue, plus crowds of clickable townsfolk
- Procedurally drawn hand-inked art, with no image files
- Procedural music for every location plus a title and ending theme, ambient soundscapes and synthesized sound effects, all made live with WebAudio
- Tutorial, hints, pause menu, options (music/SFX volume, fullscreen, vignette), level select, star ratings, best times, an ending screen, and auto-saved progress (localStorage)

## Files
- `index.html`: entry point
- `css/style.css`: UI styling
- `js/core.js`: RNG and hand-drawn drawing primitives
- `js/items.js`: lost item art
- `js/art.js`: people, animals, scenery and landmarks
- `js/audio.js`: synth, sound effects, music sequencer and ambience
- `js/levels.js`: level layouts, story and cases
- `js/scene.js`: scene generation, pre-rendering and hit-testing
- `js/game.js`: game loop, input, camera, UI, tutorial and saving
