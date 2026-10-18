import raw from './elements.json' with { type: 'json' };

export type Category =
  | 'nonmetal'
  | 'halogen'
  | 'noble gas'
  | 'alkali metal'
  | 'alkaline earth metal'
  | 'transition metal'
  | 'post-transition metal'
  | 'metalloid';

export type ElementRecord = {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  group: number;
  period: number;
  category: Category;
  state: 'solid' | 'liquid' | 'gas';
  massNumber: number;
  fact: string;
  source: string;
  note?: string;
};

const CATEGORIES = new Set<string>([
  'nonmetal',
  'halogen',
  'noble gas',
  'alkali metal',
  'alkaline earth metal',
  'transition metal',
  'post-transition metal',
  'metalloid',
]);

function isElement(value: unknown): value is ElementRecord {
  if (!value || typeof value !== 'object') return false;
  const row = value as ElementRecord;
  return (
    typeof row.z === 'number' &&
    typeof row.symbol === 'string' &&
    typeof row.name === 'string' &&
    typeof row.mass === 'number' &&
    typeof row.group === 'number' &&
    typeof row.period === 'number' &&
    CATEGORIES.has(row.category) &&
    (row.state === 'solid' || row.state === 'liquid' || row.state === 'gas') &&
    typeof row.massNumber === 'number' &&
    typeof row.fact === 'string' &&
    typeof row.source === 'string' &&
    row.source.trim().length > 0 &&
    (row.note === undefined || typeof row.note === 'string')
  );
}

export const ELEMENTS: ElementRecord[] = raw.elements.map((row) => {
  if (!isElement(row)) throw new Error('Periodic table data is missing a field');
  return row;
});

export const DATA_SOURCE = raw.source;

export const bySymbol = new Map(ELEMENTS.map((element) => [element.symbol, element]));
export const byZ = new Map(ELEMENTS.map((element) => [element.z, element]));

export function elementColor(symbol: string): string {
  const element = bySymbol.get(symbol);
  switch (element?.category) {
    case 'alkali metal':
      return '#ff4ecd';
    case 'alkaline earth metal':
      return '#ff8ad4';
    case 'transition metal':
      return '#7eb6ff';
    case 'post-transition metal':
      return '#5ef2ff';
    case 'metalloid':
      return '#c6ff4d';
    case 'halogen':
      return '#ffc857';
    case 'noble gas':
      return '#a996ff';
    default:
      return '#5ef2ff';
  }
}

export function categoryLabel(category: Category): string {
  switch (category) {
    case 'alkali metal':
      return 'Alkali metal';
    case 'alkaline earth metal':
      return 'Alkaline earth metal';
    case 'transition metal':
      return 'Transition metal';
    case 'post-transition metal':
      return 'Post-transition metal';
    case 'metalloid':
      return 'Metalloid';
    case 'halogen':
      return 'Halogen';
    case 'noble gas':
      return 'Noble gas';
    default:
      return 'Nonmetal';
  }
}
