# Grunt: Cesta domů

## Domain language

- **Stop (zastavení):** one puzzle on the 12-stop journey. Two clues establish enough evidence to solve it.
- **Chapter (kapitola):** three consecutive stops sharing an environment and learning objective.
- **Clue (stopa):** a free observation of Grunt’s behavior, paired with words from his language.
- **Word (slovo):** a stable made-up spoken word with one Czech meaning. A glyph helps visual recall.
- **Word stone:** a tap target used to compose a message. Selected stones can be removed without a penalty.
- **Journal / dictionary (slovníček):** confirmed meanings, derived from completed stops.
- **Firefly (světluška):** a score from one to three for a completed stop. Replay preserves the best score.
- **Journey map (mapa):** unlocked stops and best scores, with replay access.

## Boundaries

`content.js` owns authored language and puzzles. `engine.js` owns state transitions and save validation. `game.js` owns presentation and browser capabilities. No remote state or API is needed.
