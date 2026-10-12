# Shiven Kishore, portfolio

A portfolio you play. Each section is locked behind a chess puzzle. Solve it on the board to open the section, or use the reveal link if chess is not your thing.

The board is [chessground](https://github.com/lichess-org/chessground), the board lichess uses. Move legality and checkmate detection come from [chess.js](https://github.com/jhlywa/chess.js). Both are vendored under `vendor/` with their licenses. Everything else is plain HTML, CSS, and one small JavaScript module. No build step, no network calls at runtime.

## Run it locally

The page uses JavaScript modules, so serve the folder instead of opening the file directly:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

The site is static, so GitHub Pages works as is. In the repository settings, under Pages, choose the branch and the root folder.

## Edit the content

Text lives in `index.html`. Sections follow a game of chess:

- Opening: education
- Middlegame: activities, leadership, and a grade-by-grade scoresheet
- Endgame: awards and community service
- Repertoire: skills and certifications
- Checkmate: contact, opened when all four puzzles are solved

Puzzles live at the top of `app.js` as a FEN, the goal text, the winning line in standard notation, and a hint. The game accepts any checkmating move, and for longer puzzles it plays Black's reply from the line. Progress is saved in the browser, and the footer has a link to start over.

Colors and fonts are the variables at the top of `styles.css`.

## Licenses

chessground is GPL-3.0-or-later and chess.js is BSD-2-Clause. See `vendor/VERSIONS.txt` and the LICENSE files next to each library.
