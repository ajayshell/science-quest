# Science Quest

A visual, points-based chemistry game for a 7th grader and a 9th grader. Milestone M1 is Worlds 1–3: atoms, the periodic table, and molecules. The look is sleek neon, in the spirit of [SineRider](https://sinerider.com).

It runs entirely in the browser after install. There is no account, no analytics, and no network call while you play. Progress stays on this device until you export it.

## Run it

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43123

```bash
npm test
npm run build
```

`npm run build` typechecks and writes a static site to `dist/`. That folder is what Vercel can host later. Do not deploy from this repo until you mean to.

## How to play

1. Pick a profile. There are two kids and one parent. Change the name and the neon avatar.
2. Clear levels in order. Each one takes a few minutes.
3. Right answers score 100 points plus a speed bonus of up to 50. A streak multiplies the total by 0.25 per correct answer in a row, up to ×3.
4. Finish a level for 1–3 stars. Three stars means every answer was right on the first try, you used no hints, and you beat the star time.
5. Hints cost 30 points. A wrong answer shows a short explanation instead of a penalty screen.
6. Element and molecule cards unlock as you clear the levels that teach them.
7. The family leaderboard ranks the three profiles by points on this device.
8. Export progress to a JSON file from the profile screen, and import it later if the browser data is cleared.

## Project structure

```
SPEC.md                 game spec
src/main.ts             boot, screen router
src/styles.css          neon UI
src/scoring.ts          points, combo, stars
src/formula.ts          atom counting
src/data/elements.json  vendored periodic table (no runtime fetch)
src/data/cards.ts       collectible cards
src/data/levels/        one file per level
src/store/              ProgressStore and LocalProgressStore
src/play/               canvas drag-and-snap and tap rounds
src/ui/                 profile, hub, album, leaderboard
```

Game screens never call `localStorage`. They talk to a `ProgressStore`. `LocalProgressStore` is the only implementation, and it is the only code that touches `localStorage`.

## Add a level

1. Add `src/data/levels/level12.ts` and export a `LevelDef`.
2. Reuse a `kind` that already exists: `sort`, `atom`, `choice`, `table`, `hunt`, `molecule`, `formula`, or `rush`.
3. Register it in `src/data/levels/index.ts`, in play order. The previous level must be cleared before this one unlocks.
4. If the level should unlock cards, add those ids to `cardIds` and define any new cards in `src/data/cards.ts`. Element facts live in `src/data/elements.json`.
5. Run `npm test`. The content test checks that every choice, formula count, hunt target, and card id lines up.

Formula questions should store an ASCII formula such as `Ca(OH)2`. The shared parser counts the atoms, so the answer is not a second copy of the number.

## Data

`src/data/elements.json` holds atomic number, symbol, name, group, period, standard atomic weight, a common isotope mass number, and a short fact. The identity fields are scientific facts compiled from IUPAC periodic-table data so the game can run offline. The facts themselves were written for this game.
