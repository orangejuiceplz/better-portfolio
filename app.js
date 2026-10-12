import { Chessground } from "./vendor/chessground/chessground.min.js";
import { Chess } from "./vendor/chess.js/chess.js";

const SOUND_KEY = "chess-portfolio-sound";
const STEPS = 8;
const EVALS = ["0.0", "+0.8", "+1.6", "+2.5", "+3.4", "+4.9", "M3", "M1", "1-0"];
const SHARES = [50, 58, 64, 70, 76, 84, 92, 96, 100];
const CHESSCOM = "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/";
const FALLBACK = { "move-self": "Move", "move-opponent": "Move", capture: "Capture", castle: "Move", promote: "Move", "move-check": "Check", "game-end": "Victory" };

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
  moves: document.getElementById("moves"),
  credit: document.getElementById("credit"),
  evalBar: document.getElementById("eval"),
  evalThumb: document.querySelector(".eval-thumb"),
  evalLabel: document.getElementById("eval-label"),
  sound: document.getElementById("sound"),
  soundIcon: document.getElementById("sound-icon"),
  reveal: document.getElementById("reveal"),
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
const chess = new Chess();

const board = Chessground(document.getElementById("board"), {
  coordinates: true,
  premovable: { enabled: false },
  drawable: { enabled: false },
  movable: { free: false, showDests: true, events: { after: onMove } },
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

function sync(lastMove) {
  const locked = wrong || chess.isGameOver();
  board.set({
    fen: chess.fen(),
    turnColor: chess.turn() === "w" ? "white" : "black",
    check: chess.inCheck(),
    lastMove,
    movable: { color: locked ? undefined : "white", dests: locked ? new Map() : dests() },
  });
}

function renderMoves() {
  const history = chess.history();
  ui.moves.replaceChildren();
  for (let i = 0; i < history.length; i += 2) {
    const item = document.createElement("li");
    item.innerHTML = `<span>${game.from + i / 2}.</span> ${history[i]} ${history[i + 1] ?? ""}`;
    ui.moves.append(item);
  }
  ui.moves.scrollTop = ui.moves.scrollHeight;
}

function setEval(level) {
  ui.evalBar.style.setProperty("--white", `${SHARES[level]}%`);
  ui.evalLabel.textContent = EVALS[level];
}

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
    thumb();
  }, 350);
}

function setStatus(text) {
  ui.status.textContent = text;
}

function updateControls() {
  const over = done === pairs.length;
  ui.hint.hidden = over || wrong;
  ui.show.hidden = over || wrong;
  ui.back.hidden = !wrong;
}

function advance(move) {
  const step = pairs[done];
  done += 1;
  hints = 0;
  board.setShapes([]);
  soundFor(move, true);
  sync([move.from, move.to]);
  renderMoves();
  const level = Math.round((done / pairs.length) * STEPS);
  setEval(level);
  build(level);
  updateControls();
  if (done === pairs.length) {
    setStatus("Checkmate. 1-0");
    return;
  }
  setTimeout(() => {
    const reply = chess.move(step.black);
    soundFor(reply, false);
    sync([reply.from, reply.to]);
    renderMoves();
    setStatus("White to move");
  }, 450);
}

function onMove(from, to) {
  const move = chess.move({ from, to, promotion: "q" });
  if (!move) {
    sync();
    return;
  }
  if (move.san === pairs[done].white || chess.isCheckmate()) {
    advance(move);
    return;
  }
  wrong = true;
  play("illegal");
  sync([from, to]);
  board.setShapes([{ orig: to, brush: "red" }]);
  setStatus("Not the move.");
  updateControls();
}

function takeBack() {
  chess.undo();
  wrong = false;
  board.setShapes([]);
  const last = chess.history({ verbose: true }).at(-1);
  sync(last ? [last.from, last.to] : undefined);
  setStatus("White to move");
  updateControls();
}

function newGame(fromClick) {
  game = games[Math.floor(Math.random() * games.length)];
  const moves = game.line.split(" ");
  pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ white: moves[i], black: moves[i + 1] ?? null });
  }
  chess.load(game.fen);
  done = 0;
  hints = 0;
  wrong = false;
  board.setShapes([]);
  sync();
  renderMoves();
  setEval(0);
  ui.credit.textContent = `${game.credit}, from move ${game.from}.`;
  setStatus("White to move");
  updateControls();
  if (fromClick) {
    play("game-start");
  }
}

ui.hint.addEventListener("click", () => {
  const step = pairs[done];
  hints += 1;
  if (hints === 1) {
    setStatus(game.hints[done]);
    return;
  }
  const move = chess.moves({ verbose: true }).find((m) => m.san === step.white);
  board.setShapes([{ orig: move.from, brush: "green" }]);
  setStatus(`${game.hints[done]} The piece is marked.`);
});

ui.show.addEventListener("click", () => advance(chess.move(pairs[done].white)));
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

function thumb() {
  const doc = document.documentElement;
  const range = doc.scrollHeight - innerHeight;
  const bar = ui.evalBar.clientHeight;
  if (range <= 0) {
    ui.evalThumb.hidden = true;
    return;
  }
  ui.evalThumb.hidden = false;
  const height = Math.max(28, (innerHeight / doc.scrollHeight) * bar);
  const top = (scrollY / range) * (bar - height);
  ui.evalThumb.style.height = `${height}px`;
  ui.evalThumb.style.top = `${top}px`;
}

function scrollFromPointer(event) {
  const rect = ui.evalBar.getBoundingClientRect();
  const doc = document.documentElement;
  const fraction = (event.clientY - rect.top) / rect.height;
  scrollTo({ top: fraction * (doc.scrollHeight - innerHeight), behavior: "auto" });
}

let dragging = false;
ui.evalBar.addEventListener("pointerdown", (event) => {
  dragging = true;
  ui.evalBar.setPointerCapture(event.pointerId);
  scrollFromPointer(event);
});
ui.evalBar.addEventListener("pointermove", (event) => dragging && scrollFromPointer(event));
ui.evalBar.addEventListener("pointerup", () => (dragging = false));
ui.evalBar.addEventListener("pointercancel", () => (dragging = false));

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      thumb();
      ticking = false;
    });
  }
});
window.addEventListener("resize", thumb);

function soundButton() {
  ui.soundIcon.setAttribute("href", soundOn ? "#i-speaker-high" : "#i-speaker-slash");
  ui.sound.setAttribute("aria-pressed", String(soundOn));
  ui.sound.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off");
}

soundButton();
newGame(false);
thumb();
