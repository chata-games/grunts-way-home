import test from "node:test";
import assert from "node:assert/strict";
import { WORDS, LEVELS, CHAPTERS } from "../src/content.js";
import {
  newGame,
  restoreGame,
  learnedWords,
  unlockedLevel,
  totalStars,
  visitLevel,
  inspectClue,
  useHint,
  submitAnswer,
  advance,
} from "../src/engine.js";

test("the whole journey is solvable and teaches all ten words before the ending", () => {
  let state = visitLevel(newGame(), 0);
  const available = new Set();
  assert.equal(LEVELS.length, 12);
  LEVELS.forEach((level, index) => {
    assert.equal(state.level, index);
    assert.ok(CHAPTERS[level.chapter]);
    assert.ok(level.clues.length >= 2);
    assert.equal(level.hints.length, 2);
    if (level.type === "build") {
      for (const word of level.answer) {
        assert.ok(level.bank.includes(word));
        assert.ok(
          available.has(word) || level.learns.includes(word),
          `Missing clue for ${word} at ${index}`,
        );
      }
      assert.equal(
        new Set(level.answer).size,
        level.answer.length,
        "Word bank permits each word once",
      );
    } else
      assert.equal(
        level.choices.filter((c) => c.id === level.answer).length,
        1,
      );
    level.learns.forEach((word) => {
      assert.ok(WORDS[word]);
      available.add(word);
    });
    const result = submitAnswer(state, level.answer);
    assert.equal(result.correct, true);
    state = advance(result.state);
  });
  assert.equal(state.ended, true);
  assert.equal(totalStars(state), 36);
  assert.deepEqual(new Set(learnedWords(state)), new Set(Object.keys(WORDS)));
  assert.deepEqual(restoreGame(JSON.stringify(state)), state);
});

test("wrong answers and hints cannot block a child or reduce a score below one", () => {
  let state = visitLevel(newGame(), 0);
  for (let i = 0; i < 10; i++)
    state = submitAnswer(useHint(state), "wrong").state;
  assert.equal(state.hints, 2);
  assert.equal(state.solved, false);
  assert.equal(advance(state), state);
  state = submitAnswer(state, "fruit").state;
  assert.equal(state.completed[0], 1);
  assert.equal(advance(state).level, 1);
});

test("clues are free, idempotent, and survive a reload", () => {
  let state = visitLevel(newGame(), 0);
  state = inspectClue(inspectClue(state, 0), 0);
  state = inspectClue(state, 1);
  assert.deepEqual(state.seen, [0, 1]);
  assert.deepEqual(restoreGame(JSON.stringify(state)).seen, [0, 1]);
  assert.equal(submitAnswer(state, "fruit").state.completed[0], 3);
  assert.equal(inspectClue(state, 999), state);
});

test("replay preserves learned words, unlocked stops, and the best score", () => {
  let state = newGame();
  for (let i = 0; i < 4; i++)
    state = advance(submitAnswer(state, LEVELS[i].answer).state);
  state = visitLevel(state, 0);
  state = submitAnswer(useHint(state), "fruit").state;
  assert.equal(state.completed[0], 3);
  assert.equal(unlockedLevel(state), 4);
  assert.equal(learnedWords(state).length, 4);
  assert.equal(visitLevel(state, 5), state);
  assert.equal(visitLevel(state, -1), state);
  assert.equal(visitLevel(state, 1.5), state);
});

test("sentence order and length matter, and success cannot be scored twice", () => {
  const state = { ...newGame(), level: 3 };
  assert.equal(submitAnswer(state, ["moku", "tiki"]).correct, false);
  assert.equal(submitAnswer(state, ["tiki"]).correct, false);
  assert.equal(submitAnswer(state, "tiki moku").correct, false);
  const success = submitAnswer(state, ["tiki", "moku"]);
  assert.equal(success.correct, true);
  assert.equal(submitAnswer(success.state, []).state, success.state);
});

test("saved progress rejects old, corrupt, incomplete and hostile values", () => {
  for (const raw of [null, "", "bad", "null", "[]", "{}", '{"version":1}'])
    assert.deepEqual(restoreGame(raw), newGame());
  const restored = restoreGame(
    JSON.stringify({
      version: 2,
      level: 999,
      completed: { 0: 3, 1: 2, 2: 200, 3: 3 },
      ended: true,
      solved: true,
      seen: [0, 0, -1, 999, "1"],
      hints: -1,
      mistakes: "bad",
    }),
  );
  assert.equal(restored.level, 2);
  assert.deepEqual(restored.completed, { 0: 3, 1: 2 });
  assert.equal(restored.ended, false);
  assert.equal(restored.solved, false);
  assert.deepEqual(restored.seen, [0]);
  assert.equal(restored.hints, 0);
  assert.equal(restored.mistakes, 0);
});
