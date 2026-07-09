const GLYPHS = [
  { key: "water", hint: "river shimmer" },
  { key: "food", hint: "fruit glow" },
  { key: "fire", hint: "warm spark" },
  { key: "danger", hint: "sharp warning" },
  { key: "home", hint: "cave memory" },
  { key: "sleep", hint: "moon hush" },
  { key: "walk", label: "walk/go", hint: "moving feet" },
  { key: "magic", hint: "strange power" }
];

const glyphSvg = {
  water: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 35c8-12 17 12 26 0s12-9 14-5" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M17 47c7-8 13 7 22-1 4-4 6-5 9-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
  food: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="24" r="5" fill="currentColor"/><circle cx="42" cy="22" r="5" fill="currentColor"/><circle cx="32" cy="42" r="8" fill="none" stroke="currentColor" stroke-width="5"/></svg>',
  fire: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M35 8c-2 13 13 16 3 31-3 4-10 4-13 0-7-9 5-17 2-27-13 10-18 29-7 40 8 7 23 7 31-2 12-15-1-31-16-42z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/></svg>',
  danger: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 50 32 10l22 40H10z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M32 24v13M32 46h.1" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 34 32 16l19 18v16H13V34z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M25 50V38h14v12" fill="none" stroke="currentColor" stroke-width="5"/></svg>',
  sleep: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 21h18L20 43h21M43 14h11L43 29h12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  walk: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M34 13a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/><path d="m31 26-7 12 10 3 9 14M32 29l11 8M27 41l-9 12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  magic: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 7 37 25l18 7-18 7-5 18-7-18-16-7 16-7 7-18z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M12 12l5 5M51 12l-5 5M12 52l5-5M52 51l-6-5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>'
};

const scenes = [
  { title: "Meeting", narration: "A lost caveman steps from the vines. A glowing fruit hums nearby.", grunt: "Ug ka?", phrase: ["food"], answer: ["food"], prop: "fruit", hints: ["His eyes keep darting to the glowing fruit.", "Try the stone that feels like the fruit's glow, or tap the fruit."] },
  { title: "The River", narration: "Moonlit water blocks the trail. Grunt cups his hands and grumbles softly.", grunt: "Mmm ug ka.", phrase: ["water"], answer: ["water"], prop: "river", hints: ["He points to the river shimmer.", "The flowing, wavy sign may answer him."] },
  { title: "Dark Grove", narration: "Night folds around the trees. Grunt shivers, then curls his hands by his cheek.", grunt: "Gah ooo... ug.", phrase: ["fire", "sleep"], answer: ["fire", "sleep"], prop: "campfire", hints: ["He wants warmth first, then rest.", "Use two stones: warm spark, then moon hush."] },
  { title: "The Predator", narration: "Two yellow eyes blink in the brush. Grunt stiffens and urges you onward.", grunt: "AK! Ug dug!", phrase: ["danger"], answer: ["danger", "walk"], prop: "eyes", danger: true, hints: ["He warns you, but standing still is worse.", "Say danger, then walk/go."] },
  { title: "Magic Crystal Clearing", narration: "A crystal blocks the trail with a ringing purple light.", grunt: "Oru ka!", phrase: ["magic"], answer: ["magic"], prop: "crystal", requiresProp: true, hints: ["The crystal answers only when touched.", "Tap the crystal, then speak the strange power glyph."] },
  { title: "The Fork", narration: "Three paths twist ahead. Grunt looks toward the warm cave glow on the right.", grunt: "Humm dug.", phrase: ["home"], answer: ["home", "walk"], fork: true, correctPath: "right", hints: ["His gaze holds on the right-hand path.", "Say home and walk/go, then choose Right."] }
];

const storeKey = "grunts-way-home:v1";
const $ = (id) => document.getElementById(id);
const state = {
  scene: 0,
  learned: {},
  selected: [],
  hearts: 3,
  wrong: 0,
  muted: false,
  propTouched: false,
  chosenPath: null,
  audio: null
};

function glyph(key, extra = "") {
  return `<span class="glyph ${extra}" title="${key}">${glyphSvg[key]}</span>`;
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || "{}");
    state.scene = Number.isInteger(saved.scene) ? Math.min(saved.scene, scenes.length) : 0;
    state.learned = saved.learned || {};
    state.wrong = saved.wrong || 0;
    state.muted = Boolean(saved.muted);
  } catch {
    persist();
  }
}

function persist() {
  localStorage.setItem(storeKey, JSON.stringify({
    scene: state.scene,
    learned: state.learned,
    wrong: state.wrong,
    muted: state.muted
  }));
}

function init() {
  load();
  makeFireflies();
  bind();
  renderStones();
  renderDictionary();
  $("muteBtn").textContent = state.muted ? "Muted" : "Sound";
  if (state.scene > 0 && state.scene < scenes.length) showPlay();
}

function bind() {
  $("startBtn").addEventListener("pointerup", () => { unlockAudio(); showPlay(); });
  $("restartBtn").addEventListener("pointerup", restart);
  $("replayBtn").addEventListener("pointerup", restart);
  $("clearBtn").addEventListener("pointerup", clearReply);
  $("sayBtn").addEventListener("pointerup", checkReply);
  $("dictBtn").addEventListener("pointerup", () => toggleDictionary(true));
  $("closeDictBtn").addEventListener("pointerup", () => toggleDictionary(false));
  $("muteBtn").addEventListener("pointerup", () => {
    unlockAudio();
    state.muted = !state.muted;
    $("muteBtn").textContent = state.muted ? "Muted" : "Sound";
    persist();
  });
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  $(id).classList.add("active");
}

function showPlay() {
  showScreen("playScreen");
  if (state.scene >= scenes.length) return showEnding();
  renderScene();
}

function renderScene() {
  const scene = scenes[state.scene];
  state.selected = [];
  state.hearts = 3;
  state.propTouched = false;
  state.chosenPath = null;
  $("sceneBg").classList.remove("home");
  $("vignette").classList.toggle("danger", Boolean(scene.danger));
  $("sceneLabel").textContent = `${state.scene + 1}/7 - ${scene.title}`;
  $("narration").textContent = scene.narration;
  $("gruntText").textContent = scene.grunt;
  $("caveGlyphs").innerHTML = scene.phrase.map((key) => glyph(key)).join("");
  $("caveman").src = "assets/caveman-idle.png";
  $("caveman").alt = "Lost caveman";
  $("cavemanWrap").classList.remove("walking");
  renderProps(scene);
  renderPaths(scene);
  renderTrust();
  renderReply();
  renderDictionary();
  blip("grunt");
}

function renderProps(scene) {
  const props = $("sceneProps");
  props.innerHTML = "";
  if (!scene.prop) return;
  if (scene.prop === "fruit") {
    props.innerHTML = `<button class="prop fruit" type="button" aria-label="Give glowing fruit"><img src="assets/fruit.png" alt=""></button>`;
    props.querySelector("button").addEventListener("pointerup", () => solveByProp("food"));
  } else if (scene.prop === "crystal") {
    props.innerHTML = `<button class="prop crystal" type="button" aria-label="Touch magic crystal"><img src="assets/crystal.png" alt=""></button>`;
    props.querySelector("button").addEventListener("pointerup", () => { state.propTouched = true; showHint("The crystal rings back. Now answer with its power."); blip("tap"); });
  } else {
    props.innerHTML = `<div class="${scene.prop}" aria-hidden="true"></div>`;
  }
}

function renderPaths(scene) {
  const paths = $("pathChoices");
  paths.hidden = !scene.fork;
  paths.innerHTML = "";
  if (!scene.fork) return;
  ["left", "middle", "right"].forEach((path) => {
    const btn = document.createElement("button");
    btn.className = "path-choice";
    btn.type = "button";
    btn.textContent = path[0].toUpperCase() + path.slice(1);
    btn.addEventListener("pointerup", () => {
      state.chosenPath = path;
      document.querySelectorAll(".path-choice").forEach((el) => el.classList.remove("selected"));
      btn.classList.add("selected");
      showHint(path === "right" ? "Grunt nods at the warm glow." : "Grunt squints. His gaze is still to the right.");
      blip("tap");
    });
    paths.appendChild(btn);
  });
}

function renderStones() {
  const stones = $("stones");
  stones.innerHTML = "";
  GLYPHS.forEach(({ key, label }) => {
    const btn = document.createElement("button");
    btn.className = "stone";
    btn.type = "button";
    btn.setAttribute("aria-label", `Talk stone ${state.learned[key] ? label || key : "unknown"}`);
    btn.innerHTML = glyph(key) + `<small>${state.learned[key] ? (label || key) : "?"}</small>`;
    btn.addEventListener("pointerup", () => selectGlyph(key));
    stones.appendChild(btn);
  });
}

function selectGlyph(key) {
  unlockAudio();
  if (state.selected.length >= 2) state.selected.shift();
  state.selected.push(key);
  renderReply();
  blip("tap");
}

function renderReply() {
  const reply = $("replyGlyphs");
  reply.classList.toggle("empty", state.selected.length === 0);
  reply.innerHTML = state.selected.length ? state.selected.map((key) => glyph(key)).join("") : "Tap stones";
  document.querySelectorAll(".stone").forEach((stone, index) => {
    stone.classList.toggle("selected", state.selected.includes(GLYPHS[index].key));
  });
}

function clearReply() {
  state.selected = [];
  renderReply();
  blip("tap");
}

function checkReply() {
  const scene = scenes[state.scene];
  const replyOk = arraysEqual(state.selected, scene.answer);
  const propOk = !scene.requiresProp || state.propTouched;
  const pathOk = !scene.fork || state.chosenPath === scene.correctPath;
  if (replyOk && propOk && pathOk) return solveScene(scene.answer);
  wrong(scene, !propOk ? "The crystal still waits for your touch." : !pathOk && scene.fork ? "The right path glows warmer when Grunt looks at it." : null);
}

function solveByProp(key) {
  if (state.scene === 0) solveScene([key]);
}

function solveScene(keys) {
  keys.forEach((key) => { state.learned[key] = true; });
  if (state.scene === 3) state.learned.walk = true;
  if (state.scene === 5) state.learned.walk = true;
  $("caveman").src = "assets/caveman-happy.png";
  $("caveman").classList.remove("shake");
  $("caveman").classList.add("pop");
  $("gruntText").textContent = "Ooga!";
  renderStones();
  renderDictionary();
  persist();
  blip("success");
  showHint("Meaning confirmed in the Grunt Dictionary.");
  setTimeout(nextScene, 1100);
}

function wrong(scene, forcedHint) {
  state.wrong += 1;
  state.hearts -= 1;
  $("caveman").src = "assets/caveman-confused.png";
  $("caveman").classList.remove("pop");
  $("caveman").classList.add("shake");
  setTimeout(() => $("caveman").classList.remove("shake"), 450);
  renderTrust();
  const hintIndex = state.hearts <= 0 ? 1 : 0;
  showHint(forcedHint || scene.hints[hintIndex] || scene.hints[0]);
  if (state.hearts <= 0) {
    state.hearts = 3;
    $("narration").textContent = `${scene.narration} ${scene.hints[1] || scene.hints[0]}`;
    renderTrust();
  }
  persist();
  blip("wrong");
}

function nextScene() {
  state.scene += 1;
  persist();
  if (state.scene >= scenes.length) return showEnding();
  walkTransition();
}

function walkTransition() {
  $("cavemanWrap").classList.add("walking");
  $("narration").textContent = "Grunt pads deeper through the glowing jungle...";
  setTimeout(renderScene, 900);
}

function showEnding() {
  showScreen("endingScreen");
  $("sceneBg").classList.add("home");
  $("vignette").classList.remove("danger");
  $("stats").innerHTML = `<div>Wrong guesses: ${state.wrong}</div><div>Glyphs decoded: ${Object.keys(state.learned).length}/8</div>`;
  confetti();
  blip("success");
}

function renderTrust() {
  $("trustRow").innerHTML = [0, 1, 2].map((i) => `<span class="heart ${i >= state.hearts ? "lost" : ""}">&hearts;</span>`).join("");
}

function renderDictionary() {
  $("dictList").innerHTML = GLYPHS.map(({ key, label }) => `
    <div class="dict-item">
      ${glyph(key)}
      <div>${state.learned[key] ? `<b>${label || key}</b><br><span>${GLYPHS.find((g) => g.key === key).hint}</span>` : `<b class="unknown">?</b><br><span class="unknown">Undecoded</span>`}</div>
    </div>
  `).join("");
}

function toggleDictionary(open) {
  $("dictionary").classList.toggle("open", open);
  $("dictionary").setAttribute("aria-hidden", String(!open));
  blip("tap");
}

function showHint(text) {
  const toast = $("hintToast");
  toast.textContent = text;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
}

function restart() {
  localStorage.removeItem(storeKey);
  state.scene = 0;
  state.learned = {};
  state.selected = [];
  state.hearts = 3;
  state.wrong = 0;
  state.propTouched = false;
  state.chosenPath = null;
  showScreen("titleScreen");
  $("sceneBg").classList.remove("home");
  $("vignette").classList.remove("danger");
  renderStones();
  renderDictionary();
}

function unlockAudio() {
  if (!state.audio) {
    state.audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.audio.state === "suspended") state.audio.resume();
}

function blip(type) {
  if (state.muted || !state.audio) return;
  const ctx = state.audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const freq = type === "success" ? 740 : type === "wrong" ? 150 : type === "grunt" ? 220 : 410;
  osc.type = type === "grunt" ? "sawtooth" : "sine";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(type === "success" ? 980 : Math.max(90, freq * 0.72), now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(type === "wrong" ? 0.045 : 0.065, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}

function makeFireflies() {
  const wrap = $("fireflies");
  for (let i = 0; i < 28; i += 1) {
    const dot = document.createElement("i");
    dot.className = "firefly";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.setProperty("--dur", `${2.4 + Math.random() * 4}s`);
    dot.style.setProperty("--alpha", `${0.25 + Math.random() * 0.65}`);
    wrap.appendChild(dot);
  }
}

function confetti() {
  for (let i = 0; i < 38; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = [ "#72ffd8", "#ffd86f", "#b079ff", "#ff7d9a" ][i % 4];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3800);
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

init();
