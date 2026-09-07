# Grunt: Cesta domů

[Hrát zdarma](https://chata-games.github.io/grunts-way-home/)

Česká hra pro děti 8–12 let. Pomoz ztracenému pravěkému muži najít cestu domů kouzelnou džunglí. Háček? Nemluvíte stejným jazykem. Jeho řeč musíš nejdřív rozluštit.

## Hra

- 12 zastavení ve 4 kapitolách, 10 slov jedné stálé řeči.
- Pozorování stop, porovnávání významů, skládání vět a logika záporu.
- Slovníček, mapa, dvě úrovně nápovědy a opakování hotových hádanek.
- 1–3 světlušky za hádanku. Nejlepší výsledek zůstává zachován.
- Automatické ukládání v tomto prohlížeči, volitelný zvuk a omezení animací podle nastavení systému.
- Dotyk, myš i klávesnice. Telefon, tablet i počítač, na výšku i na šířku.
- Zdarma, bez reklam, sledování, účtu a externích služeb.

## Local development

Requires Python 3 for a local server and Node.js 22+ for tests. The game itself has no package dependencies or build step.

```sh
npm start
# Open http://localhost:4173/ when started from this game directory.
npm run check
```

Serve the parent directory to test the GitHub Pages subpath:

```sh
python3 -m http.server 4173
# Open http://localhost:4173/grunts-way-home/
```

Browser regression checks use a separate Playwright installation:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium firefox webkit
BROWSERS=chromium,firefox,webkit node tests/browser.mjs
```

The browser script expects the parent-directory server above. Set `GAME_URL` to use another URL. `SCREENSHOT_DIR` defaults to `/tmp/grunt-browser-checks`. A shared Playwright installation can be supplied through `PLAYWRIGHT_MODULE` (absolute path to its `index.mjs`).

## Structure

- `src/content.js`: Czech story, clues, language, and 12 puzzle definitions.
- `src/engine.js`: saved progress, answer rules, scoring, and replay.
- `game.js`: accessible HTML interface, dialogs, and optional audio.
- `style.css`: responsive layout and reduced-motion support.
- `assets/`: original generated WebP art and locally hosted OFL fonts.
- `docs/ART-PROMPTS.md`: exact built-in imagegen prompts.

Saved progress uses the versioned `grunt-cesta-domu-v2` localStorage key. Invalid or old-format saves start a fresh game. If storage is blocked, play continues and the page tells the player that progress cannot be saved. Restart requires an explicit confirmation in the game.

## GitHub Pages

Live URL: https://chata-games.github.io/grunts-way-home/

Set **Settings → Pages → Source: GitHub Actions** once. `.github/workflows/deploy.yml` checks the game and publishes only runtime files on each push to `main`. All asset and module URLs are relative, so the game also works under the parent site subpath. `.nojekyll` is included.

No server, secrets, API key, ad service, or paid hosting is required. The Lora and Nunito fonts are bundled under the SIL Open Font License; their license files are in `assets/fonts/`.
