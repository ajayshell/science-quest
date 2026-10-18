import { formulaCount } from '../engine/formula-prompt.ts';
import type { LevelDef } from '../engine/level-def.ts';
import { mountAtom } from './atom-view.ts';
import { mountChoice } from './choice-view.ts';
import { mountHunt } from './hunt-view.ts';
import { mountMolecule } from './molecule-view.ts';
import { mountSort } from './sort-view.ts';
import { mountTable } from './table-view.ts';
import type { PlayHooks } from './types.ts';

export function mountLevel(host: HTMLElement, level: LevelDef, hooks: PlayHooks): () => void {
  switch (level.kind) {
    case 'sort':
      return mountSort(host, level.rounds, hooks);
    case 'atom':
      return mountAtom(host, level.challenges, hooks);
    case 'choice':
      return mountChoice(host, level.questions, hooks, 'retry');
    case 'table':
      return mountTable(host, level.blanks, hooks);
    case 'hunt':
      return mountHunt(host, level.prompts, hooks);
    case 'molecule':
      return mountMolecule(host, level.molecules, hooks);
    case 'formula':
      return mountChoice(
        host,
        level.prompts.map((prompt) =>
          formulaCount({
            id: prompt.id,
            formula: prompt.formula,
            element: prompt.element,
            elementName: prompt.elementName,
            choices: prompt.choices,
            hint: prompt.hint,
            wrong: prompt.wrong,
            success: prompt.success,
          }),
        ),
        hooks,
        'retry',
      );
    case 'rush':
      return mountChoice(host, level.questions, hooks, 'once', performance.now() + level.seconds * 1000);
    default: {
      const never: never = level;
      throw new Error(`Unknown level ${(never as LevelDef).id}`);
    }
  }
}
