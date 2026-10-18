import { describe, expect, it } from 'vitest';
import { atomCount, countAtoms, equationBalances, formulaHtml } from './formula.ts';

describe('countAtoms', () => {
  it('counts water, glucose, and salt', () => {
    expect(countAtoms('H2O')).toEqual({ H: 2, O: 1 });
    expect(countAtoms('C6H12O6')).toEqual({ C: 6, H: 12, O: 6 });
    expect(countAtoms('NaCl')).toEqual({ Na: 1, Cl: 1 });
  });

  it('multiplies groups in parentheses', () => {
    expect(countAtoms('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(countAtoms('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 });
    expect(countAtoms('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 });
  });

  it('applies a leading coefficient to the whole formula', () => {
    expect(countAtoms('2H2O')).toEqual({ H: 4, O: 2 });
    expect(atomCount('2H2O', 'H')).toBe(4);
    expect(countAtoms('2(NH4)2SO4')).toEqual({ N: 4, H: 16, S: 2, O: 8 });
  });

  it('counts vinegar and rust', () => {
    expect(countAtoms('CH3COOH')).toEqual({ C: 2, H: 4, O: 2 });
    expect(countAtoms('Fe2O3')).toEqual({ Fe: 2, O: 3 });
    expect(countAtoms('C12H22O11')).toEqual({ C: 12, H: 22, O: 11 });
  });

  it('rejects empty groups and junk', () => {
    expect(() => countAtoms('')).toThrow();
    expect(() => countAtoms('()')).toThrow();
    expect(() => countAtoms('H2O)')).toThrow();
    expect(() => countAtoms('2')).toThrow();
    expect(() => countAtoms('h2o')).toThrow();
  });
});

describe('equationBalances', () => {
  it('accepts a balanced reaction and rejects one that is not', () => {
    expect(equationBalances('NaHCO3 + CH3COOH -> CH3COONa + H2O + CO2')).toBe(true);
    expect(equationBalances('2H2 + O2 -> 2H2O')).toBe(true);
    expect(equationBalances('H2 + O2 -> H2O')).toBe(false);
    expect(equationBalances('H2O')).toBe(false);
    expect(equationBalances('H2O ->')).toBe(false);
  });
});

describe('formulaHtml', () => {
  it('subscripts atom counts but not a leading coefficient', () => {
    expect(formulaHtml('C6H12O6')).toBe('C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>');
    expect(formulaHtml('Ca(OH)2')).toBe('Ca(OH)<sub>2</sub>');
    expect(formulaHtml('2H2O')).toBe('2H<sub>2</sub>O');
    expect(formulaHtml('Al2(SO4)3')).toBe('Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub>');
  });
});
