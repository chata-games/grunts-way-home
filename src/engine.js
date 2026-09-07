import { LEVELS } from "./content.js";

export const SAVE_KEY = "grunt-cesta-domu-v2";
export function newGame() {
  return {
    version: 2,
    started: false,
    level: 0,
    completed: {},
    mistakes: 0,
    hints: 0,
    seen: [],
    solved: false,
    sound: false,
    ended: false,
  };
}
export function learnedWords(state) {
  return [
    ...new Set(
      Object.keys(state.completed).flatMap(
        (index) => LEVELS[index]?.learns ?? [],
      ),
    ),
  ];
}
export function unlockedLevel(state) {
  for (let i = 0; i < LEVELS.length; i++) if (!state.completed[i]) return i;
  return LEVELS.length - 1;
}
export function totalStars(state) {
  return Object.values(state.completed).reduce((sum, value) => sum + value, 0);
}
export function restoreGame(raw) {
  try {
    const saved = JSON.parse(raw);
    if (saved?.version !== 2) return newGame();
    const state = newGame();
    for (let i = 0; i < LEVELS.length; i++) {
      const rating = saved.completed?.[i];
      if (!Number.isInteger(rating) || rating < 1 || rating > 3) break;
      state.completed[i] = rating;
    }
    state.level = Number.isInteger(saved.level)
      ? Math.max(0, Math.min(saved.level, unlockedLevel(state)))
      : 0;
    state.started =
      saved.started === true || Object.keys(state.completed).length > 0;
    state.sound = saved.sound === true;
    state.mistakes = Number.isInteger(saved.mistakes)
      ? Math.max(0, Math.min(saved.mistakes, 999))
      : 0;
    state.hints = Number.isInteger(saved.hints)
      ? Math.max(0, Math.min(saved.hints, 2))
      : 0;
    state.seen = Array.isArray(saved.seen)
      ? [
          ...new Set(
            saved.seen.filter(
              (i) =>
                Number.isInteger(i) &&
                i >= 0 &&
                i < LEVELS[state.level].clues.length,
            ),
          ),
        ]
      : [];
    state.solved = saved.solved === true && !!state.completed[state.level];
    state.ended =
      saved.ended === true &&
      Object.keys(state.completed).length === LEVELS.length;
    return state;
  } catch {
    return newGame();
  }
}
export function visitLevel(state, index) {
  if (!Number.isInteger(index) || index < 0 || index > unlockedLevel(state))
    return state;
  return {
    ...state,
    started: true,
    level: index,
    mistakes: 0,
    hints: 0,
    seen: [],
    solved: false,
    ended: false,
  };
}
export function inspectClue(state, index) {
  if (!LEVELS[state.level].clues[index] || state.seen.includes(index))
    return state;
  return { ...state, seen: [...state.seen, index] };
}
export function useHint(state) {
  if (state.solved) return state;
  return { ...state, hints: Math.min(state.hints + 1, 2) };
}
export function submitAnswer(state, answer) {
  if (state.solved) return { state, correct: true };
  const expected = LEVELS[state.level].answer;
  const correct = Array.isArray(expected)
    ? Array.isArray(answer) &&
      expected.length === answer.length &&
      expected.every((word, i) => word === answer[i])
    : answer === expected;
  if (!correct)
    return {
      state: { ...state, mistakes: state.mistakes + 1 },
      correct: false,
    };
  const rating = Math.max(1, 3 - Math.min(state.mistakes, 2) - state.hints);
  return {
    correct: true,
    state: {
      ...state,
      solved: true,
      completed: {
        ...state.completed,
        [state.level]: Math.max(state.completed[state.level] || 0, rating),
      },
    },
  };
}
export function advance(state) {
  if (!state.solved) return state;
  if (state.level === LEVELS.length - 1) return { ...state, ended: true };
  return visitLevel(state, state.level + 1);
}
