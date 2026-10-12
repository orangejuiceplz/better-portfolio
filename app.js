import { Chessground } from "./vendor/chessground/chessground.min.js";
import { Chess } from "./vendor/chess.js/chess.js";

const PROGRESS = "chess-portfolio-progress";
const SOUND = "chess-portfolio-sound";
const START = "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10";
const MOVE_NUMBER = 10;

const steps = [
  { white: "Nxb5", black: "cxb5", eval: "+0.8", share: 58, hint: "Give up a piece to open the b-file toward the king." },
  { white: "Bxb5+", black: "Nbd7", eval: "+1.6", share: 64, hint: "Take back, with check." },
  { white: "O-O-O", black: "Rd8", eval: "+2.5", share: 70, hint: "Bring the last piece into the game and tuck the king away in one move." },
  { white: "Rxd7", black: "Rxd7", eval: "+3.4", share: 76, hint: "The knight on d7 is pinned. Take it, even with the rook." },
  { white: "Rd1", black: "Qe6", eval: "+4.9", share: 84, hint: "Put the other rook on the open file." },
  { white: "Bxd7+", black: "Nxd7", eval: "M3", share: 92, hint: "Take the rook, with check." },
  { white: "Qb8+", black: "Nxb8", eval: "M1", share: 96, hint: "Pull the defender off the back rank with a queen sacrifice." },
  { white: "Rd8#", black: null, eval: "1-0", share: 100, hint: "The rook delivers mate." },
];

const ui = {
  status: document.getElementById("status"),
  hint: document.getElementById("hint"),
  show: document.getElementById("show"),
  moves: document.getElementById("moves"),
  evalBar: document.querySelector(".eval"),
  evalLabel: document.getElementById("eval-label"),
  sound: document.getElementById("sound"),
  reveal: document.getElementById("reveal"),
  reset: document.getElementById("reset"),
};

const sounds = Object.fromEntries(
  ["Move", "Capture", "Check", "Victory"].map((name) => [name.toLowerCase(), new Audio(`vendor/sounds/${name}.mp3`)]),
);
let soundOn = read(SOUND, true);
let done = Math.min(read(PROGRESS, 0), steps.length);
let hints = 0;
const chess = new Chess(START);

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

function play(name) {
  if (!soundOn) {
    return;
  }
  const sound = sounds[name];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function soundFor(move) {
  if (chess.isCheckmate()) {
    return "victory";
  }
  if (chess.inCheck()) {
    return "check";
  }
  return move.captured ? "capture" : "move";
}

function dests() {
  const map = new Map();
  for (const move of chess.moves({ verbose: true })) {
    map.set(move.from, [...(map.get(move.from) ?? []), move.to]);
  }
  return map;
}

function sync(lastMove) {
  const finished = chess.isGameOver();
  board.set({
    fen: chess.fen(),
    turnColor: chess.turn() === "w" ? "white" : "black",
    check: chess.inCheck(),
    lastMove,
    movable: { color: finished ? undefined : "white", dests: finished ? new Map() : dests() },
  });
}

function renderMoves() {
  const history = chess.history();
  ui.moves.replaceChildren();
  for (let i = 0; i < history.length; i += 2) {
    const item = document.createElement("li");
    item.innerHTML = `<span>${MOVE_NUMBER + i / 2}.</span> ${history[i]} ${history[i + 1] ?? ""}`;
    ui.moves.append(item);
  }
  ui.moves.scrollTop = ui.moves.scrollHeight;
}

function build(count) {
  for (const element of document.querySelectorAll("[data-step]")) {
    element.classList.toggle("built", Number(element.dataset.step) <= count);
  }
  const share = count === 0 ? 50 : steps[count - 1].share;
  ui.evalBar.style.setProperty("--white", `${share}%`);
  ui.evalLabel.textContent = count === 0 ? "0.0" : steps[count - 1].eval;
}

function setStatus(text) {
  ui.status.textContent = text;
}

function finished() {
  const over = done === steps.length;
  ui.hint.hidden = over;
  ui.show.hidden = over;
  return over;
}

function advance(move) {
  const step = steps[done];
  done += 1;
  write(PROGRESS, done);
  hints = 0;
  board.setShapes([]);
  play(soundFor(move));
  sync([move.from, move.to]);
  renderMoves();
  build(done);
  if (finished()) {
    setStatus("Checkmate. 1-0");
    return;
  }
  setTimeout(() => {
    const reply = chess.move(step.black);
    play(soundFor(reply));
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
  if (move.san === steps[done].white || chess.isCheckmate()) {
    advance(move);
    return;
  }
  chess.undo();
  sync();
  setStatus("Not that one.");
}

function restore() {
  for (let i = 0; i < done; i += 1) {
    chess.move(steps[i].white);
    if (steps[i].black) {
      chess.move(steps[i].black);
    }
  }
  const last = chess.history({ verbose: true }).at(-1);
  sync(last ? [last.from, last.to] : undefined);
  renderMoves();
  build(done);
  setStatus(finished() ? "Checkmate. 1-0" : "White to move");
}

ui.hint.addEventListener("click", () => {
  const step = steps[done];
  hints += 1;
  if (hints === 1) {
    setStatus(step.hint);
    return;
  }
  const move = chess.moves({ verbose: true }).find((m) => m.san === step.white);
  board.setShapes([{ orig: move.from, brush: "green" }]);
  setStatus(`${step.hint} The piece is marked.`);
});

ui.show.addEventListener("click", () => {
  const move = chess.move(steps[done].white);
  advance(move);
});

ui.sound.addEventListener("click", () => {
  soundOn = !soundOn;
  write(SOUND, soundOn);
  ui.sound.textContent = soundOn ? "Sound on" : "Sound off";
  ui.sound.setAttribute("aria-pressed", String(soundOn));
});

ui.reveal.addEventListener("click", () => {
  for (const element of document.querySelectorAll("[data-step]")) {
    element.classList.add("built");
  }
});

ui.reset.addEventListener("click", (event) => {
  event.preventDefault();
  done = 0;
  hints = 0;
  write(PROGRESS, 0);
  chess.load(START);
  board.setShapes([]);
  restore();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

ui.sound.textContent = soundOn ? "Sound on" : "Sound off";
ui.sound.setAttribute("aria-pressed", String(soundOn));
restore();
