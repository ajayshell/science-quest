import { LEVELS, WORLDS, levelsInWorld } from '../data/levels/index.ts';
import { isUnlocked, nextOpenLevel, totalStars } from '../game/unlock.ts';
import type { AppCtx } from './types.ts';
import { el, starRow } from './dom.ts';
import { avatarSvg } from './icons.ts';

export function renderHub(root: HTMLElement, ctx: AppCtx): () => void {
  const profile = ctx.profile();
  const progress = ctx.progress();
  const screen = el('section', 'hub');
  const top = el('header', 'hub-top');
  const who = el('button', 'who');
  who.type = 'button';
  who.innerHTML = avatarSvg(profile.avatar);
  const meta = el('span', 'who-meta');
  meta.append(el('strong', '', profile.name));
  meta.append(el('span', '', profile.gradeLabel));
  who.append(meta);
  who.addEventListener('click', () => ctx.go({ name: 'profiles' }));

  const stats = el('div', 'hub-stats');
  stats.append(el('span', 'stat', `${progress.points.toLocaleString()} pts`));
  stats.append(el('span', 'stat', `${totalStars(progress)} / ${LEVELS.length * 3} stars`));
  const nav = el('nav', 'hub-nav');
  for (const [label, route] of [
    ['Cards', { name: 'cards' }],
    ['Ranks', { name: 'ranks' }],
    ['Scoring', { name: 'scoring' }],
  ] as const) {
    const button = el('button', 'ghost', label);
    button.type = 'button';
    button.addEventListener('click', () => ctx.go(route));
    nav.append(button);
  }
  top.append(who, stats, nav);
  screen.append(top);

  const upNext = nextOpenLevel(progress);
  if (upNext === null) {
    screen.append(el('p', 'banner', 'Worlds 1–3 are cleared. More worlds are still in the lab.'));
  }

  const worlds = el('div', 'worlds');
  for (const world of WORLDS) {
    const panel = el('section', 'world');
    panel.style.setProperty('--world', world.color);
    const head = el('div', 'world-head');
    head.append(el('p', 'eyebrow', world.kicker));
    head.append(el('h2', '', world.title));
    head.append(el('p', '', world.blurb));
    const list = el('div', 'level-list');
    for (const level of levelsInWorld(world.id)) {
      const open = isUnlocked(progress, level.number);
      const record = progress.levels[level.id];
      const button = el('button', 'level-card');
      button.type = 'button';
      if (!open) button.classList.add('is-locked');
      if (level.boss) button.classList.add('is-boss');
      if (upNext === level.number) button.classList.add('is-next');
      button.disabled = !open;
      const index = el('span', 'level-index', String(level.number).padStart(2, '0'));
      const copy = el('span', 'level-copy');
      copy.append(el('span', 'level-title', level.title));
      const sub = el('span', 'level-sub');
      if (!open) sub.textContent = 'Clear the previous level';
      else if (level.boss) sub.textContent = 'Boss';
      else sub.textContent = level.summary;
      copy.append(sub);
      button.append(index, copy);
      if (open) button.append(starRow(record?.bestStars ?? 0));
      else button.append(el('span', 'lock', 'Locked'));
      button.addEventListener('click', () => {
        if (open) ctx.go({ name: 'play', level: level.number });
      });
      list.append(button);
    }
    panel.append(head, list);
    worlds.append(panel);
  }
  screen.append(worlds);
  root.append(screen);
  return () => undefined;
}
