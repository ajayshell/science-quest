# Chemistry content and gameplay review

Reviewed Worlds 1–3 (levels 1–11), the album cards, and the vendored periodic table. Element identity was checked against IUPAC CIAAW standard atomic weights (2024) and NIST most-abundant isotopes. Concepts and classifications were checked against OpenStax Chemistry 2e and the grade band of CA NGSS MS-PS1 / HS-PS1. Compound formulas were checked against PubChem.

Every graded item, table blank, element, and card now has a `source`. `note` is optional and holds a caveat the student sentence does not need to carry. The rule is in the README section “Add a level” and in SPEC.md section 6. `npm test` rejects a missing source, more than one correct choice, a repeated id inside a level, a formula whose slots do not match the atom count, and an equation that does not balance.

## Identity data

Symbols, atomic numbers, groups, periods, categories, room-temperature states, and most-abundant mass numbers already matched the reference. They were not changed. Nickel’s mass number stays 58 (Ni-58 is the most abundant isotope even though the standard weight is 58.6934). Gallium stays a solid at 25 °C (it melts at 29.7646 °C). Hydrogen stays a nonmetal, not an alkali metal. Aluminum stays a post-transition metal, not a metalloid.

One stored weight moved:

| Element | Before | After | Why |
| --- | --- | --- | --- |
| Oxygen | 15.999 | 15.9994 | 15.999 sits just under the CIAAW interval [15.99903, 15.99977]. 15.9994 is inside it. Many textbooks still round to 15.999. |

## Content corrections

Student-facing text, before → after. Sources are the citations now stored on the item.

### States, elements, and mixtures

- Level 1 steam card. “Steam / Above a kettle” and “Steam is gaseous water.” → “Water vapor / Gas from boiling water.” The white cloud above a kettle is liquid droplets; water vapor is invisible. Source: OpenStax Chemistry 2e §1.2.
- Level 1, 3, 4, and 7 helium lines. “Lighter than air” / “a balloon full of it floats.” → Helium gas is less dense than air, so a balloon of it rises. A balloon rises only when the balloon plus the gas is less dense than the surrounding air. Source: OpenStax Chemistry 2e §1.2.
- Level 3 gold. “A gold ring is pure Au.” → “A sample of pure gold is Au.” Jewelry is often an alloy. Source: IUPAC element identity; OpenStax on elements vs compounds.
- Level 3 iron. “An iron nail is the metal Fe.” → “The metal iron has the symbol Fe.” The wrong-answer text now says a steel nail is mostly iron, and rust needs oxygen and water. Source: OpenStax Chemistry 2e.
- Level 6 nonmetal bin. “Dull or gaseous” → “Poor conductors.” Bromine is a liquid and iodine is a solid, so “gaseous” was a false class rule. Source: OpenStax Chemistry 2e §2.5.
- Level 6 sulfur. “It sits next to the metalloids.” → “Sulfur is a nonmetal in group 16. Silicon, two columns to its left, is the metalloid.” Phosphorus sits between S and Si. Source: IUPAC group numbers.
- Level 6 boron. “It sits beside aluminum.” → Aluminum sits under boron in the same column and is a metal. Source: IUPAC group 13.
- Level 6 iron hint. “A shiny conductor you can bend into nails.” → “Iron is a metal. Nails and steel are made mostly from it.”

### Formulas and real materials

- Level 7 aluminum. “Aluminum cans are the element Al.” → “Drink cans are made mostly of aluminum metal.” Note: can stock is an alloy, commonly with manganese and magnesium. Source: OpenStax; PubChem Al.
- Level 7 calcium. “Bones store calcium.” → Bones store calcium inside a compound, not as calcium metal. Note: bone mineral is mostly hydroxyapatite. Source: OpenStax Chemistry 2e.
- Level 7 iron. “Hemoglobin uses iron to carry oxygen.” → Hemoglobin uses iron ions, not a chunk of metal. Note: heme iron switches between Fe²⁺ and Fe³⁺. Source: OpenStax Chemistry 2e.
- Level 7 sodium. “The sodium is bonded to chlorine.” → The sodium in table salt is Na⁺ paired with Cl⁻, not sodium metal. Source: OpenStax Chemistry 2e §2.6.
- Level 7 gold. “Gold jewelry stays bright for centuries.” → “Gold hardly reacts with air or water, so the metal stays bright.” Note: many rings are gold alloys. Source: OpenStax element description.
- Level 8 oxygen. “The double line is a double bond.” → It is the grade-level picture of a double bond. Note: that Lewis structure does not explain why O₂ is paramagnetic. Source: OpenStax Chemistry 2e Lewis structures.
- Level 8 methane. The flat drawing is now described as a drawing. The molecule is tetrahedral. Source: OpenStax Chemistry 2e §2.6.
- Level 8 ammonia. “Plant fertilizers” as if plants take up NH₃. → The molecule is a pyramid, not flat. Plants take up ammonium or nitrate. Source: OpenStax Chemistry 2e; PubChem NH₃.
- Level 10 rust. “Iron oxide, the red-brown stuff we call rust.” → Fe₂O₃ is iron(III) oxide, the main iron compound in red-brown rust, and real rust also holds water. Note: often written Fe₂O₃·nH₂O. Source: PubChem iron(III) oxide; OpenStax.
- Level 10 sand. “Most beach sand and quartz are this compound.” → “Quartz, and the sand on many beaches, is this compound.” Tropical shell sand is calcium carbonate. Glass is silica melted with other ingredients, not sand alone. Source: PubChem SiO₂ and CaCO₃.
- Level 11 water. The OH₂ distractor only said H₂O₂ is peroxide. → OH₂ lists the same atoms in the wrong order; H₂O₂ is hydrogen peroxide. The accepted answer remains H₂O. Source: PubChem water; OpenStax formula conventions.
- Level 11 how-to. “No hints required — but they still cost points.” → “A hint still costs points.”
- Level 5 how-to. Period 4 shows potassium and calcium only. The transition metals are left out so the grid fits a phone. Source: IUPAC periods and groups.
- Level 4 iodine. “The halogen in iodized salt.” → Iodized salt contains an iodine compound, usually potassium iodide, not crystals of the element. Source: OpenStax; PubChem KI.

### Cards and element facts

- Water card. “The bent shape of H₂O is why ice floats and why water dissolves so many things.” → The bend makes water polar, which explains dissolving. Ice floats because hydrogen bonds hold an open crystal. Source: OpenStax Chemistry 2e.
- Ammonia card. “A nitrogen source plants can use.” → Plants take up ammonium or nitrate, not NH₃ gas. Source: OpenStax; PubChem.
- Rust card. Same hydrated-oxide correction as level 10. Source: PubChem.
- Chalk card. “Traditional chalk” is still CaCO₃. Added: many classroom sticks are gypsum, CaSO₄·2H₂O. Source: OpenStax; PubChem CaCO₃ and gypsum.
- Silica card. “The main compound in beach sand” / “Glass is made by melting silica-rich sand.” → Quartz and a lot of beach sand; glass is silica melted with soda and lime; some tropical beaches are shell sand. Source: PubChem SiO₂.
- Baking soda card. Added the balanced equation `NaHCO3 + CH3COOH -> CH3COONa + H2O + CO2`. Source: OpenStax acid–base; PubChem sodium bicarbonate.
- Helium fact. “Makes balloons float.” → Less dense than air, so a balloon of it rises.
- Magnesium fact. “A magnesium atom sits at the center of chlorophyll.” → A magnesium ion. Source: OpenStax.
- Silicon fact. “Beach sand is mostly silicon dioxide.” → Quartz sand, common on many beaches, is silicon dioxide.
- Potassium fact. “Bananas are famous for it.” → Potatoes, beans, yogurt, and bananas all contain it. Source: USDA food composition, as reflected in standard nutrition references used with OpenStax’s description of potassium.
- Calcium fact. Bones and teeth store calcium inside compounds.
- Vanadium fact. “Some deep-sea animals concentrate it.” → Some sea squirts concentrate vanadium from seawater.
- Chromium fact. “Gives stainless steel its shine and resists rust.” → Mixed into stainless steel, where it helps the surface resist rust.
- Selenium fact. “Photocopiers use selenium.” → Older photocopiers used it. Selenium still colors some glass.
- Silver fact. “The best everyday conductor.” → Silver conducts electricity better than any other metal. Everyday wires are usually copper. Source: OpenStax conductivity comparison.
- Iodine fact. Iodized salt adds an iodine compound, not crystals of the element.
- Iron fact. “Iron in hemoglobin” → “Iron ions in hemoglobin.”
- Aluminum note. US spelling stays “aluminum.” IUPAC spelling is aluminium. Drink-can sheet is an alloy.

## Bugs fixed

Played every level as the 7th grader on a 1280×800 desktop (all 11 cleared on the first try), then level 1, level 2, and Molecule Builder at 390×844. Also checked the parent unlock, a separate 9th-grade profile, a hint, export/import, and a version-1 save migration.

- Atom builder, touch. A tap was compared with a particle that had already been lifted, so the first finger move counted as a drag and the tap added nothing. Travel is now measured from the finger’s origin. A touch tap builds hydrogen (1 proton, then 1 electron). A full mobile run cleared 5/5.
- Atom board height. On a wide window the canvas grew to 560px, so the particle tray and Check button sat below an 800px-tall window. The board is now 400px on a wide screen and 330px on a phone, which keeps the tray and the button on screen.
- Molecule scoring. Slot ids such as `h1` and `o1` repeat from one molecule to the next. Later slots were graded as retries of earlier ones, so a perfect run reported 11/11 instead of 19/19, and a miss on a repeated id did not count. Each answer is now scoped as `moleculeId:slotId`. A perfect run reports 19/19.
- Phone sort bins. Three bins in one row were cramped, and stacking them pushed the cards below the phone. Bins stay in one row, labels wrap, and the row is shorter, so the cards stay on a 390px screen. Level 1 cleared 12/12 there.
- Scrolling a board. `touch-action: none` stopped the page from scrolling when a finger was on the canvas. The board now allows vertical panning and only cancels that pan after a real drag.
- Atom feedback. “Needs 1 protons” is now “needs 1 proton.”

Checked and already working: parent can open Formula Rush with no kid progress; a 9th grader does not inherit the 7th grader’s unlocks; one hint on a perfect Symbol Match run costs 30 points and drops the level from 3 stars to 2; import restores the bank; a version-1 save keeps 4,321 chemistry points and is rewritten as version 2; Home, Switch player, and Back stay visible (Back only when the screen sits under the hub).

## Left for a person to decide

- Oxygen’s Lewis structure. The game still teaches a double bond, which is the OpenStax grade-level picture. The paramagnetism caveat is only in `note`, not in the student sentence.
- Spelling. Cards and prompts say “aluminum,” the US textbook spelling. IUPAC says “aluminium.” The note records both.
- Gold jewelry and commercial bars are often alloys. The prompts no longer call a ring pure gold. The gold card still says ancient gold jewelry shines, which is fair for the element and slightly loose for modern alloys.
- The phone periodic table draws periods 1–4 main groups only, so period 4 is just K and Ca. The how-to says so. Empty cells for the missing transition metals are not drawn.
- Water’s choices include OH₂. It is marked wrong because the conventional formula is H₂O. A teacher could argue OH₂ names the same molecule.
- The glucose card says plants build glucose in photosynthesis. That is the usual middle-school sentence. The Calvin cycle’s direct product is a 3-carbon sugar that plants then turn into glucose and other carbohydrates.
- Oxygen’s displayed weight is 15.9994 so it sits inside the CIAAW interval. A class set of textbooks may still print 15.999.
- True neon discharge is red-orange. The success text already says that. Other sign colors use different gases or phosphors; that stays in the neon note.
