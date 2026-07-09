# Grunt's Way Home — Game Specification

A mobile/tablet-first web game. Theme: **magic jungle, lost caveman**. Goal: help the
lost caveman find his way home. Twist: **you don't share a language with him** — you
must discover how to communicate.

## Tech constraints

- Pure static site: `index.html` + `style.css` + `game.js` in the project root.
  Vanilla JS (ES2020+), **no frameworks, no build step, no external CDNs**. Must run
  by opening `index.html` from any static server.
- Portrait-first responsive layout (design for ~390x844, scale up to tablet/desktop).
  `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">`.
- Input is **tap/click only** (pointer events). Touch targets ≥ 56px. No keyboard needed.
  No hover-dependent UI.
- All art assets are in `assets/` (see list below). Glyph pictograms are NOT images —
  render them as **inline SVG** so they stay crisp.
- Persist progress (learned dictionary, current scene) in `localStorage`.

## Assets (already generated, do not regenerate)

- `assets/caveman-idle.png` — caveman standing (transparent PNG)
- `assets/caveman-happy.png` — caveman celebrating (transparent PNG)
- `assets/caveman-confused.png` — caveman puzzled (transparent PNG)
- `assets/fruit.png` — glowing magic fruit (transparent PNG)
- `assets/crystal.png` — magic crystal shard (transparent PNG)
- `assets/jungle-bg.jpg` — magical jungle background (portrait)
- `assets/cave-home-bg.jpg` — cave home ending background (portrait)

## Core concept: decoding the grunt language

The caveman "speaks" in **glyphs** — abstract symbols shown in his speech bubble.
There are 8 glyph meanings: `water`, `food`, `fire`, `danger`, `home`, `sleep`,
`walk/go`, `magic`. Each meaning has a distinct abstract SVG symbol (spiral, zigzag,
dots, etc.) — deliberately NOT obvious icons; decoding them is the game.

The player has a **Talk Stones** panel: 8 tappable stone buttons, one per glyph.
Tapping stones composes a reply (1–2 glyphs) shown in the player's speech bubble,
then a "Say it" button sends it.

**Learning loop:** each scene gives environmental context (text narration +
background + prop). The caveman grunts a glyph phrase expressing a need. The player
guesses a reply. Reactions:
- Correct glyph(s): caveman-happy pose, joyful grunt text ("Ooga!"), the glyph's
  meaning is CONFIRMED and appears in the **Grunt Dictionary** (a slide-up panel
  listing each glyph with its decoded meaning; undecoded glyphs show "?").
- Wrong: caveman-confused pose, gentle shake animation, a **hint particle** appears
  (e.g. he glances at the river = water-related). No fail state, but a subtle
  "trust" meter of 3 hearts per scene; losing all 3 just replays the scene intro
  with a stronger hint. Trial and error must always converge.

## Scenes (journey structure, ~6 scenes + ending)

1. **Meeting** — tutorial. Caveman grunts one glyph (`food`), a glowing fruit
   (assets/fruit.png) sits nearby. Tapping the fruit OR replying with the food glyph
   works; teaches both interaction kinds and confirms first dictionary entry.
2. **The River** — he needs `water`; decode water glyph.
3. **Dark Grove** — night falls; he wants `fire` + `sleep` (first 2-glyph phrase).
4. **The Predator** — glowing eyes in bushes; he warns `danger`; correct reply is
   `danger` + `walk` (acknowledge and move). Mild time pressure via pulsing vignette,
   but no death.
5. **Magic Crystal Clearing** — crystal (assets/crystal.png) blocks/lights the path;
   `magic` glyph decoded; tapping crystal + magic glyph reply opens the way.
6. **The Fork** — final test: three paths; caveman grunts `home` + direction context;
   player must reply `home` + `walk` and pick the path matching his gaze/hints.
7. **Ending** — cave-home-bg, caveman-happy, warm celebration, confetti/fireflies,
   "He's home!" + stats (wrong guesses, glyphs decoded), replay button.

Between scenes: short walk transition (caveman bobbing across the jungle bg).

## Presentation

- Title screen: jungle bg, game title "Grunt's Way Home", tap to start, and a
  one-line premise: "He's lost. You don't speak Caveman. Help him anyway."
- Caveman idle animation: gentle CSS bob/breathe. Reactions swap the pose image
  with a little pop/shake animation.
- Speech bubbles: caveman's bubble shows glyphs + grunt text ("Ug ka OOGA?");
  player bubble shows selected glyphs.
- Ambient magic: floating light particles over the jungle via CSS/JS, subtle.
- Sound optional: tiny WebAudio blips for grunts/success (synthesized, no files).
  Must be muted until first user gesture; include a mute toggle.
- Polish matters: this game is a showcase. Smooth transitions, nice typography
  (system font stack is fine), dark-jungle color theme matching the art
  (emerald/teal with purple-cyan glow accents).

## Acceptance checklist

- Playable start-to-finish with taps only; every scene solvable via hints alone.
- Dictionary persists mid-game via localStorage; "Restart" clears it.
- No console errors; works in Chrome mobile emulation (390x844) and desktop.
- Layout never overflows horizontally; safe-area aware (env(safe-area-inset-*)).
