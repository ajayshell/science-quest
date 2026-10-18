import { getSubject } from '../subjects/registry.ts';
import type { AppCtx, Route } from './types.ts';
import { el } from './dom.ts';
import { avatarSvg } from './icons.ts';
import { backTarget, playerLabel } from './nav.ts';

export function renderTopBar(ctx: AppCtx, route: Route): HTMLElement {
  const profile = ctx.profile();
  const bar = el('header', 'topbar');
  bar.setAttribute('aria-label', 'Navigation');

  const home = el('button', 'topbar-btn topbar-home', 'Home');
  home.type = 'button';
  home.addEventListener('click', () => ctx.home());

  const player = el('div', 'topbar-player');
  player.innerHTML = avatarSvg(profile.avatar);
  const copy = el('span', 'topbar-copy');
  copy.append(el('strong', 'topbar-name', profile.name));
  const grade = playerLabel(profile);
  const subjectTitle = getSubject(ctx.subjectId).title;
  copy.append(el('span', 'topbar-grade', `${grade} · ${subjectTitle}`));
  player.append(copy);

  const switchPlayer = el('button', 'topbar-btn topbar-switch', 'Switch player');
  switchPlayer.type = 'button';
  switchPlayer.addEventListener('click', () => ctx.switchPlayer());

  bar.append(home, player, switchPlayer);

  const target = backTarget(route);
  if (target) {
    const back = el('button', 'topbar-btn topbar-back', 'Back');
    back.type = 'button';
    back.addEventListener('click', () => ctx.back());
    bar.append(back);
  }
  return bar;
}
