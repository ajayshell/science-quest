import { isUnlocked, isWorldUnlocked, nextOpenLevel, totalStars } from '../game/unlock.ts';
import { getSubject, levelsInWorld } from '../subjects/registry.ts';
import type { AppCtx } from './types.ts';
import { el, starRow } from './dom.ts';
import { avatarSvg } from './icons.ts';

export function renderHub(root: HTMLElement, ctx: AppCtx): () => void {
  const subject = getSubject(ctx.subjectId);
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
  const starTotal = subject.levels.length * 3;
  stats.append(el('span', 'stat', `${progress.points.toLocaleString()} pts`));
  stats.append(el('span', 'stat', `${totalStars(progress)} / ${starTotal} stars`));
  const nav = el('nav', 'hub-nav');
  const links: [string, 'subjects' | 'cards' | 'ranks' | 'scoring'][] = [['Subjects', 'subjects']];
  if (subject.album) links.push(['Cards', 'cards']);
  links.push(['Ranks', 'ranks'], ['Scoring', 'scoring']);
  for (const [label, route] of links) {
    const button = el('button', 'ghost', label);
    button.type = 'button';
    button.addEventListener('click', () => ctx.go({ name: route }));
    nav.append(button);
  }
  top.append(who, stats, nav);
  screen.append(top);
  screen.append(el('p', 'eyebrow', subject.title));

  if (subject.status !== 'playable') {
    const wait = el('article', 'subject-tile is-soon');
    wait.style.setProperty('--accent', subject.accent);
    wait.append(el('h1', 'display', subject.title));
    wait.append(el('p', 'lede', `${subject.blurb} This subject is coming soon.`));
    const back = el('button', 'primary', 'All subjects');
    back.type = 'button';
    back.addEventListener('click', () => ctx.go({ name: 'subjects' }));
    wait.append(back);
    screen.append(wait);
    root.append(screen);
    return () => undefined;
  }

  if (profile.role === 'parent') {
    screen.append(el('p', 'banner', 'Parent profile: every level, world, and boss is open.'));
  }

  const upNext = nextOpenLevel(progress, subject.levels, profile.role);
  if (upNext === null && subject.levels.length > 0) {
    screen.append(el('p', 'banner', `${subject.title} is cleared. More worlds are still in the lab.`));
  }

  const worlds = el('div', 'worlds');
  for (const world of subject.worlds) {
    const panel = el('section', 'world');
    panel.style.setProperty('--world', world.color);
    const head = el('div', 'world-head');
    head.append(el('p', 'eyebrow', world.kicker));
    head.append(el('h2', '', world.title));
    head.append(el('p', '', world.blurb));
    const worldOpen = isWorldUnlocked(progress, world.id, subject.levels, profile.role);
    if (!worldOpen) head.append(el('p', 'lock', 'Locked until the earlier world is cleared'));
    const list = el('div', 'level-list');
    for (const level of levelsInWorld(subject, world.id)) {
      const open = isUnlocked(progress, level.number, subject.levels, profile.role);
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
