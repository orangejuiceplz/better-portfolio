# Shiven Kishore, portfolio

A portfolio that starts as a chessboard. The position is the Opera Game (Morphy vs Duke Karl and Count Isouard, Paris 1858) from move 10. Find each of White's moves and the page builds itself one piece at a time, while the evaluation bar beside the board climbs toward 1-0. Stuck? There is a hint, a "show the move" button, and a "reveal all" link in the header.

The board is [chessground](https://github.com/lichess-org/chessground), the board lichess uses. Rules and checkmate detection come from [chess.js](https://github.com/jhlywa/chess.js). The move, capture, check and victory sounds are the "sfx" sound set from lichess. Everything is vendored under `vendor/`, so the site makes no network calls at runtime and has no build step.

## Run it locally

The page uses JavaScript modules, so serve the folder instead of opening the file directly:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

The site is static, so GitHub Pages works as is. In the repository settings, under Pages, choose the branch and the root folder.

## Edit the content

Text lives in `index.html`. Each block carries a `data-step` from 1 to 8 that says which move reveals it:

1. Name and tagline
2. Education
3. NibbleCode
4. FTC robotics
5. TSA, BoroCTF and the scoresheet
6. Awards and service
7. Skills and certifications
8. Contact

The moves, hints and evaluation labels live in the `steps` array at the top of `app.js`. The eval numbers are a progress scale that follows the shape of the game, not engine output. Progress and the sound setting are saved in the browser. The footer has a link to start over.

Colors and fonts are the variables at the top of `styles.css`.

## License

The site's own code is GPL-3.0-or-later (see `LICENSE`). chessground is GPL-3.0-or-later, chess.js is BSD-2-Clause, and the lichess sounds are AGPL-3.0-or-later by Enigmahack. See `vendor/VERSIONS.txt` and the license files next to each component.
