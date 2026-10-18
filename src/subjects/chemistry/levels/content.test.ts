import { describe, expect, it } from 'vitest';
import { getCard } from '../../../data/cards.ts';
import { bySymbol } from '../../../data/elements.ts';
import { atomCount } from '../../../formula.ts';
import { LEVELS } from './index.ts';
import { SCENES } from '../../../play/scenes.ts';
import { MAIN_GROUP_SYMBOLS } from '../../../play/table-map.ts';

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
        for (const symbol of level.blanks) expect(MAIN_GROUP_SYMBOLS.has(symbol)).toBe(true);
      }
      if (level.kind === 'hunt') {
        for (const prompt of level.prompts) {
          const scene = SCENES[prompt.scene];
          expect(scene.objects.some((object) => object.id === prompt.targetId)).toBe(true);
        }
      }
      if (level.kind === 'molecule') {
        for (const molecule of level.molecules) {
          for (const slot of molecule.slots) {
            expect(molecule.bank.includes(slot.element)).toBe(true);
            expect(bySymbol.has(slot.element)).toBe(true);
          }
        }
      }
    }
  });
});
