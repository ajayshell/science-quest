import { HINT_COST } from '../scoring.ts';
import type { AppCtx } from './types.ts';
import { el } from './dom.ts';
import { back } from './album.ts';

export function renderHelp(root: HTMLElement, ctx: AppCtx): () => void {
  const screen = el('section', 'help');
  screen.append(back(ctx));
  screen.append(el('p', 'eyebrow', 'How points work'));
  screen.append(el('h1', 'display', 'Score, stars, hints'));
  const items = [
    ['Right answer', '100 points, plus up to 50 more if you answer before the speed target.'],
    ['Streak', 'Each correct answer in a row raises the multiplier by 0.25, up to ×3.'],
    ['Miss', 'A wrong first try breaks the streak and shows a short explanation. Fix it to move on. In Formula Rush you only get one tap.'],
    ['Stars', '3 stars: perfect first tries, no hints, under the star time. 2 stars: at least 80% first tries, at most one hint, and within 1.5× the star time. Finishing always earns at least 1 star.'],
    ['Hints', `A hint costs ${HINT_COST} points. It is spent when the level ends, even if you do not beat your best score.`],
    ['Replay', 'Only the part of your score above your best is added. Stars never go down.'],
    ['Save', 'Each profile keeps its own points, stars, and cards for each subject in this browser. Export a JSON backup from the profile screen.'],
    ['Parent', 'The parent profile can open every level, world, and boss. Students unlock the next level by finishing the one before it.'],
  ];
  const list = el('div', 'help-list');
  for (const [title, body] of items) {
    const card = el('article', 'help-card');
    card.append(el('h2', '', title));
    card.append(el('p', '', body));
    list.append(card);
  }
  screen.append(list);
  root.append(screen);
  return () => undefined;
}
