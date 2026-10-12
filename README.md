# Shiven Kishore, portfolio

A portfolio that starts as a chessboard. Every load picks one of five famous miniatures at random (the Opera Game, the Immortal Game, the Evergreen Game, Lasker vs Thomas, Réti vs Tartakower) and drops you in at the decisive moment. Find each of White's moves and the page builds itself beside the board, one piece at a time, while the evaluation bar climbs toward 1-0. A wrong move stays on the board, marked, until you take it back, the way lichess puzzles work. Stuck? There is a hint, a "show the move" button, and a "reveal all" link in the header. "New game" deals another game.

The board starts centered. After the first move the page scrolls to the first block and the board slides to the right, where it stays pinned while the portfolio scrolls on the left. Scroll back to the top and the board returns to the center. Each correct move scrolls the page to the block it just revealed. The evaluation bar sits beside the board. The browser scrollbar is hidden; a thin gold scrollbar blinks for a couple of seconds the first time the page becomes scrollable and then stays out of the way. The board is sized from the window height and width at load and on resize, so browser zoom keeps everything on screen; below 720 CSS pixels of width the page becomes a single column with the board on top.

The board is [chessground](https://github.com/lichess-org/chessground), the board lichess uses. Rules and checkmate detection come from [chess.js](https://github.com/jhlywa/chess.js). Icons are [Phosphor](https://phosphoricons.com), inlined as an SVG sprite. Headings are set in Fraunces and notation in IBM Plex Mono, both self-hosted from `fonts/` under the Open Font License. Sounds are chess.com's default set (game start, move, capture, castle, check, promote, game end, illegal, notify), loaded from chess.com's CDN at runtime. If those cannot load, the move, capture, check and game end sounds fall back to the AGPL "sfx" set from lichess, vendored under `vendor/sounds`.

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

The games live in the `games` array at the top of `app.js`: a credit line, the move number the puzzle starts at, the FEN, White's line with Black's replies, and one hint per White move. Every line was checked with chess.js to be legal and to end in checkmate. The eval numbers are a progress scale that follows the shape of the game, not engine output. The sound setting is saved in the browser; progress is not, so each visit is a fresh game.

Colors and fonts are the variables at the top of `styles.css`. Credits for the games, libraries, icons and sounds are on the `credits/` page.

## License

The site's own code is GPL-3.0-or-later (see `LICENSE`). chessground is GPL-3.0-or-later, chess.js is BSD-2-Clause, Phosphor Icons are MIT, the Fraunces and IBM Plex Mono fonts are under the SIL Open Font License, and the fallback sounds are AGPL-3.0-or-later by Enigmahack. See `vendor/VERSIONS.txt` and the license files next to each component. The chess.com sounds are not included in this repository; they are played from chess.com's own servers.
