import { Chessground } from "./vendor/chessground/chessground.min.js";
import { Chess } from "./vendor/chess.js/chess.js";
import { Engine, formatScore, winChance } from "./engine.js";

const SOUND_KEY = "chess-portfolio-sound";
const STEPS = 8;
const LADDER = [
  { label: "0.0", share: 50 }, { label: "+0.8", share: 58 }, { label: "+1.6", share: 64 }, { label: "+2.5", share: 70 },
  { label: "+3.4", share: 76 }, { label: "+4.9", share: 84 }, { label: "M3", share: 92 }, { label: "M1", share: 96 }, { label: "1-0", share: 100 },
];
const ENGINE_URL = "vendor/stockfish/stockfish-19-lite-single.js";
const MOVETIME = 900;
const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const LEVELS = {
  100: { skill: 0, depth: 1, random: 0.8 },
  400: { skill: 0, depth: 1, random: 0.4 },
  800: { skill: 3, depth: 2, random: 0.1 },
  1600: { skill: 8, depth: 5, random: 0 },
  2000: { skill: 13, depth: 9, random: 0 },
  3000: { skill: 20, movetime: 1000, random: 0 },
};
const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const CHESSCOM = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/";
const FALLBACK = { "move-self": "Move", "move-opponent": "Move", capture: "Capture", castle: "Move", promote: "Move", "move-check": "Check", "game-end": "Victory" };

const ICONS = "vendor/chesscom/";
const VERDICTS = {
  brilliant: { text: "Brilliant", icon: "brilliant" },
  great: { text: "Great", icon: "great" },
  best: { text: "Best", icon: "best" },
  excellent: { text: "Excellent", icon: "excellent" },
  good: { text: "Good", icon: "good" },
  inaccuracy: { text: "Inaccuracy", icon: "inaccuracy" },
  mistake: { text: "Mistake", icon: "mistake" },
  blunder: { text: "Blunder", icon: "blunder" },
};

const games = [
  {
    credit: "Paul Morphy vs Duke Karl and Count Isouard, Paris 1858",
    from: 10,
    fen: "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10",
    line: "Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#",
    hints: [
      "Give up the knight to open the b-file toward the king.",
      "Take back, with check.",
      "Castle long. The rook lands on the open d-file with the king safe.",
      "The knight on d7 is pinned. Take it, even with the rook.",
      "Put the other rook on the d-file.",
      "Take the rook, with check.",
      "Pull the defender away with a queen sacrifice.",
      "The rook delivers mate.",
    ],
  },
  {
    credit: "Adolf Anderssen vs Lionel Kieseritzky, London 1851",
    from: 17,
    fen: "rnb1k1nr/p2p1ppp/5q2/1pb2N1P/4PBP1/2NP1Q2/PPP5/R4KR1 w kq - 3 17",
    line: "Nd5 Qxb2 Bd6 Bxg1 e5 Qxa1+ Ke2 Na6 Nxg7+ Kd8 Qf6+ Nxf6 Be7#",
    hints: [
      "Attack the queen with a knight from the center.",
      "Offer the bishop on d6 and let both rooks hang.",
      "Push the e-pawn to shut the queen out of the defense.",
      "Step the king out of check calmly.",
      "Take on g7 with check.",
      "Sacrifice the queen with check so a knight has to take.",
      "The bishop delivers mate.",
    ],
  },
  {
    credit: "Adolf Anderssen vs Jean Dufresne, Berlin 1852",
    from: 17,
    fen: "1r2k2r/pbppnppp/1bn5/4P2q/Q3N3/B1PB1N2/P4PPP/R3R1K1 w k - 1 17",
    line: "Nf6+ gxf6 exf6 Rg8 Rad1 Qxf3 Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#",
    hints: [
      "Jump the knight to f6 with check, even though it is defended.",
      "Take back with the pawn and open the e-file.",
      "Bring the last rook to the d-file. Let the knight on f3 hang.",
      "Take the knight on e7 with the rook, with check.",
      "Sacrifice the queen on d7 with check.",
      "Bishop check from f5, uncovering the rook.",
      "Bishop check again, this time on d7.",
      "The dark bishop delivers mate on e7.",
    ],
  },
  {
    credit: "Edward Lasker vs George Thomas, London 1912",
    from: 11,
    fen: "rn3rk1/pbppq1pp/1p2pb2/4N2Q/3PN3/3B4/PPP2PPP/R3K2R w KQ - 6 11",
    line: "Qxh7+ Kxh7 Nxf6+ Kh6 Neg4+ Kg5 h4+ Kf4 g3+ Kf3 Be2+ Kg2 Rh2+ Kg1 Kd2#",
    hints: [
      "Sacrifice the queen on h7 with check.",
      "Knight takes the bishop on f6, with check.",
      "The other knight checks from g4.",
      "Push the h-pawn with check.",
      "Push the g-pawn with check.",
      "Bishop check from e2.",
      "Rook check from h2.",
      "A quiet king move delivers mate.",
    ],
  },
  {
    credit: "Richard Réti vs Savielly Tartakower, Vienna 1910",
    from: 6,
    fen: "rnbqkb1r/pp3ppp/2p2n2/4p3/3PN3/3Q4/PPP2PPP/R1B1KBNR w KQkq - 0 6",
    line: "dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Kc7 Bd8#",
    hints: [
      "Take the pawn on e5.",
      "Block the check with the bishop.",
      "Castle long and put the rook on the d-file.",
      "Sacrifice the queen on d8 with check.",
      "Bishop check from g5, uncovering the rook on d1.",
      "The bishop delivers mate on d8.",
    ],
  },
];

const ui = {
  status: document.getElementById("status"),
  hint: document.getElementById("hint"),
  show: document.getElementById("show"),
  back: document.getElementById("back"),
  again: document.getElementById("again"),
  review: document.getElementById("review"),
  credit: document.getElementById("credit"),
  evalBar: document.getElementById("eval"),
  evalLabel: document.getElementById("eval-label"),
  hintBar: document.getElementById("scrollhint"),
  hintThumb: document.querySelector(".scrollhint-thumb"),
  top: document.querySelector(".top"),
  side: document.querySelector(".side"),
  sound: document.getElementById("sound"),
  soundIcon: document.getElementById("sound-icon"),
  reveal: document.getElementById("reveal"),
  versus: document.getElementById("versus"),
  puzzles: document.getElementById("puzzles"),
  levels: document.getElementById("levels"),
  levelButtons: [...document.querySelectorAll(".btn.level")],
  layout: document.querySelector(".layout"),
  game: document.querySelector(".game"),
  content: document.getElementById("site"),
  steps: [...document.querySelectorAll("[data-step]")],
};

const sounds = {};
let soundOn = read(SOUND_KEY, true);
let game;
let pairs = [];
let done = 0;
let hints = 0;
let wrong = false;
let built = 0;
let busy = false;
let review = [];
let mode = "puzzle";
let level = null;
let over = false;
const chess = new Chess();

let engine = null;
let engineReady = false;
let evalToken = 0;
let positionEval = null;

const board = Chessground(document.getElementById("board"), {
  coordinates: true,
  premovable: { enabled: false },
  drawable: { enabled: false },
  movable: { free: false, showDests: true, rookCastle: false, events: { after: onMove } },
});

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function sound(name) {
  if (!sounds[name]) {
    const audio = new Audio(`${CHESSCOM}${name}.mp3`);
    audio.addEventListener("error", () => {
      if (FALLBACK[name]) {
        audio.src = `vendor/sounds/${FALLBACK[name]}.mp3`;
      }
    });
    sounds[name] = audio;
  }
  return sounds[name];
}

function play(name) {
  if (!soundOn) {
    return;
  }
  const audio = sound(name);
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function soundFor(move, self) {
  if (chess.isCheckmate()) {
    play("move-check");
    play("game-end");
  } else if (chess.inCheck()) {
    play("move-check");
  } else if (move.flags.includes("k") || move.flags.includes("q")) {
    play("castle");
  } else if (move.promotion) {
    play("promote");
  } else if (move.captured) {
    play("capture");
  } else {
    play(self ? "move-self" : "move-opponent");
  }
}

function dests() {
  const map = new Map();
  for (const move of chess.moves({ verbose: true })) {
    map.set(move.from, [...(map.get(move.from) ?? []), move.to]);
  }
  return map;
}

let shapes = [];

function mark(list) {
  shapes = list;
  board.setShapes(shapes);
}

function sync(lastMove) {
  const locked = wrong || busy || chess.isGameOver();
  board.set({
    fen: chess.fen(),
    turnColor: chess.turn() === "w" ? "white" : "black",
    check: chess.inCheck(),
    lastMove,
    movable: { color: locked ? undefined : "white", dests: locked ? new Map() : dests() },
    drawable: { shapes },
  });
}

function icon(verdict, size) {
  const { text, icon: name } = VERDICTS[verdict];
  return `<img src="${ICONS}${name}.png" alt="${text}" width="${size}" height="${size}">`;
}

function moveCell(entry) {
  if (!entry) {
    return "";
  }
  const score = entry.score ? `<small>${formatScore(entry.score)}</small>` : "";
  return `<span class="mv">${entry.verdict ? icon(entry.verdict, 18) : ""}${entry.san}${score}</span>`;
}

function renderReview() {
  ui.review.replaceChildren();
  for (let i = 0; i < review.length; i += 2) {
    const item = document.createElement("li");
    item.innerHTML = `<span class="n">${(mode === "versus" ? 1 : game.from) + i / 2}.</span>${moveCell(review[i])}${moveCell(review[i + 1])}`;
    ui.review.append(item);
  }
  ui.review.scrollTop = ui.review.scrollHeight;
}

/* Evaluation */

function setBar(share, label) {
  ui.evalBar.style.setProperty("--white", `${Math.min(97, Math.max(3, share))}%`);
  ui.evalLabel.textContent = label;
}

function showLadder() {
  const level = Math.round((done / pairs.length) * STEPS);
  setBar(LADDER[level].share, LADDER[level].label);
}

function showScore(score) {
  setBar(50 + 50 * winChance(score), formatScore(score));
}

function showResult() {
  if (chess.isCheckmate()) {
    const whiteWon = chess.turn() === "b";
    setBar(whiteWon ? 100 : 0, whiteWon ? "1-0" : "0-1");
  } else {
    setBar(50, "\u00bd");
  }
}

function startEngine() {
  if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") {
    return;
  }
  try {
    engine = new Engine(ENGINE_URL);
  } catch {
    engine = null;
    return;
  }
  engine.ready.then(() => {
    engineReady = true;
    analysePosition();
  });
}

async function analysePosition() {
  positionEval = null;
  const token = ++evalToken;
  if (chess.isGameOver()) {
    showResult();
    return null;
  }
  if (!engineReady) {
    showLadder();
    return null;
  }
  ui.evalLabel.textContent = "…";
  const result = await engine.analyse(chess.fen(), MOVETIME, (partial) => {
    if (token === evalToken && partial.lines[0]) {
      showScore(partial.lines[0]);
      positionEval = partial;
    }
  });
  if (token !== evalToken) {
    return null;
  }
  if (result.lines[0]) {
    showScore(result.lines[0]);
  }
  positionEval = result;
  return result;
}

/* Move review */

function see(position, square) {
  const captures = position.moves({ verbose: true }).filter((m) => m.to === square && m.captured);
  if (captures.length === 0) {
    return 0;
  }
  captures.sort((a, b) => VALUE[a.piece] - VALUE[b.piece]);
  position.move(captures[0]);
  const gain = VALUE[captures[0].captured] - see(position, square);
  position.undo();
  return Math.max(0, gain);
}

function isSacrifice(move) {
  const gained = move.captured ? VALUE[move.captured] : 0;
  const lost = see(new Chess(chess.fen()), move.to);
  return gained - lost <= -1;
}

function classify(before, after, move) {
  if (!before?.lines[0] || !after?.lines[0]) {
    return null;
  }
  const sign = move.color === "w" ? 1 : -1;
  const bestWin = winChance(before.lines[0]) * 50 * sign;
  const afterWin = winChance(after.lines[0]) * 50 * sign;
  const drop = bestWin - afterWin;
  const uci = move.from + move.to + (move.promotion ?? "");
  const isBest = uci === before.best;
  if (isBest || drop <= 0.5) {
    if (isSacrifice(move) && afterWin > 0) {
      return "brilliant";
    }
    const second = before.lines[1];
    if (isBest && second && bestWin - winChance(second) * 50 * sign >= 15) {
      return "great";
    }
    return "best";
  }
  if (drop < 2) return "excellent";
  if (drop < 5) return "good";
  if (drop < 10) return "inaccuracy";
  if (drop < 20) return "mistake";
  return "blunder";
}

function badge(square, verdict) {
  mark([
    {
      orig: square,
      customSvg: {
        html: `<image href="${ICONS}${VERDICTS[verdict].icon}.png" x="62" y="2" width="36" height="36"/>`,
      },
    },
  ]);
}

function verdictText(verdict, after) {
  const score = after?.lines[0] ? ` Eval ${formatScore(after.lines[0])}.` : "";
  return `${icon(verdict, 22)}${VERDICTS[verdict].text}.${score}`;
}

/* Game flow */

function build(level) {
  if (level <= built) {
    return;
  }
  const first = built === 0;
  const target = ui.steps.find((element) => Number(element.dataset.step) > built);
  built = level;
  for (const element of ui.steps) {
    element.classList.toggle("built", Number(element.dataset.step) <= built);
  }
  if (first) {
    play("notify");
  }
  setTimeout(() => {
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (first) {
      setTimeout(hintScrollbar, 600);
    }
  }, 350);
}

function setStatus(html) {
  ui.status.innerHTML = html;
}

function updateControls() {
  const finished = mode === "versus" ? over : done === pairs.length;
  ui.hint.hidden = finished || wrong || busy;
  ui.show.hidden = finished || wrong || busy;
  ui.back.hidden = mode === "versus" ? wrong || busy || review.length === 0 : !wrong;
  ui.back.classList.toggle("danger", mode === "puzzle" || wrong);
  ui.back.classList.toggle("primary", mode === "puzzle" || wrong);
  ui.back.classList.toggle("square", mode === "versus" && !wrong);
  ui.back.innerHTML = mode === "versus" && !wrong
    ? '<svg class="icon" aria-hidden="true"><use href="#i-arrow-counter-clockwise"/></svg>'
    : '<svg class="icon" aria-hidden="true"><use href="#i-arrow-counter-clockwise"/></svg> Take back';
  ui.back.title = "Take back";
  ui.again.hidden = wrong || busy;
  ui.again.classList.toggle("primary", finished);
  ui.again.classList.toggle("square", !finished);
  ui.again.textContent = "";
  if (finished) {
    ui.again.append("New game");
  } else {
    ui.again.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-shuffle"/></svg>';
  }
  ui.versus.hidden = mode === "versus";
  ui.puzzles.hidden = mode === "puzzle";
}

async function advance(move, before) {
  const step = pairs[done];
  done += 1;
  hints = 0;
  busy = true;
  mark([]);
  soundFor(move, true);
  sync([move.from, move.to]);
  renderReview();
  build(Math.round((done / pairs.length) * STEPS));
  updateControls();
  const over = done === pairs.length;
  setStatus(over ? "Checkmate. 1-0" : "Reviewing…");

  review.push({ san: move.san, verdict: null, score: null });
  renderReview();

  const after = await analysePosition();
  const verdict = over ? (isSacrifice(move) ? "brilliant" : "best") : classify(before, after, move);
  const mine = review.at(-1);
  mine.verdict = verdict;
  mine.score = after?.lines[0] ?? null;
  renderReview();
  if (verdict) {
    badge(move.to, verdict);
    setStatus(over ? `${icon(verdict, 22)}${VERDICTS[verdict].text}. Checkmate, 1-0.` : verdictText(verdict, after));
  } else if (!over) {
    setStatus("White to move");
  }
  if (over) {
    busy = false;
    updateControls();
    return;
  }

  await wait(verdict ? 900 : 450);
  const reply = chess.move(step.black);
  soundFor(reply, false);
  busy = false;
  sync([reply.from, reply.to]);
  review.push({ san: reply.san, verdict: null, score: null });
  renderReview();
  updateControls();
  const replyEval = await analysePosition();
  if (review.at(-1)?.san === reply.san && replyEval) {
    const theirs = review.at(-1);
    theirs.verdict = classify(after, replyEval, reply);
    theirs.score = replyEval.lines[0] ?? null;
    renderReview();
  }
}

async function onMove(from, to) {
  const before = positionEval;
  const move = chess.move({ from, to, promotion: "q" });
  if (!move) {
    sync();
    return;
  }
  if (mode === "versus") {
    versusMove(move, before);
    return;
  }
  if (move.san === pairs[done].white || chess.isCheckmate()) {
    advance(move, before);
    return;
  }
  wrong = true;
  play("illegal");
  sync([from, to]);
  setStatus("Not the game move…");
  updateControls();
  const after = await analysePosition();
  if (!wrong) {
    return;
  }
  const verdict = classify(before, after, move);
  if (verdict) {
    badge(to, verdict);
    setStatus(`${verdictText(verdict, after)} Not the game move. Take it back.`);
  } else {
    mark([{ orig: to, brush: "red" }]);
    setStatus("Not the game move. Take it back.");
  }
}

/* Versus mode */

function unlockByScore(score) {
  if (!score) {
    return;
  }
  const step = Math.max(0, Math.min(STEPS, Math.floor(winChance(score) * 10)));
  if (step > built) {
    build(step);
  }
}

function endVersus() {
  over = true;
  busy = false;
  showResult();
  if (chess.isCheckmate()) {
    const whiteWon = chess.turn() === "b";
    if (whiteWon) {
      build(STEPS);
    }
    setStatus(whiteWon ? "Checkmate. You win, 1-0." : "Checkmate. Stockfish wins, 0-1.");
  } else {
    setStatus("Draw.");
  }
  sync();
  updateControls();
}

async function engineReply() {
  const config = LEVELS[level];
  let uci = null;
  if (Math.random() < config.random) {
    const legal = chess.moves({ verbose: true });
    const pick = legal[Math.floor(Math.random() * legal.length)];
    uci = pick.from + pick.to + (pick.promotion ?? "");
  } else if (engineReady) {
    uci = await engine.play(chess.fen(), config);
  }
  if (!uci || uci === "(none)") {
    const legal = chess.moves({ verbose: true });
    const pick = legal[Math.floor(Math.random() * legal.length)];
    uci = pick.from + pick.to + (pick.promotion ?? "");
  }
  return chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
}

async function versusMove(move, before) {
  busy = true;
  mark([]);
  soundFor(move, true);
  sync([move.from, move.to]);
  review.push({ san: move.san, verdict: null, score: null });
  renderReview();
  updateControls();
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      badge(move.to, isSacrifice(move) ? "brilliant" : "best");
      review.at(-1).verdict = "best";
      renderReview();
    }
    endVersus();
    return;
  }
  setStatus("Reviewing\u2026");
  const after = await analysePosition();
  const verdict = classify(before, after, move);
  const mine = review.at(-1);
  mine.verdict = verdict;
  mine.score = after?.lines[0] ?? null;
  renderReview();
  if (verdict) {
    badge(move.to, verdict);
    setStatus(verdictText(verdict, after));
  } else {
    setStatus("Stockfish is thinking\u2026");
  }
  unlockByScore(after?.lines[0]);

  await wait(verdict ? 700 : 300);
  const reply = await engineReply();
  soundFor(reply, false);
  busy = false;
  sync([reply.from, reply.to]);
  review.push({ san: reply.san, verdict: null, score: null });
  renderReview();
  if (chess.isGameOver()) {
    endVersus();
    return;
  }
  updateControls();
  const replyEval = await analysePosition();
  if (review.at(-1)?.san === reply.san && replyEval) {
    const theirs = review.at(-1);
    theirs.verdict = classify(after, replyEval, reply);
    theirs.score = replyEval.lines[0] ?? null;
    renderReview();
    unlockByScore(replyEval.lines[0]);
  }
}

function startVersus(chosen) {
  mode = "versus";
  level = chosen;
  over = false;
  chess.load(START);
  review = [];
  hints = 0;
  wrong = false;
  busy = false;
  mark([]);
  ui.levels.hidden = true;
  sync();
  renderReview();
  ui.credit.textContent = `You are White against Stockfish at ${level}. Hard mode: the page unlocks as your winning chances grow.`;
  setStatus("Your move.");
  updateControls();
  analysePosition();
  play("game-start");
}

function showLevels() {
  ui.levels.hidden = !ui.levels.hidden;
}

function takeBack() {
  if (mode === "versus" && !wrong) {
    if (busy || review.length === 0) {
      return;
    }
    const plies = chess.turn() === "w" && review.length >= 2 ? 2 : 1;
    for (let i = 0; i < plies; i += 1) {
      chess.undo();
      review.pop();
    }
    over = false;
    mark([]);
    sync();
    renderReview();
    setStatus("Your move.");
    updateControls();
    analysePosition();
    return;
  }
  chess.undo();
  wrong = false;
  mark([]);
  const last = chess.history({ verbose: true }).at(-1);
  sync(last ? [last.from, last.to] : undefined);
  setStatus("White to move");
  updateControls();
  analysePosition();
}

function newGame(fromClick) {
  if (mode === "versus") {
    startVersus(level);
    return;
  }
  game = games[Math.floor(Math.random() * games.length)];
  const moves = game.line.split(" ");
  pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ white: moves[i], black: moves[i + 1] ?? null });
  }
  chess.load(game.fen);
  over = false;
  review = [];
  done = 0;
  hints = 0;
  wrong = false;
  busy = false;
  mark([]);
  sync();
  renderReview();
  ui.credit.textContent = `${game.credit}, from move ${game.from}.`;
  setStatus("White to move");
  updateControls();
  analysePosition();
  if (fromClick) {
    play("game-start");
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

ui.hint.addEventListener("click", () => {
  if (mode === "versus") {
    const best = positionEval?.best;
    if (!best) {
      setStatus("Still thinking. Try again in a moment.");
      return;
    }
    mark([{ orig: best.slice(0, 2), dest: best.slice(2, 4), brush: "green" }]);
    setStatus("Stockfish suggests the marked move.");
    return;
  }
  const step = pairs[done];
  hints += 1;
  if (hints === 1) {
    setStatus(game.hints[done]);
    return;
  }
  const move = chess.moves({ verbose: true }).find((m) => m.san === step.white);
  mark([{ orig: move.from, brush: "green" }]);
  setStatus(`${game.hints[done]} The piece is marked.`);
});

ui.show.addEventListener("click", () => {
  const before = positionEval;
  if (mode === "versus") {
    const best = before?.best;
    if (!best) {
      setStatus("Still thinking. Try again in a moment.");
      return;
    }
    versusMove(chess.move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] }), before);
    return;
  }
  advance(chess.move(pairs[done].white), before);
});
ui.versus.addEventListener("click", showLevels);
ui.puzzles.addEventListener("click", () => {
  mode = "puzzle";
  ui.levels.hidden = true;
  newGame(true);
});
for (const button of ui.levelButtons) {
  button.addEventListener("click", () => startVersus(Number(button.dataset.level)));
}
ui.back.addEventListener("click", takeBack);
ui.again.addEventListener("click", () => newGame(true));

ui.sound.addEventListener("click", () => {
  soundOn = !soundOn;
  write(SOUND_KEY, soundOn);
  soundButton();
});

ui.reveal.addEventListener("click", (event) => {
  event.preventDefault();
  build(STEPS);
});

/* Scroll hint */

let hinted = false;

function thumb() {
  if (ui.hintBar.hidden) {
    return;
  }
  const doc = document.documentElement;
  const range = doc.scrollHeight - innerHeight;
  const bar = ui.hintBar.clientHeight;
  const height = Math.max(28, (innerHeight / doc.scrollHeight) * bar);
  ui.hintThumb.style.height = `${height}px`;
  ui.hintThumb.style.top = `${range > 0 ? (scrollY / range) * (bar - height) : 0}px`;
}

function hintScrollbar() {
  if (hinted) {
    return;
  }
  hinted = true;
  ui.hintBar.hidden = false;
  thumb();
  ui.hintBar.addEventListener("animationend", () => (ui.hintBar.hidden = true), { once: true });
}

/* Layout */

const wide = matchMedia("(min-width: 721px)");
let offset = 0;

const beside = matchMedia("(min-width: 1280px)");

function fit() {
  const root = document.documentElement.style;
  if (!wide.matches) {
    root.removeProperty("--board");
  } else if (beside.matches) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const spare = innerHeight - ui.top.offsetHeight - 64;
    const room = innerWidth - 5 * rem - 30 * rem - 3 * rem - 3 * rem - 15.5 * rem;
    const size = Math.max(300, Math.min(innerWidth * 0.3, spare, room, 440));
    root.setProperty("--board", `${Math.round(size)}px`);
  } else {
    const spare = innerHeight - ui.top.offsetHeight - ui.side.offsetHeight - 48;
    const size = Math.max(220, Math.min(innerWidth * 0.38, spare, 480));
    root.setProperty("--board", `${Math.round(size)}px`);
  }
  board.redrawAll();
  measure();
}

function measure() {
  ui.game.style.transform = "none";
  const layout = ui.layout.getBoundingClientRect();
  const rect = ui.game.getBoundingClientRect();
  offset = layout.left + layout.width / 2 - (rect.left + rect.width / 2);
  slide();
  thumb();
}

function slide() {
  if (!wide.matches) {
    ui.game.style.transform = "none";
    return;
  }
  const progress = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.6)));
  ui.game.style.transform = `translateX(${offset * (1 - progress)}px)`;
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      slide();
      thumb();
      ticking = false;
    });
  }
});
window.addEventListener("resize", fit);

function soundButton() {
  ui.soundIcon.setAttribute("href", soundOn ? "#i-speaker-high" : "#i-speaker-slash");
  ui.sound.setAttribute("aria-pressed", String(soundOn));
  ui.sound.title = soundOn ? "Sound on" : "Sound off";
}

soundButton();
newGame(false);
fit();
startEngine();
