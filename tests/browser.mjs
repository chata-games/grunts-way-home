// Run with PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs when using a shared installation.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { LEVELS } from "../src/content.js";
const { chromium, firefox, webkit } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const baseURL =
  process.env.GAME_URL || "http://127.0.0.1:4173/grunts-way-home/";
const output = process.env.SCREENSHOT_DIR || "/tmp/grunt-browser-checks";
await mkdir(output, { recursive: true });
const engines = (process.env.BROWSERS || "chromium").split(",");
for (const name of engines) {
  const browser = await { chromium, firefox, webkit }[name].launch({
    headless: true,
    args: name === "chromium" ? ["--disable-gpu"] : [],
    ...(name === "firefox" && process.env.FIREFOX_PATH
      ? { executablePath: process.env.FIREFOX_PATH }
      : {}),
  });
  try {
    for (const [width, height] of [
      [1440, 1000],
      [768, 1024],
      [390, 844],
      [320, 640],
      [844, 390],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
        ...(name !== "firefox"
          ? { isMobile: width < 600, hasTouch: width < 900 }
          : {}),
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(baseURL);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("html").getAttribute("lang"), "cs");
      async function noOverflow() {
        await page.waitForFunction(() =>
          [...document.images].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${name} overflow at ${width}, ${await page.locator("h1").innerText()}`,
        );
        assert.equal(
          await page
            .locator("img")
            .evaluateAll((images) =>
              images.every((img) => img.complete && img.naturalWidth > 0),
            ),
          true,
        );
      }
      await noOverflow();
      await page.screenshot({
        path: `${output}/${name}-${width}-intro.png`,
        fullPage: true,
      });
      await page.locator("[data-action=start]").click();
      await page.locator("[data-action=clue][data-id='0']").click();
      assert.ok(
        (await page.locator("dialog").innerText()).includes("zralé ovoce"),
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("dialog").evaluate((el) => el.open),
        false,
      );
      await page.locator("[data-action=answer][data-id=water]").click();
      assert.ok(await page.locator(".feedback").isVisible());
      await page.reload();
      assert.ok(
        (await page.locator("h1").innerText()).includes(LEVELS[0].title),
      );
      assert.equal(await page.locator(".clue-point.seen").count(), 1);
      for (let i = 0; i < LEVELS.length; i++) {
        const level = LEVELS[i];
        assert.ok((await page.locator("h1").innerText()).includes(level.title));
        await noOverflow();
        if (i === 3 || i === 11) {
          await page.screenshot({
            path: `${output}/${name}-${width}-level-${i + 1}.png`,
            fullPage: true,
          });
        }
        if (level.type === "choice")
          await page
            .locator(`[data-action=answer][data-id=${level.answer}]`)
            .click();
        else {
          assert.equal(
            await page.locator("[data-action=say]").isDisabled(),
            true,
          );
          await page
            .locator(`[data-action=word][data-id=${level.answer[0]}]`)
            .click();
          await page.locator("[data-action=remove][data-id='0']").click();
          for (const word of level.answer)
            await page.locator(`[data-action=word][data-id=${word}]`).click();
          await page.locator("[data-action=say]").click();
        }
        assert.ok(await page.locator(".success-panel").isVisible());
        await page.locator("[data-action=next]").click();
      }
      await page.reload();
      assert.ok(await page.locator(".ending").isVisible());
      await noOverflow();
      await page.screenshot({
        path: `${output}/${name}-${width}-ending.png`,
        fullPage: true,
      });
      await page.locator("[data-action=journal]:visible").first().click();
      assert.equal(await page.locator(".dictionary-word.known").count(), 10);
      await page.screenshot({
        path: `${output}/${name}-${width}-journal.png`,
        fullPage: true,
      });
      await page.keyboard.press("Escape");
      await page.locator("[data-action=map]:visible").first().click();
      assert.equal(await page.locator(".map-level:disabled").count(), 0);
      await page.locator("[data-action=visit][data-id='0']").click();
      await page.locator("[data-action=hint]").click();
      await page.locator("[data-action=reveal-hint]").click();
      assert.ok(await page.locator(".hint-visible").isVisible());
      await page.locator("[data-action=answer][data-id=fruit]").click();
      assert.equal(
        await page.locator(".success-panel .stars").getAttribute("aria-label"),
        "2 ze 3 světlušek",
      );
      await page.locator("[data-action=map]:visible").first().click();
      await page.locator("[data-action=reset]").click();
      await page.locator("[data-action=confirm-reset]").click();
      assert.ok(await page.locator("[data-action=start]").isVisible());
      await page.reload();
      await page.locator("[data-action=journal]:visible").first().click();
      assert.equal(await page.locator(".dictionary-word.known").count(), 0);
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${name} ${width}×${height}: full journey, clues, mistakes, saves, replay, journal, hints, reset, images, overflow`,
      );
      await context.close();
    }
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    await context.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("Storage blocked");
        },
      });
    });
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.locator("[data-action=start]").click();
    await page.locator("[data-action=answer][data-id=fruit]").click();
    assert.ok(await page.locator(".success-panel").isVisible());
    assert.ok(
      (await page.locator(".save-note").innerText()).includes("není dostupné"),
    );
    console.log(`PASS ${name}: blocked storage remains playable`);
    await context.close();
  } finally {
    await browser.close();
  }
}
