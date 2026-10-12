# Shiven Kishore, portfolio

A portfolio that starts as a chessboard. Every load picks one of five famous miniatures at random (the Opera Game, the Immortal Game, the Evergreen Game, Lasker vs Thomas, Réti vs Tartakower) and drops you in at the decisive moment. Find each of White's moves and the page builds itself beside the board, one piece at a time, while the evaluation bar climbs toward 1-0. A wrong move stays on the board, marked, until you take it back, the way lichess puzzles work. Stuck? There is a hint, a "play best move" button, and a "reveal all" link in the header. "New game" deals another game.

The board starts centered. After the first move the page scrolls to the first block and the board slides to the right, where it stays pinned while the portfolio scrolls on the left. Scroll back to the top and the board returns to the center. Each correct move scrolls the page to the block it just revealed. The evaluation bar sits beside the board. The browser scrollbar is hidden; a thin gold scrollbar blinks for a couple of seconds the first time the page becomes scrollable and then stays out of the way. The board is sized from the window height and width at load and on resize, so browser zoom keeps everything on screen; below 720 CSS pixels of width the page becomes a single column with the board on top.

The board is [chessground](https://github.com/lichess-org/chessground), the board lichess uses. Rules and checkmate detection come from [chess.js](https://github.com/jhlywa/chess.js). [Stockfish 19](https://github.com/nmrugg/stockfish.js) runs in the browser as WebAssembly (the 1.8 MB lite single-threaded build, so no special headers are needed) and drives the evaluation bar and the move review: every move you play, right or wrong, gets a chess.com style verdict from Brilliant to Blunder, shown with Chess.com's own classification icons as a badge on the square and in the move review list beside the board. Black's replies are reviewed too. Icons are [Phosphor](https://phosphoricons.com), inlined as an SVG sprite. Sounds are chess.com's default set (game start, move, capture, castle, check, promote, game end, illegal, notify), loaded from chess.com's CDN at runtime. If those cannot load, the move, capture, check and game end sounds fall back to the AGPL "sfx" set from lichess, vendored under `vendor/sounds`.

## Hard mode: play Stockfish

Under the move list, "Play Stockfish instead" starts a game from the opening position with you as White. Pick a level from 100 to 3000. The lower levels mix random moves with a shallow, handicapped search; 1600 and 2000 use Stockfish's skill level setting; 3000 is the engine at full strength with one second a move. The portfolio unlocks as your winning chances grow: each tenth of win probability above even opens the next block, and checkmate opens everything. Hint marks the engine's suggestion, Play best move plays it, Take back undoes your last move and the reply. The levels are approximate, not calibrated ratings.

## Run it locally

The page uses JavaScript modules, so serve the folder instead of opening the file directly:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

The site is static, so GitHub Pages works as is. In the repository settings, under Pages, choose the branch and the root folder.

## Edit the content

Text lives in `index.html`. Each block carries a `data-step` from 1 to 8 that says when it appears. Games with fewer than eight moves reveal more than one block per move.

1. Name and tagline
2. Education
3. NibbleCode
4. FTC robotics
5. TSA, BoroCTF and the scoresheet
6. Awards and service
7. Skills and certifications
8. Contact, as the page footer

The games live in the `games` array at the top of `app.js`: a credit line, the move number the puzzle starts at, the FEN, White's line with Black's replies, and one hint per White move. Every line was checked with chess.js to be legal and to end in checkmate. The eval bar shows Stockfish's score for the current position, streamed as it searches for 900 milliseconds a move; if the engine cannot load, a fixed progress scale takes over. Move verdicts compare the win chance after your move with the engine's best line: Best, Great (the only good move), Brilliant (a sound sacrifice), Excellent, Good, Inaccuracy, Mistake, Blunder. The thresholds are a reproduction of chess.com's idea, not their exact formula. The sound setting is saved in the browser; progress is not, so each visit is a fresh game.

The palette is built from the lichess blue board: dark slate background, slate surfaces and a steel blue accent, with chess.com style buttons, set in Trebuchet MS. Colors are the variables at the top of `styles.css`; swap `--blue` and the two button edge colors to change the accent. Credits for the games, libraries, icons and sounds are on the `credits/` page.

## License

The site's own code is GPL-3.0-or-later (see `LICENSE`). chessground is GPL-3.0-or-later, chess.js is BSD-2-Clause, Phosphor Icons are MIT, and the fallback sounds are AGPL-3.0-or-later by Enigmahack. See `vendor/VERSIONS.txt` and the license files next to each component. The chess.com sounds are not included in this repository; they are played from chess.com's own servers.
