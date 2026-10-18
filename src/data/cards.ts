import { bySymbol, categoryLabel, elementColor, type ElementRecord } from './elements.ts';

export type CardDef = {
  id: string;
  kind: 'element' | 'molecule';
  title: string;
  formula: string;
  accent: string;
  fact: string;
  detail: string;
};

const MOLECULES: CardDef[] = [
  {
    id: 'h2o',
    kind: 'molecule',
    title: 'Water',
    formula: 'H2O',
    accent: '#5ef2ff',
    fact: 'Two hydrogen atoms bonded to one oxygen atom.',
    detail: 'Water covers most of Earth. The bent shape of H₂O is why ice floats and why water dissolves so many things.',
  },
  {
    id: 'o2',
    kind: 'molecule',
    title: 'Oxygen gas',
    formula: 'O2',
    accent: '#ff4ecd',
    fact: 'Two oxygen atoms sharing a double bond.',
    detail: 'The oxygen you breathe is O₂. It is still the element oxygen — a molecule made of one kind of atom, not a compound.',
  },
  {
    id: 'co2',
    kind: 'molecule',
    title: 'Carbon dioxide',
    formula: 'CO2',
    accent: '#ffc857',
    fact: 'One carbon atom with an oxygen on each side.',
    detail: 'You exhale CO₂. Plants take it in, and it is the gas that makes soda fizzy.',
  },
  {
    id: 'ch4',
    kind: 'molecule',
    title: 'Methane',
    formula: 'CH4',
    accent: '#c6ff4d',
    fact: 'One carbon atom surrounded by four hydrogens.',
    detail: 'Methane is the main gas in natural gas used by some stoves and heaters.',
  },
  {
    id: 'nh3',
    kind: 'molecule',
    title: 'Ammonia',
    formula: 'NH3',
    accent: '#c6ff4d',
    fact: 'One nitrogen atom bonded to three hydrogens.',
    detail: 'Ammonia is in some household cleaners and is a nitrogen source plants can use.',
  },
  {
    id: 'nacl',
    kind: 'molecule',
    title: 'Sodium chloride',
    formula: 'NaCl',
    accent: '#a996ff',
    fact: 'Table salt. Sodium gives an electron to chlorine.',
    detail: 'NaCl is an ionic compound, not a molecule of shared electrons. The crystals on your food are this pair repeating.',
  },
  {
    id: 'glucose',
    kind: 'molecule',
    title: 'Glucose',
    formula: 'C6H12O6',
    accent: '#ffc857',
    fact: 'A simple sugar: 6 carbons, 12 hydrogens, 6 oxygens.',
    detail: 'Your cells break glucose apart to release energy. It is the sugar plants build in photosynthesis.',
  },
  {
    id: 'baking-soda',
    kind: 'molecule',
    title: 'Baking soda',
    formula: 'NaHCO3',
    accent: '#7eb6ff',
    fact: 'Sodium bicarbonate, the powder that makes batter rise.',
    detail: 'When baking soda meets an acid, it releases carbon dioxide bubbles. Those bubbles lift cakes and cookies.',
  },
  {
    id: 'vinegar',
    kind: 'molecule',
    title: 'Acetic acid',
    formula: 'CH3COOH',
    accent: '#ff8ad4',
    fact: 'The sour compound in vinegar.',
    detail: 'Kitchen vinegar is mostly water with acetic acid mixed in. The acid is what tastes sour.',
  },
  {
    id: 'rust',
    kind: 'molecule',
    title: 'Rust',
    formula: 'Fe2O3',
    accent: '#ff7a90',
    fact: 'Iron oxide, the red-brown coating on old iron.',
    detail: 'Rust forms when iron reacts with oxygen and water. The formula Fe₂O₃ is the iron(III) oxide in that coating.',
  },
  {
    id: 'chalk',
    kind: 'molecule',
    title: 'Calcium carbonate',
    formula: 'CaCO3',
    accent: '#d7ffe7',
    fact: 'The mineral in seashells, limestone, and traditional chalk.',
    detail: 'Corals and many seashells build CaCO₃. Limestone caves are made of it too.',
  },
  {
    id: 'sucrose',
    kind: 'molecule',
    title: 'Table sugar',
    formula: 'C12H22O11',
    accent: '#ffc857',
    fact: 'Sucrose, the crystals in a sugar bowl.',
    detail: 'Table sugar is sucrose, C₁₂H₂₂O₁₁. It is different from glucose, C₆H₁₂O₆, even though both taste sweet.',
  },
  {
    id: 'sand',
    kind: 'molecule',
    title: 'Silica',
    formula: 'SiO2',
    accent: '#c6ff4d',
    fact: 'Silicon dioxide, the main compound in beach sand.',
    detail: 'Quartz and most beach sand are SiO₂. Glass is made by melting silica-rich sand.',
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
