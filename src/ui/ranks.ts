import { LEVELS } from '../data/levels/index.ts';
import { totalStars } from '../game/unlock.ts';
import type { AppCtx } from './types.ts';
import { el } from './dom.ts';
import { avatarSvg } from './icons.ts';
import { back } from './album.ts';

export function renderRanks(root: HTMLElement, ctx: AppCtx): () => void {
  const screen = el('section', 'ranks');
  screen.append(back(ctx));
  screen.append(el('p', 'eyebrow', 'Family'));
  screen.append(el('h1', 'display', 'Leaderboard'));
  screen.append(el('p', 'lede', 'Points on this device. A new personal best adds the difference. Hints spend points even on a replay.'));
  const list = el('ol', 'rank-list');
  const rows = ctx.save.profiles
    .map((profile) => ({ profile, progress: ctx.save.progress[profile.id]! }))
    .sort(
      (a, b) =>
        b.progress.points - a.progress.points ||
        totalStars(b.progress) - totalStars(a.progress) ||
        a.profile.name.localeCompare(b.profile.name),
    );
  rows.forEach((row, index) => {
    const item = el('li', 'rank');
    if (row.profile.id === ctx.save.activeProfileId) item.classList.add('is-you');
    const place = el('span', 'place', String(index + 1));
    const face = el('span', 'rank-face');
    face.innerHTML = avatarSvg(row.profile.avatar);
    const copy = el('span', 'rank-copy');
    copy.append(el('strong', '', row.profile.name));
    copy.append(
      el(
        'span',
        '',
        `${totalStars(row.progress)} / ${LEVELS.length * 3} stars · ${row.progress.cards.length} cards · best streak ${row.progress.bestCombo}`,
      ),
    );
    const points = el('span', 'rank-points', row.progress.points.toLocaleString());
    item.append(place, face, copy, points);
    list.append(item);
  });
  screen.append(list);
  root.append(screen);
  return () => undefined;
}
