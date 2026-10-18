# Science Quest: Chemistry — Game Spec

_Version 0.4, Oct 18 2026. A living doc to iterate on._

## 1. Goal
A visual, points-based web game that teaches Ajay's kids chemistry, from 7th grade up through AP Chemistry. It grows with them and later adds Physics, Math, and Biology, in the spirit of [SineRider](https://sinerider.com).

- **Players:** 7th grader (BHMS) and 9th grader (RBHS), Poway USD.
- **Curriculum:** California NGSS (MS-PS1, HS-PS1), plus the College Board AP Chemistry course framework (Units 1–9).
- **Runs locally** first (git project). It can deploy to Vercel later with no changes.

## 2. Core game loop
- Short levels of 3–5 minutes, each teaching one idea.
- **Points:** you score for right answers and get a speed bonus, and a combo multiplier builds when you get several in a row.
- **Stars:** 1–3 per level, for accuracy and time.
- **Collectibles:** element cards and molecule cards, each with a fun real-world fact.
- **Streaks and daily challenge:** a 5-question run that mixes in topics already played.
- **Family leaderboard:** a player profile per kid, plus a parent profile, all stored locally.
- **Boss level** at the end of each world: a mixed, timed challenge.
- **Hints** cost points, and a wrong answer gets a short explanation instead of a penalty screen.

## 3. Track A: Foundations (7th to 10th grade)

### World 1: Atoms (7th, MS-PS1-1)
1. **Matter Sort:** sort solid, liquid, and gas, and pure substance vs mixture.
2. **Build an Atom:** drag protons, neutrons, and electrons to build H through Ne. The game shows the mass number and charge.
3. **Element or Compound?:** a tap-to-sort round.

### World 2: Periodic Table Challenge (7th to 8th)
4. **Symbol Match:** the first 20 elements, timed. Later rounds extend to common elements like Fe, Cu, Ag, Au, and I.
5. **Table Puzzle:** drop elements into an empty periodic table.
6. **Families:** metals, nonmetals, metalloids, noble gases, alkali metals, and halogens.
7. **Boss: Element Hunt:** find elements in real-world scenes, like neon signs, calcium in bones, and aluminum cans.

### World 3: Molecules & Formulas (7th to 8th, MS-PS1-1)
8. **Molecule Builder:** snap atoms into H₂O, O₂, CO₂, CH₄, NH₃, and NaCl.
9. **Read the Formula:** count the atoms in C₆H₁₂O₆, Ca(OH)₂, and similar formulas.
10. **Common Compounds:** salt, sugar, baking soda, vinegar, rust, and others, each linked to everyday use.
11. **Boss: Formula Rush.**

### World 4: Reactions (8th, MS-PS1-2, MS-PS1-5)
12. **Signs of a Reaction:** gas, color change, heat, and precipitate.
13. **Conservation of Mass:** atoms in equal atoms out, shown on a scale.
14. **Balance It:** slide coefficients until the scale levels, from easy equations to harder ones.
15. **Boss: Lab Accident**, a mix of reaction puzzles.

### World 5: Electrons & Bonding (9th to 10th, HS-PS1-1, HS-PS1-2)
16. **Valence & Octet:** glowing outer shells and periodic trends in valence electrons.
17. **Ionic Bonds:** transfer electrons, then match ions to form NaCl, MgO, and CaCl₂.
18. **Covalent Bonds:** share electron pairs, including single, double, and triple bonds (H₂, O₂, N₂).
19. **Lewis Dot Builder.**
20. **Molecule Shapes:** linear, bent, trigonal, and tetrahedral, as a short introduction.
21. **Boss: Bond Battle:** classify compounds flying in as ionic, covalent, or metallic.

### World 6: Chemistry in Action (10th, HS-PS1-2 to HS-PS1-7)
22. **Reaction Types:** synthesis, decomposition, single replacement, double replacement, and combustion.
23. **Moles & Molar Mass:** a "chemist's dozen" counting game.
24. **Acids & Bases:** a pH slider game with household items.
25. **Reaction Rates:** temperature, concentration, and surface area, as a race game.
26. **Limiting Reactant:** a sandwich-factory analogy, then real reactions.
27. **Boss: Chemistry Olympics.**

## 4. Track B: AP Chemistry (11th to 12th, separate track)
This track unlocks after Track A World 6, or a parent can unlock it. It follows the 9 units of the AP Chemistry course framework and has harder scoring with calculation puzzles. Its levels are tagged with the AP skill practices (models, representations, calculations, and argumentation).

| AP World | Unit | Example levels |
|---|---|---|
| AP1 | Atomic Structure & Properties | Mass spectra decoder, electron configuration builder, photoelectron spectroscopy (PES) peak reading, periodic trends ranking |
| AP2 | Compound Structure & Properties | Lewis structures with formal charge, VSEPR 3D shapes, hybridization, resonance |
| AP3 | Intermolecular Forces & Properties | Ranking IMF strength, ideal gas law puzzles, solutions and Beer–Lambert, chromatography |
| AP4 | Chemical Reactions | Net ionic equations, stoichiometry chains, titration, redox |
| AP5 | Kinetics | Rate law from data, reaction mechanisms, energy profiles, catalysts |
| AP6 | Thermodynamics | Calorimetry lab, Hess's law puzzle, bond enthalpies |
| AP7 | Equilibrium | ICE-table solver, Le Châtelier "push the system" game, K vs Q, Ksp |
| AP8 | Acids & Bases | pH and pOH, buffers, titration curve builder, pKa |
| AP9 | Applications of Thermodynamics | Entropy, Gibbs free energy, galvanic and electrolytic cells, the Nernst equation in qualitative form |

- **AP Exam Mode:** timed multiple-choice sets plus free-response-style multi-step problems, scored the way the AP rubrics are.

## 5. Subjects
After a profile is chosen, a subject picker comes before that subject's hub. **Chemistry** is playable. **Physics**, **Math**, and **Biology** show as coming-soon tiles until their levels exist. The hub has a way back to the picker.

Each subject is a module: its own worlds and levels folder, registered in one list (`src/subjects/`). The hub and the play engine only read that module. Adding a subject, or filling in Physics or Math later, does not require hub or engine changes.

Progress is stored per profile and per subject. A save from before the picker (one progress blob per profile) is chemistry progress. The store migrates it in place, with no loss of points, stars, or cards.

### Later subject ideas
- **Physics:** graph-to-launch motion puzzles like SineRider, plus forces, energy, waves, and circuits.
- **Math:** patterns, number puzzles, and the quantities the science levels already use.
- **Biology:** cell builder, DNA and protein puzzles, and ecosystems and food webs.

## 6. Tech
- **Stack:** Vite + TypeScript, an HTML canvas for drag-and-snap (PixiJS if needed), and CSS for the UI.
- **Content as data:** each level is a JSON or TS file, and the periodic table data comes from a public dataset, so new levels don't need engine changes.
- **Storage:** see section 6a.
- **Runs** with `npm run dev`, and `npm run build` makes a static site ready for Vercel.
- **Repo:** a git project in `/Users/ajay/Documents/Dev_Cloud/workspace/science-quest`. GitHub and Vercel come later.

## 6a. Saving progress
- **Phase 1 (M1–M3), local profiles:** a profile picker with an avatar and name for each kid and one for the parent. Progress (points, stars, cards, streaks) is saved in the browser's localStorage, separately for each subject. This works the same when it's hosted on Vercel, but progress stays on that one device and browser.
- **Parent profile:** every level, world, and boss is unlocked. Kid profiles still open the next level only after the previous one is completed.
- **Backups:** Export and Import buttons save and load progress as a JSON file, because clearing browser data wipes it.
- **Storage layer:** all reads and writes go through one `ProgressStore` interface (`LocalProgressStore` now), so the game code never calls localStorage directly.
- **Phase 2 (when deployed), Google sign-in:** Auth.js with a Google provider on Vercel, plus a free database (Vercel Postgres, Neon, or Supabase) behind a `CloudProgressStore`. On first sign-in, the local progress is imported into that account. Use personal or family Google accounts; Poway USD school accounts may block outside apps. One-time setup: a Google Cloud OAuth client.
- **Privacy:** store only a display name, the account email, and game progress. No ads and no tracking.

## 7. Milestones
1. **M1, first playable:** Worlds 1–3, profiles, points, and the leaderboard.
2. **M2:** Worlds 4–5 with the bonding mechanics.
3. **M3:** World 6, the daily challenge, and polish (sound, animation).
4. **M4:** the AP Chemistry track, starting with AP1, AP2, and AP7.
5. **M5:** Google sign-in and cloud save, deployed on Vercel.
6. **M6:** Physics World 1.

## 8. Open questions
- What units are the kids actually covering this semester? We could reorder the levels to match.
- Art style: **Decided (Oct 18, 2026).** Sleek neon, in the spirit of SineRider. Dark background, glowing neon lines and accents, smooth glow feedback, and clean modern type. High contrast and clear labels so a 7th grader can read everything easily.
- Subject picker: **Decided (Oct 18, 2026).** A picker sits between the profile screen and a subject's hub. Chemistry is playable. Physics, Math, and Biology are coming-soon tiles. Each subject is a registered module with its own worlds and levels. Progress is per subject, and older chemistry-only saves migrate without loss.
- Parent unlock: **Decided (Oct 18, 2026).** The parent profile can play every level, world, and boss. Kids keep the normal one-after-another unlock.
- Should there be sound and music?
- Should the parent profile be able to set difficulty? Unlocking tracks is already decided: the parent can play everything, and kids follow the normal path.
