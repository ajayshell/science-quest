import type { ChoiceDef } from '../../../engine/level-def.ts';

export { formulaCount } from '../../../engine/formula-prompt.ts';

export function choice(partial: ChoiceDef): ChoiceDef {
  return partial;
}
