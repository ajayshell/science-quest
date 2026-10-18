import { describe, expect, it } from 'vitest';
import { CARDS, getCard } from '../../../data/cards.ts';
import { ELEMENTS, bySymbol } from '../../../data/elements.ts';
import { IUPAC_REFERENCE } from '../../../data/iupac-reference.ts';
import type { Citation, LevelDef } from '../../../engine/level-def.ts';
import { atomCount, countAtoms, equationBalances } from '../../../formula.ts';
import { LEVELS } from './index.ts';
import { SCENES } from '../../../play/scenes.ts';
import { MAIN_GROUP_SYMBOLS, TABLE_COLUMNS, TABLE_ROWS } from '../../../play/table-map.ts';

function itemsOf(level: LevelDef): Citation[] {
  switch (level.kind) {
    case 'sort':
      return level.rounds.flatMap((round) => round.items);
    case 'atom':
      return [...level.challenges];
    case 'choice':
    case 'rush':
      return level.questions;
    case 'table':
      return [...level.blanks];
    case 'hunt':
      return level.prompts;
    case 'molecule':
      return level.molecules;
    case 'formula':
      return level.prompts;
  }
}

function itemIds(level: LevelDef): string[] {
  switch (level.kind) {
    case 'sort':
      return level.rounds.flatMap((round) => round.items.map((item) => item.id));
    case 'atom':
      return level.challenges.map((item) => item.symbol);
    case 'choice':
    case 'rush':
      return level.questions.map((item) => item.id);
    case 'table':
      return level.blanks.map((item) => item.symbol);
    case 'hunt':
      return level.prompts.map((item) => item.id);
    case 'molecule':
      return level.molecules.map((item) => item.id);
    case 'formula':
      return level.prompts.map((item) => item.id);
  }
}

describe('M1 level content', () => {
  it('ships levels 1 through 11 in order across three worlds', () => {
    expect(LEVELS.map((level) => level.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(11);
    expect(LEVELS.filter((level) => level.world === 1).map((level) => level.number)).toEqual([1, 2, 3]);
    expect(LEVELS.filter((level) => level.world === 2).map((level) => level.number)).toEqual([4, 5, 6, 7]);
    expect(LEVELS.filter((level) => level.world === 3).map((level) => level.number)).toEqual([8, 9, 10, 11]);
    expect(LEVELS[6]?.boss).toBe(true);
    expect(LEVELS[10]?.boss).toBe(true);
  });

  it('points every card, symbol, formula, and hunt target at real data', () => {
    for (const level of LEVELS) {
      for (const id of level.cardIds) expect(getCard(id), `${level.id} card ${id}`).toBeTruthy();
      if (level.kind === 'choice' || level.kind === 'rush') {
        for (const question of level.questions) {
          expect(question.choices.some((choice) => choice.id === question.correctId)).toBe(true);
          const ids = question.choices.map((choice) => choice.id);
          expect(new Set(ids).size).toBe(ids.length);
        }
      }
      if (level.kind === 'formula') {
        for (const prompt of level.prompts) {
          const answer = atomCount(prompt.formula, prompt.element);
          expect(prompt.choices, prompt.id).toContain(answer);
        }
      }
      if (level.kind === 'sort') {
        for (const round of level.rounds) {
          const zones = new Set(round.zones.map((zone) => zone.id));
          for (const item of round.items) expect(zones.has(item.zoneId)).toBe(true);
        }
      }
      if (level.kind === 'atom') {
        for (const challenge of level.challenges) {
          const element = bySymbol.get(challenge.symbol);
          expect(element?.massNumber).toBe(challenge.massNumber);
        }
      }
      if (level.kind === 'table') {
        for (const blank of level.blanks) expect(MAIN_GROUP_SYMBOLS.has(blank.symbol)).toBe(true);
      }
      if (level.kind === 'hunt') {
        for (const prompt of level.prompts) {
          const scene = SCENES[prompt.scene];
          expect(scene.objects.some((object) => object.id === prompt.targetId)).toBe(true);
        }
      }
      if (level.kind === 'molecule') {
        for (const molecule of level.molecules) {
          const stated = countAtoms(molecule.formula);
          const placed: Record<string, number> = {};
          const bank: Record<string, number> = {};
          for (const element of molecule.bank) bank[element] = (bank[element] ?? 0) + 1;
          for (const slot of molecule.slots) {
            expect(molecule.bank.includes(slot.element), molecule.id).toBe(true);
            expect(bySymbol.has(slot.element), slot.element).toBe(true);
            placed[slot.element] = (placed[slot.element] ?? 0) + 1;
          }
          expect(placed, molecule.formula).toEqual(stated);
          for (const [element, count] of Object.entries(stated)) {
            expect(bank[element] ?? 0, molecule.id).toBeGreaterThanOrEqual(count);
          }
        }
      }
    }
  });

  it('gives every item and card a source, one correct answer, and unique ids', () => {
    const levelIds = LEVELS.map((level) => level.id);
    expect(new Set(levelIds).size).toBe(levelIds.length);
    const cardIds = CARDS.map((card) => card.id);
    expect(new Set(cardIds).size).toBe(cardIds.length);

    for (const card of CARDS) {
      expect(card.source.trim().length, card.id).toBeGreaterThan(10);
      if (card.equation) expect(equationBalances(card.equation), card.equation).toBe(true);
    }

    for (const level of LEVELS) {
      const ids = itemIds(level);
      expect(new Set(ids).size, level.id).toBe(ids.length);
      for (const item of itemsOf(level)) {
        expect(item.source.trim().length, `${level.id} source`).toBeGreaterThan(10);
        if ('equation' in item && typeof item.equation === 'string') {
          expect(equationBalances(item.equation)).toBe(true);
        }
      }
      if (level.kind === 'choice' || level.kind === 'rush') {
        for (const question of level.questions) {
          const matches = question.choices.filter((choice) => choice.id === question.correctId);
          expect(matches, question.id).toHaveLength(1);
        }
      }
      if (level.kind === 'formula') {
        for (const prompt of level.prompts) {
          const answer = atomCount(prompt.formula, prompt.element);
          const hits = prompt.choices.filter((choice) => choice === answer);
          expect(hits, prompt.id).toEqual([answer]);
        }
      }
      if (level.kind === 'atom') {
        for (const challenge of level.challenges) {
          const element = bySymbol.get(challenge.symbol);
          expect(element).toBeTruthy();
          expect(challenge.massNumber - (element?.z ?? 0)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('matches IUPAC identity data and the main-group grid', () => {
    expect(ELEMENTS.map((element) => element.symbol).sort()).toEqual(Object.keys(IUPAC_REFERENCE).sort());
    for (const element of ELEMENTS) {
      const ref = IUPAC_REFERENCE[element.symbol];
      expect(ref, element.symbol).toBeTruthy();
      expect(element.z).toBe(ref!.z);
      expect(element.group).toBe(ref!.group);
      expect(element.period).toBe(ref!.period);
      expect(element.massNumber).toBe(ref!.massNumber);
      expect(element.category).toBe(ref!.category);
      expect(element.state).toBe(ref!.state);
      if (typeof ref!.mass === 'number') expect(Math.abs(element.mass - ref!.mass)).toBeLessThanOrEqual(0.0015);
      else {
        expect(element.mass).toBeGreaterThanOrEqual(ref!.mass[0]);
        expect(element.mass).toBeLessThanOrEqual(ref!.mass[1]);
      }
    }
    const seenZ = new Set(ELEMENTS.map((element) => element.z));
    expect(seenZ.size).toBe(ELEMENTS.length);

    TABLE_ROWS.forEach((row, rowIndex) => {
      row.forEach((symbol, column) => {
        if (!symbol) return;
        const element = bySymbol.get(symbol);
        expect(element?.group).toBe(TABLE_COLUMNS[column]);
        expect(element?.period).toBe(rowIndex + 1);
      });
    });
  });
});
