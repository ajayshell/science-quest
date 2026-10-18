import { SRC } from './sources.ts';
import { bySymbol, categoryLabel, elementColor, type ElementRecord } from './elements.ts';

export type CardDef = {
  id: string;
  kind: 'element' | 'molecule';
  title: string;
  formula: string;
  accent: string;
  fact: string;
  detail: string;
  source: string;
  note?: string;
  /** A reaction this card teaches, if any. Tests require it to balance. */
  equation?: string;
};

const MOLECULES: CardDef[] = [
  {
    id: 'h2o',
    kind: 'molecule',
    title: 'Water',
    formula: 'H2O',
    accent: '#5ef2ff',
    fact: 'Two hydrogen atoms bonded to one oxygen atom.',
    detail: 'Water covers most of Earth. The bent shape makes it polar, so it dissolves many substances. Hydrogen bonds also hold ice in an open crystal, which is why ice floats.',
    source: SRC.compounds,
    note: 'Ice floats because the solid has a more open hydrogen-bonded structure, not because the bend alone is the whole reason.',
  },
  {
    id: 'o2',
    kind: 'molecule',
    title: 'Oxygen gas',
    formula: 'O2',
    accent: '#ff4ecd',
    fact: 'Two oxygen atoms sharing a double bond.',
    detail: 'The oxygen you breathe is O₂. It is still the element oxygen — a molecule made of one kind of atom, not a compound.',
    source: SRC.compounds,
    note: 'The Lewis structure used at this grade shows a double bond. O2 is paramagnetic, which that picture does not explain.',
  },
  {
    id: 'co2',
    kind: 'molecule',
    title: 'Carbon dioxide',
    formula: 'CO2',
    accent: '#ffc857',
    fact: 'One carbon atom with an oxygen on each side.',
    detail: 'You exhale CO₂. Plants take it in, and it is the gas that makes soda fizzy.',
    source: SRC.compounds,
  },
  {
    id: 'ch4',
    kind: 'molecule',
    title: 'Methane',
    formula: 'CH4',
    accent: '#c6ff4d',
    fact: 'One carbon atom surrounded by four hydrogens.',
    detail: 'Methane is the main gas in natural gas used by some stoves and heaters.',
    source: SRC.compounds,
  },
  {
    id: 'nh3',
    kind: 'molecule',
    title: 'Ammonia',
    formula: 'NH3',
    accent: '#c6ff4d',
    fact: 'One nitrogen atom bonded to three hydrogens.',
    detail: 'Ammonia is in some household cleaners. Farmers use ammonia-based fertilizer; plants take up the nitrogen as ammonium or nitrate.',
    source: SRC.compounds,
    note: 'Plants do not absorb NH3 gas directly. Soil converts ammonia fertilizer into ammonium and nitrate.',
  },
  {
    id: 'nacl',
    kind: 'molecule',
    title: 'Sodium chloride',
    formula: 'NaCl',
    accent: '#a996ff',
    fact: 'Table salt. Sodium gives an electron to chlorine.',
    detail: 'NaCl is an ionic compound, not a molecule of shared electrons. The crystals on your food are this pair repeating.',
    source: SRC.compounds,
  },
  {
    id: 'glucose',
    kind: 'molecule',
    title: 'Glucose',
    formula: 'C6H12O6',
    accent: '#ffc857',
    fact: 'A simple sugar: 6 carbons, 12 hydrogens, 6 oxygens.',
    detail: 'Your cells break glucose apart to release energy. It is the sugar plants build in photosynthesis.',
    source: SRC.compounds,
  },
  {
    id: 'baking-soda',
    kind: 'molecule',
    title: 'Baking soda',
    formula: 'NaHCO3',
    accent: '#7eb6ff',
    fact: 'Sodium bicarbonate, the powder that makes batter rise.',
    detail: 'When baking soda meets an acid, it releases carbon dioxide bubbles. Those bubbles lift cakes and cookies.',
    source: SRC.compounds,
    equation: 'NaHCO3 + CH3COOH -> CH3COONa + H2O + CO2',
  },
  {
    id: 'vinegar',
    kind: 'molecule',
    title: 'Acetic acid',
    formula: 'CH3COOH',
    accent: '#ff8ad4',
    fact: 'The sour compound in vinegar.',
    detail: 'Kitchen vinegar is mostly water with acetic acid mixed in. The acid is what tastes sour.',
    source: SRC.compounds,
  },
  {
    id: 'rust',
    kind: 'molecule',
    title: 'Rust',
    formula: 'Fe2O3',
    accent: '#ff7a90',
    fact: 'Iron(III) oxide, the main iron compound in red-brown rust.',
    detail: 'Rust forms when iron reacts with oxygen and water. Fe₂O₃ is the iron(III) oxide in that coating. Real rust also holds water.',
    source: SRC.compounds,
    note: 'Rust is hydrated iron(III) oxide, often written Fe2O3·nH2O, not a jar of pure anhydrous Fe2O3.',
  },
  {
    id: 'chalk',
    kind: 'molecule',
    title: 'Calcium carbonate',
    formula: 'CaCO3',
    accent: '#d7ffe7',
    fact: 'The mineral in seashells, limestone, and traditional chalk. Many classroom sticks are gypsum instead.',
    note: 'Modern blackboard chalk is often gypsum, CaSO4·2H2O, not calcium carbonate.',
    detail: 'Corals and many seashells build CaCO₃. Limestone caves are made of it too.',
    source: SRC.compounds,
  },
  {
    id: 'sucrose',
    kind: 'molecule',
    title: 'Table sugar',
    formula: 'C12H22O11',
    accent: '#ffc857',
    fact: 'Sucrose, the crystals in a sugar bowl.',
    detail: 'Table sugar is sucrose, C₁₂H₂₂O₁₁. It is different from glucose, C₆H₁₂O₆, even though both taste sweet.',
    source: SRC.compounds,
  },
  {
    id: 'sand',
    kind: 'molecule',
    title: 'Silica',
    formula: 'SiO2',
    accent: '#c6ff4d',
    fact: 'Silicon dioxide, the compound in quartz and in a lot of beach sand.',
    detail: 'Quartz is SiO₂. Many beaches are quartz sand. Glass is made by melting silica-rich sand with soda and lime. Some tropical beaches are shell sand instead.',
    source: SRC.compounds,
    note: 'Carbonate sand is mostly CaCO3, not SiO2. Soda-lime glass is silica plus sodium carbonate and calcium carbonate.',
  },
];

const ALBUM_SYMBOLS = [
  'H', 'He', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Al', 'Si', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Cu', 'Ag', 'I', 'Au',
];

function elementCard(element: ElementRecord): CardDef {
  return {
    id: element.symbol,
    kind: 'element',
    title: element.name,
    formula: element.symbol,
    accent: elementColor(element.symbol),
    fact: `${categoryLabel(element.category)} · atomic number ${element.z}.`,
    detail: element.fact,
    source: element.source,
    note: element.note,
  };
}

export const CARDS: CardDef[] = [
  ...ALBUM_SYMBOLS.map((symbol) => {
    const element = bySymbol.get(symbol);
    if (!element) throw new Error(`Missing element card ${symbol}`);
    return elementCard(element);
  }),
  ...MOLECULES,
];

const byId = new Map(CARDS.map((card) => [card.id, card]));

export function getCard(id: string): CardDef | undefined {
  return byId.get(id);
}
