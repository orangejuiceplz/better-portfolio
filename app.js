import { Chessground } from "./vendor/chessground/chessground.min.js";
import { Chess } from "./vendor/chess.js/chess.js";

const STORAGE = "chess-portfolio";

const puzzles = [
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    goal: "White to move. Mate in 1.",
    line: ["Qxf7#"],
    hint: "The queen and bishop both look at the same weak square.",
  },
  {
    fen: "rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6",
    goal: "White to move. Mate in 2. Black just took the queen.",
    line: ["Bxf7+", "Ke7", "Nd5#"],
    hint: "Give a check that drags the king forward, then bring a knight in.",
  },
  {
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    goal: "White to move. Mate in 1.",
    line: ["Ra8#"],
    hint: "The king has no air behind its pawns.",
  },
  {
    fen: "3n3k/6p1/5N2/8/8/8/6K1/R7 w - - 0 1",
    goal: "White to move. Mate in 1.",
    line: ["Rh1#"],
    hint: "The knight already covers the escape squares. Bring the rook.",
  },
];

const sections = [...document.querySelectorAll("[data-puzzle]")];
const finale = document.querySelector("[data-finale]");
const panel = {
  title: document.getElementById("puzzle-title"),
  goal: document.getElementById("puzzle-goal"),
  unlocks: document.getElementById("puzzle-unlocks"),
  status: document.getElementById("puzzle-status"),
  hint: document.getElementById("hint"),
  skip: document.getElementById("skip"),
  next: document.getElementById("next"),
  dots: [...document.querySelectorAll("#progress li")],
};

const solved = new Set(load());
let current = firstUnsolved();
let chess = new Chess();
let ply = 0;
let hints = 0;

const board = Chessground(document.getElementById("board"), {
  coordinates: true,
  premovable: { enabled: false },
  drawable: { enabled: false },
  movable: { free: false, showDests: true, events: { after: onMove } },
});

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE)) ?? [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify([...solved]));
  } catch {}
}

function firstUnsolved() {
  const index = puzzles.findIndex((_, i) => !solved.has(i));
  return index === -1 ? 0 : index;
}

function dests() {
  const map = new Map();
  for (const move of chess.moves({ verbose: true })) {
    const list = map.get(move.from) ?? [];
    list.push(move.to);
    map.set(move.from, list);
  }
  return map;
}

function sync(lastMove) {
  board.set({
    fen: chess.fen(),
    turnColor: chess.turn() === "w" ? "white" : "black",
    check: chess.inCheck(),
    lastMove,
    movable: { color: chess.turn() === "w" ? "white" : "black", dests: dests() },
  });
}

function start(index) {
  current = index;
  chess = new Chess(puzzles[index].fen);
  ply = 0;
  hints = 0;
  board.setShapes([]);
  sync();
  const puzzle = puzzles[index];
  const done = solved.has(index);
  panel.title.textContent = `Puzzle ${index + 1} of ${puzzles.length}`;
  panel.goal.textContent = puzzle.goal;
  panel.unlocks.textContent = done ? `Already solved. ${sections[index].dataset.name} is open.` : `Unlocks: ${sections[index].dataset.name}`;
  panel.status.textContent = "";
  panel.hint.hidden = done;
  panel.skip.hidden = done;
  panel.next.hidden = !done || index === puzzles.length - 1;
  panel.dots.forEach((dot, i) => {
    dot.classList.toggle("done", solved.has(i));
    dot.classList.toggle("active", i === index);
  });
}

function onMove(from, to) {
  const played = chess.move({ from, to, promotion: "q" });
  if (!played) {
    sync();
    return;
  }
  const expected = puzzles[current].line[ply];
  if (chess.isCheckmate()) {
    sync([from, to]);
    finish();
    return;
  }
  if (played.san !== expected) {
    chess.undo();
    sync();
    panel.status.textContent = "Not that one. Try again.";
    return;
  }
  ply += 1;
  sync([from, to]);
  const reply = chess.move(puzzles[current].line[ply]);
  ply += 1;
  setTimeout(() => {
    sync([reply.from, reply.to]);
    panel.status.textContent = `Black plays ${reply.san}. Keep going.`;
  }, 350);
}

function finish() {
  unlock(current);
  panel.status.textContent = "Checkmate. Section unlocked.";
  panel.hint.hidden = true;
  panel.skip.hidden = true;
  panel.next.hidden = current === puzzles.length - 1;
  panel.unlocks.textContent = `${sections[current].dataset.name} is open below.`;
}

function unlock(index) {
  solved.add(index);
  save();
  sections[index].classList.remove("locked");
  panel.dots[index].classList.add("done");
  if (solved.size === puzzles.length) {
    finale.classList.remove("locked");
  }
}

function showHint() {
  const san = puzzles[current].line[ply];
  const move = chess.moves({ verbose: true }).find((m) => m.san === san);
  hints += 1;
  if (hints === 1) {
    panel.status.textContent = puzzles[current].hint;
  } else {
    board.setShapes([{ orig: move.from, brush: "green" }]);
    panel.status.textContent = "The piece to move is marked.";
  }
}

panel.hint.addEventListener("click", showHint);
panel.skip.addEventListener("click", () => {
  unlock(current);
  start(current);
  panel.status.textContent = "Revealed without solving.";
});
panel.next.addEventListener("click", () => start(Math.min(current + 1, puzzles.length - 1)));

for (const section of sections) {
  section.querySelector(".play").addEventListener("click", (event) => {
    event.preventDefault();
    start(sections.indexOf(section));
    document.getElementById("game").scrollIntoView({ behavior: "smooth" });
  });
  section.querySelector(".reveal").addEventListener("click", (event) => {
    event.preventDefault();
    unlock(sections.indexOf(section));
    if (sections.indexOf(section) === current) {
      start(current);
    }
  });
}

finale.querySelector(".reveal").addEventListener("click", (event) => {
  event.preventDefault();
  finale.classList.remove("locked");
});

document.getElementById("reset").addEventListener("click", (event) => {
  event.preventDefault();
  solved.clear();
  save();
  for (const section of sections) {
    section.classList.add("locked");
  }
  finale.classList.add("locked");
  start(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

for (const index of solved) {
  sections[index]?.classList.remove("locked");
}
if (solved.size === puzzles.length) {
  finale.classList.remove("locked");
}
start(current);

const links = document.querySelectorAll(".top nav a");
const watcher = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        for (const link of links) {
          link.toggleAttribute("aria-current", link.hash === `#${entry.target.id}`);
        }
      }
    }
  },
  { rootMargin: "-40% 0px -55% 0px" },
);
for (const link of links) {
  watcher.observe(document.querySelector(link.hash));
}
