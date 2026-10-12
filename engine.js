const MULTIPV = 2;

export class Engine {
  constructor(url) {
    this.worker = new Worker(url);
    this.job = null;
    this.queue = Promise.resolve();
    this.ready = new Promise((resolve) => {
      this.onReady = resolve;
    });
    this.worker.onmessage = (event) => this.read(String(event.data));
    this.send("uci");
  }

  send(command) {
    this.worker.postMessage(command);
  }

  read(line) {
    if (line === "uciok") {
      this.send(`setoption name MultiPV value ${MULTIPV}`);
      this.send("isready");
      return;
    }
    if (line === "readyok") {
      this.onReady();
      return;
    }
    const job = this.job;
    if (!job) {
      return;
    }
    if (line.startsWith("bestmove")) {
      job.best = line.split(" ")[1];
      this.job = null;
      job.resolve(result(job));
      return;
    }
    if (line.startsWith("info") && line.includes(" pv ")) {
      const info = parseInfo(line, job.white);
      if (info) {
        job.lines[info.rank - 1] = info;
        job.onInfo?.(result(job));
      }
    }
  }

  analyse(fen, movetime, onInfo) {
    const run = () =>
      new Promise((resolve) => {
        this.job = { fen, white: fen.split(" ")[1] === "w", lines: [], best: null, resolve, onInfo };
        this.send(`position fen ${fen}`);
        this.send(`go movetime ${movetime}`);
      });
    const previous = this.queue;
    if (this.job) {
      this.send("stop");
    }
    this.queue = previous.then(run, run);
    return this.queue;
  }
}

function result(job) {
  return { fen: job.fen, lines: job.lines.filter(Boolean), best: job.best ?? job.lines[0]?.pv[0] ?? null };
}

function parseInfo(line, white) {
  const parts = line.split(" ");
  const at = (key) => parts.indexOf(key);
  const pvAt = at("pv");
  const scoreAt = at("score");
  if (pvAt === -1 || scoreAt === -1) {
    return null;
  }
  const rank = at("multipv") === -1 ? 1 : Number(parts[at("multipv") + 1]);
  const kind = parts[scoreAt + 1];
  let value = Number(parts[scoreAt + 2]);
  if (!white) {
    value = -value;
  }
  return {
    rank,
    depth: Number(parts[at("depth") + 1]),
    cp: kind === "cp" ? value : null,
    mate: kind === "mate" ? value : null,
    pv: parts.slice(pvAt + 1),
  };
}

export function winChance(score) {
  if (score.mate !== null) {
    return score.mate > 0 ? 1 : -1;
  }
  return 2 / (1 + Math.exp(-0.00368208 * score.cp)) - 1;
}

export function formatScore(score) {
  if (score.mate !== null) {
    return score.mate === 0 ? "#" : `M${Math.abs(score.mate)}`;
  }
  const pawns = score.cp / 100;
  return `${pawns > 0 ? "+" : ""}${pawns.toFixed(1)}`;
}
