import { WORDS, CHAPTERS, LEVELS } from "./src/content.js";
import {
  SAVE_KEY,
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
} from "./src/engine.js";

const app = document.querySelector("#app");
const dialog = document.querySelector("#dialog");
let storageAvailable = true;
let state;
try {
  state = restoreGame(localStorage.getItem(SAVE_KEY));
} catch {
  state = newGame();
  storageAvailable = false;
}
let selected = [];
let feedback = "";
let home = !state.started;
let returnFocus = null;
let audio;
const paths = {
  leaf: "M20 3C9 2 3 7 5 14c3 7 15 6 15-11ZM5 21 16 9M8 15l-1-5m5 1h5",
  water: "M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12ZM8 16q0 3 3 3",
  home: "m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7",
  book: "M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-4-2-7-1-10 1Z",
  map: "m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3V5Zm7-3v17m6-14v17",
  spark: "m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
  stone: "m6 4 11 1 5 10-8 6-12-6L6 4Zm0 0 3 10 13 1M9 14l5 7",
  hand: "M7 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9c0 5-3 7-7 7-4 0-6-3-8-7-1-3 2-4 3-1",
  steps:
    "M7 2c-3 0-4 7-2 9 2 2 5 0 5-3S10 2 7 2ZM4 14h5v4H4v-4Zm13-6c-3 0-4 7-2 9 2 2 5 0 5-3s0-6-3-6ZM14 20h5v3h-5v-3Z",
  sign: "M12 2v20M3 5h14l4 4-4 4H3V5Z",
  left: "M20 12H4m7-7-7 7 7 7",
  right: "M4 12h16m-7-7 7 7-7 7",
  check: "m5 12 4 4L20 5",
  close: "m6 6 12 12M6 18 18 6",
  sound: "M3 9v6h4l5 4V5L7 9H3Zm13-2q6 5 0 10m3-13q9 8 0 16",
  mute: "M3 9v6h4l5 4V5L7 9H3Zm13 0 6 6m-6 0 6-6",
  help: "M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 4v.1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  lock: "M6 10V7a6 6 0 0 1 12 0v3M4 10h16v12H4V10Zm8 5v3",
  reset: "M3 11a9 9 0 1 1 2 7M3 4v7h7",
  heart: "M12 21 3 12C-2 5 7 0 12 7c5-7 14-2 9 5l-9 9Z",
};
const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
const glyph = (word) =>
  `<svg class="glyph" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${WORDS[word].glyph}"/></svg>`;
const token = (word) =>
  `<span class="word-token">${glyph(word)}<span>${word}</span></span>`;
const stars = (n) =>
  `<span class="stars" aria-label="${n} ze 3 světlušek">${[1, 2, 3].map((i) => icon("spark", i <= n ? "lit" : "unlit")).join("")}</span>`;
const current = () => LEVELS[state.level];
const count = () => Object.keys(state.completed).length;
const focusKey = (el) =>
  el?.dataset.action ? `${el.dataset.action}:${el.dataset.id || ""}` : null;
function findFocus(key) {
  return [...document.querySelectorAll("button[data-action]")].find(
    (el) =>
      focusKey(el) === key && el.getClientRects().length > 0 && !el.disabled,
  );
}
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
}
function announce(message) {
  document.querySelector("#announcer").textContent = message;
}
function sound(kind = "tap") {
  if (!state.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const notes =
      kind === "success"
        ? [392, 494, 587, 784]
        : kind === "wrong"
          ? [220, 196]
          : kind === "grunt"
            ? [160, 210, 145]
            : [440];
    notes.forEach((frequency, index) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + index * 0.1;
      osc.type = kind === "grunt" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  } catch {
    /* Text and animation provide all feedback when audio is unavailable. */
  }
}
function header() {
  return `<header class="topbar"><button class="brand" data-action="home" aria-label="Grunt: Cesta domů, úvod"><span class="brand-mark">${glyph("hama")}</span><span><b>GRUNT</b><small>CESTA DOMŮ</small></span></button><span class="top-caption">MALÁ SLOVA. VELKÉ DOBRODRUŽSTVÍ.</span><nav aria-label="Ovládání hry"><button class="icon-button" data-action="sound" aria-label="${state.sound ? "Vypnout" : "Zapnout"} zvuk" aria-pressed="${state.sound}" title="${state.sound ? "Vypnout" : "Zapnout"} zvuk">${icon(state.sound ? "sound" : "mute")}</button><button class="icon-button" data-action="help" aria-label="Jak hrát" title="Jak hrát">${icon("help")}</button></nav></header>`;
}
function sidebar() {
  const learned = learnedWords(state);
  const chapterIndex = home
    ? Math.floor(unlockedLevel(state) / 3)
    : current().chapter;
  return `<aside class="sidebar" aria-label="Tvoje výprava"><div class="aside-heading"><span class="eyebrow">TVŮJ CESTOVNÍ DENÍK</span>${icon("leaf")}</div><h2>Každé slovo<br>je krok blíž.</h2><div class="journey-count"><span>Cesta domů</span><b>${count()} <span>/ 12</span></b></div><div class="progress-track"><span style="width:${(count() / 12) * 100}%"></span></div><ol class="chapter-list">${CHAPTERS.map((chapter, index) => `<li class="${index === chapterIndex ? "active" : ""} ${index < chapterIndex ? "passed" : ""}"><span class="chapter-dot">${icon(index < chapterIndex ? "check" : chapter.icon)}</span><div><span class="chapter-kicker">KAPITOLA 0${index + 1}</span><strong>${chapter.title}</strong><small>${index === chapterIndex ? chapter.subtitle : index < chapterIndex ? "Tudy už jste prošli" : "Dobrodružství před vámi"}</small></div></li>`).join("")}</ol><button class="text-button map-button" data-action="map">${icon("map")} Prohlédnout mapu ${icon("right")}</button><div class="journal-peek"><div class="aside-heading"><span class="eyebrow">ROZLUŠTĚNÁ SLOVA</span><b>${learned.length}<span> / 10</span></b></div><div class="mini-words">${Object.keys(
    WORDS,
  )
    .map(
      (word) =>
        `<span class="mini-word ${learned.includes(word) ? "known" : ""}" title="${learned.includes(word) ? `${word} = ${WORDS[word].meaning}` : "Neznámé slovo"}">${learned.includes(word) ? glyph(word) : "?"}</span>`,
    )
    .join(
      "",
    )}</div><button class="text-button" data-action="journal">${icon("book")} Otevřít slovníček ${icon("right")}</button></div><div class="aside-note">${icon("heart")} <p>Na přátelství nepotřebuješ<br>mluvit stejnou řečí.</p></div></aside>`;
}
function particles() {
  return `<div class="fireflies" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 37 + 8) % 96}%;--y:${(i * 23 + 27) % 95}%;--delay:${i * -0.73}s;--duration:${4 + (i % 4)}s"></i>`).join("")}</div>`;
}
function intro() {
  return `<section class="intro scene" aria-label="Kouzelná džungle"><img class="scene-art" src="assets/jungle.webp" alt="Kouzelná džungle s tyrkysovým potokem, kamennou stezkou a slunečními paprsky"><div class="scene-shade"></div>${particles()}<div class="intro-copy"><span class="scene-pill">${icon("spark")} DOBRODRUŽSTVÍ BEZE SLOV</span><h1>Ztracen v džungli.<br><em>Nalezen v přátelství.</em></h1><p>Tohle je Grunt. Ztratil cestu domů.<br>A ty nerozumíš ani slovu, které říká.<br><strong>Zatím.</strong></p><button class="primary start-button" data-action="start">${state.started ? (state.ended ? "Zpátky za Gruntem" : "Pokračovat v cestě") : "Vydat se na cestu"}${icon("right")}</button><span class="intro-meta">12 zastavení <span>·</span> 10 tajemných slov <span>·</span> 1 přátelství</span></div><div class="intro-character"><div class="intro-bubble">Moku…?<span>${glyph("moku")}</span></div><img src="assets/grunt.webp" alt="Grunt, usměvavý pravěký muž s rozcuchanými vlasy a velikým vousem" fetchpriority="high"><span class="character-label">GRUNT <span>tvůj nový kamarád</span></span></div><span class="scene-corner">${icon("leaf")} KDESI V KOUZELNÉ DŽUNGLI</span></section><section class="how-strip" aria-label="Jak funguje dobrodružství"><div><span>01</span><p><b>Dívej se pozorně</b><small>Džungle je plná stop.</small></p>${icon("leaf")}</div><div><span>02</span><p><b>Rozlušti jeho řeč</b><small>Každé slovo má svůj význam.</small></p>${icon("book")}</div><div><span>03</span><p><b>Najděte cestu domů</b><small>Spolu to zvládnete.</small></p>${icon("home")}</div></section>`;
}
function scene() {
  const level = current();
  const chapter = CHAPTERS[level.chapter];
  return `<section class="play-scene scene ${level.type === "build" ? "build-scene" : ""} ${state.solved ? "celebrating" : ""}" aria-label="${chapter.title}"><img class="scene-art" src="assets/${chapter.image}.webp" alt="${chapter.title}: malovaná kouzelná krajina"><div class="scene-shade"></div>${particles()}<div class="scene-title"><span class="eyebrow">KAPITOLA 0${level.chapter + 1} <span> / </span> ${chapter.title.toLocaleUpperCase("cs")}</span><h1>${level.title}</h1></div><span class="level-badge"><b>${String(state.level + 1).padStart(2, "0")}</b> / 12</span><div class="play-character"><img src="assets/grunt.webp" alt="Grunt čeká na tvoji odpověď"><button class="speech" data-action="grunt" aria-label="Grunt říká ${level.phrase.join(" ")}. Přehrát zvuk."><small>GRUNT ŘÍKÁ</small><span class="speech-words">${(state.solved ? ["hama"].filter(() => state.level === 11) : level.phrase).map(token).join("") || `<b class="happy-text">Uga! ${icon("heart")}</b>`}</span><span class="speech-bottom">${state.solved ? "Rozumíte si!" : "Co tím asi myslí?"}</span></button></div><div class="clue-points">${level.clues.map((clue, index) => `<button class="clue-point clue-${index} ${state.seen.includes(index) ? "seen" : ""}" data-action="clue" data-id="${index}" aria-label="Prozkoumat stopu: ${clue.label}${state.seen.includes(index) ? ", prozkoumáno" : ""}"><span class="clue-marker">${icon(state.seen.includes(index) ? "check" : clue.icon)}</span><span>${clue.label}</span><span class="clue-number">${index + 1}</span></button>`).join("")}</div><div class="scene-bottom"><span>${icon("hand")} Klepni na stopy a pozoruj Grunta</span><span>${state.seen.length} / ${level.clues.length} stop</span></div></section>`;
}
function puzzle() {
  const level = current();
  if (state.solved)
    return `<section class="puzzle success-panel"><div class="success-heading"><span class="success-mark">${icon("check")}</span><div><span class="eyebrow">O KROK BLÍŽ DOMOVU</span><h2>To je ono. Rozumíte si!</h2></div>${stars(state.completed[state.level])}</div><p>${level.success}</p><div class="success-footer"><div class="new-words">${level.learns.map((word) => `<span>${token(word)}<b>= ${WORDS[word].meaning}</b></span>`).join("") || `<span class="friendship">${icon("heart")} Vaše přátelství roste.</span>`}</div><button class="primary" data-action="next" id="continue">${state.level === 11 ? "Doprovodit Grunta domů" : "Jdeme dál"}${icon("right")}</button></div></section>`;
  return `<section class="puzzle" aria-label="Hádanka"><p class="story">${level.story}</p><div class="question-row"><h2>${level.question}</h2><button class="hint-button" data-action="hint" aria-label="Nápověda k hádance">${icon("spark")}<span>Nápověda</span></button></div><p class="instruction">${level.instruction}</p>${level.type === "choice" ? `<div class="choices">${level.choices.map((choice, i) => `<button class="choice" data-action="answer" data-id="${choice.id}">${icon(choice.icon)}<span>${choice.label}</span><small>${i + 1}</small></button>`).join("")}</div>` : `<div class="sentence" aria-label="Tvoje zpráva">${Array.from({ length: level.answer.length }, (_, i) => (selected[i] ? `<button class="sentence-word" data-action="remove" data-id="${i}" aria-label="Odebrat ${selected[i]}">${token(selected[i])}${icon("close")}</button>` : `<span class="sentence-slot">${i + 1}<small>${i === 0 ? "Tvoje zpráva" : "…"}</small></span>`)).join("")}</div><div class="build-bottom"><div class="word-bank" aria-label="Slova na výběr">${level.bank.map((word) => `<button class="word-stone" data-action="word" data-id="${word}" ${selected.includes(word) || selected.length >= level.answer.length ? "disabled" : ""}>${token(word)}</button>`).join("")}</div><button class="primary say-button" data-action="say" ${selected.length !== level.answer.length ? "disabled" : ""}>Říct Gruntovi ${icon("right")}</button></div>`}${feedback ? `<div class="feedback" role="status">${icon("hand")}<p>${feedback}</p></div>` : ""}${state.hints ? `<p class="hint-visible">${icon("spark")} ${level.hints[state.hints - 1]}</p>` : ""}</section>`;
}
function ending() {
  return `<section class="ending scene"><img class="scene-art" src="assets/home.webp" alt="Útulný domov ve skále osvětlený teplým světlem"><div class="scene-shade"></div>${particles()}<div class="ending-copy"><span class="scene-pill">${icon("home")} JSTE DOMA</span><h1>Někdy stačí<br><em>porozumět.</em></h1><p>Grunt našel svou rodinu.<br>A cestou i nového kamaráda. Tebe.</p><div class="ending-stats"><span><b>12</b>společných kroků</span><span><b>10</b>rozluštěných slov</span><span><b>${totalStars(state)}<small> / 36</small></b>světlušek</span></div><p class="ending-note">${totalStars(state) === 36 ? "Všechny světlušky svítí. Jsi mistr Gruntovy řeči!" : "Každá cesta se počítá. V mapě můžeš zopakovat hádanky a získat další světlušky."}</p><div class="ending-actions"><button class="primary" data-action="map">Zpátky na stezky ${icon("map")}</button><button class="secondary" data-action="journal">Tvůj slovníček ${icon("book")}</button></div></div><img class="ending-grunt" src="assets/grunt.webp" alt="Tvůj kamarád Grunt je doma"></section><div class="ending-footer">${icon("heart")} Domov je tam, kde ti někdo rozumí.</div>`;
}
function render(focus = null) {
  const preserved = focus || focusKey(document.activeElement);
  app.innerHTML = `${header()}<main id="main" tabindex="-1" class="layout"><div class="main-column">${home ? intro() : state.ended ? ending() : scene() + puzzle()}</div>${sidebar()}</main><footer class="footer"><span>${icon("leaf")} Malé dobrodružství od Chata Games</span><span>Zdarma. Bez reklam. Jen ty a Grunt.</span><span class="save-note">${icon(storageAvailable ? "check" : "help")}${storageAvailable ? "Cesta se ukládá automaticky" : "Ukládání není dostupné. Nezavírej tuto stránku."}</span></footer><nav class="mobile-tools" aria-label="Cestovní deník"><button data-action="map">${icon("map")} Mapa <span>${count()}/12</span></button><button data-action="journal">${icon("book")} Slovníček <span>${learnedWords(state).length}/10</span></button><span class="mobile-stars">${icon("spark")} ${totalStars(state)}</span></nav>`;
  if (preserved) findFocus(preserved)?.focus({ preventScroll: true });
}
function showDialog(title, body, cls = "") {
  if (!dialog.open) returnFocus = focusKey(document.activeElement);
  dialog.className = cls;
  dialog.innerHTML = `<div class="dialog-heading"><div><span class="eyebrow">GRUNT · CESTA DOMŮ</span><h2 id="dialog-title">${title}</h2></div><button class="icon-button" data-action="close" aria-label="Zavřít">${icon("close")}</button></div>${body}`;
  if (!dialog.open) dialog.showModal();
}
function closeDialog() {
  dialog.close();
  if (returnFocus) findFocus(returnFocus)?.focus({ preventScroll: true });
}
function showJournal() {
  const learned = learnedWords(state);
  showDialog(
    "Tvůj slovníček",
    `<p class="dialog-intro">${learned.length} z 10 slov už znáš. Můžeš sem nahlédnout kdykoliv. Slovníček ani stopy tě nestojí žádné světlušky.</p><div class="dictionary-grid">${Object.entries(
      WORDS,
    )
      .map(
        ([word, data]) =>
          `<div class="dictionary-word ${learned.includes(word) ? "known" : "unknown"}"><span class="dictionary-glyph">${learned.includes(word) ? glyph(word) : icon("lock")}</span><div><b>${learned.includes(word) ? word : "???"}</b><span>${learned.includes(word) ? data.meaning : "Ještě neznámé slovo"}</span></div>${learned.includes(word) ? icon("check") : ""}</div>`,
      )
      .join(
        "",
      )}</div><p class="paper-note">${icon("book")} Velikost před věcí. Činnost před směrem. Noko před tím, co odmítáš.</p>`,
    "journal-dialog",
  );
}
function showMap() {
  showDialog(
    "Vaše cesta domů",
    `<p class="dialog-intro">${count()} z 12 zastavení · ${totalStars(state)} z 36 světlušek. Hotové hádanky můžeš hrát znovu. Nejlepší výsledek ti zůstane.</p><div class="map-levels">${CHAPTERS.map((chapter, ci) => `<section><h3>${icon(chapter.icon)} ${chapter.title}</h3>${LEVELS.map((level, index) => (level.chapter === ci ? `<button data-action="visit" data-id="${index}" class="map-level ${index === state.level && state.started ? "current" : ""}" ${index > unlockedLevel(state) ? "disabled" : ""}><span class="map-number">${index > unlockedLevel(state) ? icon("lock") : String(index + 1).padStart(2, "0")}</span><span>${level.title}</span>${state.completed[index] ? stars(state.completed[index]) : icon(index > unlockedLevel(state) ? "lock" : "right")}</button>` : "")).join("")}</section>`).join("")}</div><button class="text-button reset-button" data-action="reset">${icon("reset")} Začít celou výpravu znovu</button>`,
    "map-dialog",
  );
}
function showHelp() {
  showDialog(
    "Jak si porozumět",
    `<div class="help-steps"><p><b>1. Prozkoumej stopy.</b> Klepni na značky v krajině. Grunt ti ukáže, jak svoje slova používá. Čti a porovnávej.</p><p><b>2. Rozlušti zprávu.</b> Vyber význam nebo sestav větu klepáním na slova. Vybrané slovo odebereš klepnutím ve zprávě.</p><p><b>3. Pokračujte spolu.</b> Nová slova se zapíšou do slovníčku. Kdykoliv do něj nahlédni. Nikam se nespěchá!</p></div><div class="help-score">${stars(3)}<p>Za každou hádanku získáš 1–3 světlušky. Každý chybný pokus nebo odhalená nápověda ubere jednu, ale poslední ti vždy zůstane. Stopy a slovníček jsou zdarma. V mapě můžeš výsledek zlepšit.</p></div><p class="paper-note">Hra pro děti 8–12 let. Ovládání dotykem, myší nebo klávesnicí (Tab a Enter). Bez časového limitu, účtu i reklam. Postup zůstává jen v tomto prohlížeči.</p><button class="primary full-width" data-action="close">Rozumím, jdeme na to ${icon("right")}</button>`,
  );
}
function openClue(index) {
  if (home || state.ended) return;
  const clue = current().clues[index];
  if (!clue) return;
  state = inspectClue(state, index);
  save();
  render();
  sound("grunt");
  showDialog(
    clue.label,
    `<div class="clue-illustration">${icon(clue.icon)}<span>STOPA ${index + 1} / ${current().clues.length}</span></div><p class="clue-text">${clue.text}</p><div class="clue-phrase">${clue.phrase.map(token).join("")}</div><button class="primary full-width" data-action="close">Zpátky k hádance ${icon("right")}</button>`,
    "clue-dialog",
  );
}
function answer(value) {
  const result = submitAnswer(state, value);
  state = result.state;
  feedback = result.correct ? "" : current().wrong;
  save();
  render(result.correct ? "next:" : null);
  sound(result.correct ? "success" : "wrong");
  announce(result.correct ? current().success : feedback);
}
function showHint() {
  showDialog(
    "Malé postrčení",
    `<p class="clue-text">${state.hints ? current().hints[state.hints - 1] : "Nejdřív zkus stopy v krajině nebo slovníček. Pokud si stále nevíš rady, světluška ti napoví."}</p><p class="dialog-intro">${state.hints >= 2 ? "Tohle je úplná nápověda. Můžeš si ji přečíst znovu zdarma." : "Odhalení nové nápovědy ubere jednu světlušku z této hádanky. Alespoň jedna ti vždy zůstane."}</p><button class="primary full-width" data-action="reveal-hint">${state.hints >= 2 ? "Zpátky k hádance" : state.hints ? "Odhalit celé řešení" : "Odhalit nápovědu"} ${icon("spark")}</button>`,
  );
}
function startAt(index) {
  state = visitLevel(state, index);
  home = false;
  selected = [];
  feedback = "";
  save();
  render();
  document.querySelector("#main").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
  announce(`Zastavení ${index + 1}. ${current().title}. ${current().story}`);
}
function handleAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === "close") {
    closeDialog();
    return;
  }
  if (action === "sound") {
    state.sound = !state.sound;
    save();
    render();
    sound();
    return;
  }
  if (action === "help") {
    showHelp();
    return;
  }
  if (action === "journal") {
    showJournal();
    return;
  }
  if (action === "map") {
    showMap();
    return;
  }
  if (action === "home") {
    home = true;
    render();
    return;
  }
  if (action === "start") {
    if (!state.started) startAt(0);
    else {
      home = false;
      render();
      document.querySelector("#main").focus();
    }
    sound();
    return;
  }
  if (action === "visit") {
    closeDialog();
    startAt(Number(id));
    return;
  }
  if (action === "reset") {
    showDialog(
      "Nová výprava?",
      `<p class="clue-text">Tím smažeš všechna naučená slova, světlušky i postup v této hře. Grunt tě bude znovu čekat na začátku džungle.</p><div class="dialog-actions"><button class="secondary" data-action="map">Nechat si svou cestu</button><button class="primary" data-action="confirm-reset">Začít znovu</button></div>`,
    );
    return;
  }
  if (action === "confirm-reset") {
    const muted = state.sound;
    state = newGame();
    state.sound = muted;
    selected = [];
    feedback = "";
    home = true;
    closeDialog();
    save();
    render("start:");
    return;
  }
  if (home || state.ended) return;
  if (action === "clue") {
    openClue(Number(id));
    return;
  }
  if (action === "grunt") {
    sound("grunt");
    announce(`Grunt říká: ${current().phrase.join(" ")}`);
    return;
  }
  if (action === "next") {
    state = advance(state);
    selected = [];
    feedback = "";
    save();
    render();
    document.querySelector("#main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    announce(
      state.ended
        ? "Grunt je doma! Děkuje ti za přátelství."
        : `${current().title}. ${current().story}`,
    );
    return;
  }
  if (state.solved) return;
  if (action === "hint") {
    showHint();
    return;
  }
  if (action === "reveal-hint") {
    state = useHint(state);
    save();
    closeDialog();
    render("hint:");
    announce(current().hints[state.hints - 1]);
    return;
  }
  if (action === "answer" && current().type === "choice") {
    answer(id);
    return;
  }
  if (
    action === "word" &&
    current().bank?.includes(id) &&
    selected.length < current().answer.length &&
    !selected.includes(id)
  ) {
    selected.push(id);
    feedback = "";
    sound();
    render();
    document
      .querySelector(
        selected.length === current().answer.length
          ? "[data-action=say]"
          : "[data-action=word]:not(:disabled)",
      )
      ?.focus({ preventScroll: true });
    announce(`Tvoje zpráva: ${selected.join(" ")}`);
    return;
  }
  if (action === "remove") {
    selected.splice(Number(id), 1);
    feedback = "";
    render();
    document
      .querySelector("[data-action=word]:not(:disabled)")
      ?.focus({ preventScroll: true });
    return;
  }
  if (
    action === "say" &&
    current().type === "build" &&
    selected.length === current().answer.length
  )
    answer(selected);
}
app.addEventListener("click", handleAction);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      closeDialog();
  } else handleAction(event);
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && audio?.state === "running")
    audio.suspend().catch(() => {});
});
save();
render();
