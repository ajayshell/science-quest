import type { Category } from './elements.ts';

/**
 * Offline check values for the vendored table.
 * Atomic weights are CIAAW standard atomic weights (2024): a number, or the published interval.
 * massNumber is the most abundant isotope from NIST Atomic Weights and Isotopic Compositions.
 * States are the normal state near 25 °C and 1 atm.
 */
export type IupacRef = {
  z: number;
  group: number;
  period: number;
  /** A conventional value, or the CIAAW interval the displayed weight must sit inside. */
  mass: number | readonly [number, number];
  massNumber: number;
  category: Category;
  state: 'solid' | 'liquid' | 'gas';
};

export const IUPAC_REFERENCE: Record<string, IupacRef> = {
  H: { z: 1, group: 1, period: 1, mass: [1.00784, 1.00811], massNumber: 1, category: 'nonmetal', state: 'gas' },
  He: { z: 2, group: 18, period: 1, mass: 4.002602, massNumber: 4, category: 'noble gas', state: 'gas' },
  Li: { z: 3, group: 1, period: 2, mass: [6.938, 6.997], massNumber: 7, category: 'alkali metal', state: 'solid' },
  Be: { z: 4, group: 2, period: 2, mass: 9.0121831, massNumber: 9, category: 'alkaline earth metal', state: 'solid' },
  B: { z: 5, group: 13, period: 2, mass: [10.806, 10.821], massNumber: 11, category: 'metalloid', state: 'solid' },
  C: { z: 6, group: 14, period: 2, mass: [12.0096, 12.0116], massNumber: 12, category: 'nonmetal', state: 'solid' },
  N: { z: 7, group: 15, period: 2, mass: [14.00643, 14.00728], massNumber: 14, category: 'nonmetal', state: 'gas' },
  O: { z: 8, group: 16, period: 2, mass: [15.99903, 15.99977], massNumber: 16, category: 'nonmetal', state: 'gas' },
  F: { z: 9, group: 17, period: 2, mass: 18.998403162, massNumber: 19, category: 'halogen', state: 'gas' },
  Ne: { z: 10, group: 18, period: 2, mass: 20.1797, massNumber: 20, category: 'noble gas', state: 'gas' },
  Na: { z: 11, group: 1, period: 3, mass: 22.98976928, massNumber: 23, category: 'alkali metal', state: 'solid' },
  Mg: { z: 12, group: 2, period: 3, mass: [24.304, 24.307], massNumber: 24, category: 'alkaline earth metal', state: 'solid' },
  Al: { z: 13, group: 13, period: 3, mass: 26.9815384, massNumber: 27, category: 'post-transition metal', state: 'solid' },
  Si: { z: 14, group: 14, period: 3, mass: [28.084, 28.086], massNumber: 28, category: 'metalloid', state: 'solid' },
  P: { z: 15, group: 15, period: 3, mass: 30.973761998, massNumber: 31, category: 'nonmetal', state: 'solid' },
  S: { z: 16, group: 16, period: 3, mass: [32.059, 32.076], massNumber: 32, category: 'nonmetal', state: 'solid' },
  Cl: { z: 17, group: 17, period: 3, mass: [35.446, 35.457], massNumber: 35, category: 'halogen', state: 'gas' },
  Ar: { z: 18, group: 18, period: 3, mass: [39.792, 39.963], massNumber: 40, category: 'noble gas', state: 'gas' },
  K: { z: 19, group: 1, period: 4, mass: 39.0983, massNumber: 39, category: 'alkali metal', state: 'solid' },
  Ca: { z: 20, group: 2, period: 4, mass: 40.078, massNumber: 40, category: 'alkaline earth metal', state: 'solid' },
  Sc: { z: 21, group: 3, period: 4, mass: 44.955907, massNumber: 45, category: 'transition metal', state: 'solid' },
  Ti: { z: 22, group: 4, period: 4, mass: 47.867, massNumber: 48, category: 'transition metal', state: 'solid' },
  V: { z: 23, group: 5, period: 4, mass: 50.9415, massNumber: 51, category: 'transition metal', state: 'solid' },
  Cr: { z: 24, group: 6, period: 4, mass: 51.9961, massNumber: 52, category: 'transition metal', state: 'solid' },
  Mn: { z: 25, group: 7, period: 4, mass: 54.938043, massNumber: 55, category: 'transition metal', state: 'solid' },
  Fe: { z: 26, group: 8, period: 4, mass: 55.845, massNumber: 56, category: 'transition metal', state: 'solid' },
  Co: { z: 27, group: 9, period: 4, mass: 58.933194, massNumber: 59, category: 'transition metal', state: 'solid' },
  Ni: { z: 28, group: 10, period: 4, mass: 58.6934, massNumber: 58, category: 'transition metal', state: 'solid' },
  Cu: { z: 29, group: 11, period: 4, mass: 63.546, massNumber: 63, category: 'transition metal', state: 'solid' },
  Zn: { z: 30, group: 12, period: 4, mass: 65.38, massNumber: 64, category: 'transition metal', state: 'solid' },
  Ga: { z: 31, group: 13, period: 4, mass: 69.723, massNumber: 69, category: 'post-transition metal', state: 'solid' },
  Ge: { z: 32, group: 14, period: 4, mass: 72.63, massNumber: 74, category: 'metalloid', state: 'solid' },
  As: { z: 33, group: 15, period: 4, mass: 74.921595, massNumber: 75, category: 'metalloid', state: 'solid' },
  Se: { z: 34, group: 16, period: 4, mass: 78.971, massNumber: 80, category: 'nonmetal', state: 'solid' },
  Br: { z: 35, group: 17, period: 4, mass: [79.901, 79.907], massNumber: 79, category: 'halogen', state: 'liquid' },
  Kr: { z: 36, group: 18, period: 4, mass: 83.798, massNumber: 84, category: 'noble gas', state: 'gas' },
  Ag: { z: 47, group: 11, period: 5, mass: 107.8682, massNumber: 107, category: 'transition metal', state: 'solid' },
  I: { z: 53, group: 17, period: 5, mass: 126.90447, massNumber: 127, category: 'halogen', state: 'solid' },
  Au: { z: 79, group: 11, period: 6, mass: 196.96657, massNumber: 197, category: 'transition metal', state: 'solid' },
};
