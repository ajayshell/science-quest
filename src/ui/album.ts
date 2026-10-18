import { CARDS, type CardDef } from '../data/cards.ts';
import { formulaHtml } from '../formula.ts';
import type { AppCtx } from './types.ts';
import { el } from './dom.ts';

export function renderAlbum(root: HTMLElement, ctx: AppCtx): () => void {
  const owned = new Set(ctx.progress().cards);
  const screen = el('section', 'album');
  screen.append(back(ctx));
  screen.append(el('p', 'eyebrow', 'Collection'));
  screen.append(el('h1', 'display', 'Element & molecule cards'));
  screen.append(
    el(
      'p',
      'lede',
      `${owned.size} of ${CARDS.length} lit. Clear a level to unlock the cards it teaches.`,
    ),
  );

  const filters = el('div', 'filters');
  let mode: 'all' | 'element' | 'molecule' = 'all';
  const grid = el('div', 'card-grid');
  const buttons: HTMLButtonElement[] = [];
  for (const [id, label] of [
    ['all', 'All'],
    ['element', 'Elements'],
    ['molecule', 'Molecules'],
  ] as const) {
    const button = el('button', 'ghost', label);
    button.type = 'button';
    button.addEventListener('click', () => {
      mode = id;
      for (const node of buttons) node.classList.toggle('is-on', node === button);
      paint();
    });
    buttons.push(button);
    filters.append(button);
  }
  buttons[0]?.classList.add('is-on');
  screen.append(filters, grid);

  function paint(): void {
    grid.replaceChildren();
    for (const card of CARDS) {
      if (mode !== 'all' && card.kind !== mode) continue;
      const unlocked = owned.has(card.id);
      const tile = el('button', unlocked ? 'collect' : 'collect is-locked');
      tile.type = 'button';
      tile.style.setProperty('--accent', card.accent);
      tile.disabled = !unlocked;
      const formula = el('span', 'collect-formula');
      if (unlocked && card.kind === 'molecule') formula.innerHTML = formulaHtml(card.formula);
      else formula.textContent = unlocked ? card.formula : '?';
      tile.append(formula);
      tile.append(el('span', 'collect-title', unlocked ? card.title : 'Locked'));
      tile.append(el('span', 'collect-fact', unlocked ? card.fact : 'Clear a level to read this'));
      if (unlocked) tile.addEventListener('click', () => openCard(card));
      grid.append(tile);
    }
  }

  function openCard(card: CardDef): void {
    const dialog = el('dialog', 'card-dialog');
    dialog.style.setProperty('--accent', card.accent);
    const formula = el('p', 'dialog-formula');
    if (card.kind === 'molecule') formula.innerHTML = formulaHtml(card.formula);
    else formula.textContent = card.formula;
    dialog.append(el('p', 'eyebrow', card.kind === 'element' ? 'Element' : 'Compound'));
    dialog.append(el('h2', '', card.title));
    dialog.append(formula);
    dialog.append(el('p', 'dialog-fact', card.detail));
    const close = el('button', 'primary', 'Close');
    close.type = 'button';
    close.addEventListener('click', () => dialog.close());
    dialog.append(close);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => dialog.remove());
    root.append(dialog);
    dialog.showModal();
  }

  paint();
  root.append(screen);
  return () => undefined;
}

export function back(ctx: AppCtx): HTMLButtonElement {
  const button = el('button', 'back', '← Hub');
  button.type = 'button';
  button.addEventListener('click', () => ctx.go({ name: 'hub' }));
  return button;
}
