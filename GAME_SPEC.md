# Grunt: Cesta domů — game specification

The September 2026 rebuild replaces the original glyph demo. Main language: Czech. Audience: ages 8–12. A static, mobile-first browser adventure, free and without ads.

## Learning loop

1. Inspect two freely repeatable environmental clues.
2. Infer a word from what Grunt does in different contexts.
3. Choose its meaning or tap word stones to build a sentence.
4. Receive specific, non-punitive feedback. Correct answers advance the story and record new words.
5. Reuse learned words in harder puzzles, including size, direction, and negation.

One word has one meaning throughout. There are ten words: moku (fruit), nalu (water), balu (big), tiki (small), luma (light), noko (not/without), paku (go), sula (left), taro (right), hama (home). Directions always refer to the player’s view. Size precedes a noun, an action precedes direction, and noko precedes the excluded object.

## Journey

| Chapter | Stops | Learning objective |
| --- | --- | --- |
| Šeptající džungle | 1–3 | Fruit, water, big/small from contrasting evidence |
| Údolí světlušek | 4–6 | First sentence, a shared property, negation |
| Ztracené stezky | 7–9 | An action, direction, giving an instruction |
| Za světlem domova | 10–12 | Transfer negation, a four-word sentence, homecoming |

Each stop awards 1–3 fireflies. Each wrong answer or newly revealed hint reduces the rating by one, with a minimum of one. Free clues and dictionary reads never reduce the rating. Completed stops can be replayed; the best rating and all unlocked content stay available. No timer, lives, death, or failure lockout.

## Implementation and accessibility

Vanilla ES modules; no build or runtime dependencies. Static relative URLs work under a GitHub Pages subpath. Four original imagegen assets, local fonts, no CDN calls. Optional short Web Audio sounds start only on player input; sound is off by default. All gameplay has text feedback.

Portrait-first layout from 320px, tablet and desktop layout, landscape support, safe-area-aware navigation, page zoom enabled, native modal focus trapping, labelled controls, polite live announcements, keyboard play, and reduced-motion support. Core touch targets are at least 44px. A versioned local save stores the current stop, progress, hints, inspected clues, and sound setting. Selected sentence tiles can be rebuilt after reload. Corrupt saves are validated; blocked storage does not stop play.

The acceptance checks are in `tests/engine.test.js` and `tests/browser.mjs`. They cover the complete journey, order-sensitive sentences, recovery from mistakes, save validation, replay, storage denial, images, and horizontal overflow at five screen sizes.
