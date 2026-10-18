import { atomCount } from '../formula.ts';
import type { ChoiceDef } from './level-def.ts';

export function formulaCount(input: {
  id: string;
  formula: string;
  element: string;
  elementName: string;
  choices: number[];
  hint: string;
  wrong: string;
  success: string;
  prompt?: string;
}): ChoiceDef {
  const answer = atomCount(input.formula, input.element);
  if (!input.choices.includes(answer)) {
    throw new Error(`${input.id} choices do not include ${answer}`);
  }
  return {
    id: input.id,
    prompt: input.prompt ?? `How many ${input.elementName} atoms are in this formula?`,
    figure: input.formula,
    figureKind: 'formula',
    choices: input.choices.map((n) => ({ id: String(n), label: String(n) })),
    correctId: String(answer),
    hint: input.hint,
    wrong: input.wrong,
    success: input.success,
  };
}
