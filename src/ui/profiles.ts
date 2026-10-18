import { getSubject } from '../subjects/registry.ts';
import { AVATARS } from '../store/types.ts';
import type { AppCtx } from './types.ts';
import { download, el, toast } from './dom.ts';
import { avatarSvg } from './icons.ts';
import { playerLabel } from './nav.ts';

export function renderProfiles(root: HTMLElement, ctx: AppCtx): () => void {
  const subject = getSubject(ctx.subjectId);
  if (subject.status !== 'playable') {
    ctx.home();
    return () => undefined;
  }
  const screen = el('section', 'profiles');
  const hero = el('div', 'hero');
  hero.append(el('p', 'eyebrow', subject.title));
  hero.append(el('h1', 'display', "Who's playing?"));
  hero.append(
    el('p', 'lede', `Choose a player for ${subject.title}. The name and avatar can be changed. Points and cards stay with that player.`),
  );
  screen.append(hero);

  const grid = el('div', 'profile-grid');
  for (const profile of ctx.save.profiles) {
    const card = el('article', 'profile-card');
    if (profile.id === ctx.save.activeProfileId) card.classList.add('is-active');
    const face = el('div', 'profile-face');
    face.innerHTML = avatarSvg(profile.avatar);
    const role = el('p', 'profile-role', playerLabel(profile));
    const nameLabel = el('label', 'fine', 'Name');
    nameLabel.htmlFor = `name-${profile.id}`;
    const name = el('input', 'name-input') as HTMLInputElement;
    name.id = `name-${profile.id}`;
    name.value = profile.name;
    name.maxLength = 20;
    name.setAttribute('aria-label', `${playerLabel(profile)} name`);
    name.addEventListener('change', () => {
      profile.name = name.value.trim().slice(0, 20) || 'Player';
      name.value = profile.name;
      ctx.persist();
    });
    const grade = el('p', 'grade', profile.gradeLabel);
    const picker = el('div', 'avatar-picker');
    for (const id of AVATARS) {
      const button = el('button', 'avatar-btn');
      button.type = 'button';
      button.innerHTML = avatarSvg(id);
      button.setAttribute('aria-label', `${id} avatar`);
      if (id === profile.avatar) button.classList.add('is-on');
      button.addEventListener('click', () => {
        profile.avatar = id;
        ctx.persist();
        ctx.go({ name: 'profiles' });
      });
      picker.append(button);
    }
    const play = el('button', 'primary', `Choose ${playerLabel(profile)}`);
    play.type = 'button';
    play.addEventListener('click', () => {
      ctx.save.activeProfileId = profile.id;
      ctx.save.welcomed = true;
      ctx.persist();
      ctx.choosePlayer();
    });
    card.append(face, role, nameLabel, name, grade, picker, play);
    grid.append(card);
  }
  screen.append(grid);

  const tools = el('div', 'tool-row');
  const exportBtn = el('button', 'ghost', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => {
    download('science-quest-progress.json', ctx.exportJson());
    toast('Saved a JSON backup of every profile.');
  });
  const importBtn = el('button', 'ghost', 'Import progress');
  importBtn.type = 'button';
  const file = el('input') as HTMLInputElement;
  file.type = 'file';
  file.accept = 'application/json';
  file.hidden = true;
  file.addEventListener('change', () => {
    const picked = file.files?.[0];
    if (!picked) return;
    void picked.text().then((text) => {
      try {
        ctx.importJson(text);
        toast('Progress imported on this device.');
        ctx.go({ name: 'profiles' });
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Could not import that file.', true);
      }
      file.value = '';
    });
  });
  importBtn.addEventListener('click', () => file.click());
  tools.append(exportBtn, importBtn, file);
  screen.append(tools);
  screen.append(el('p', 'fine', 'Progress stays in this browser. Export a backup before you clear site data.'));
  root.append(screen);
  return () => undefined;
}
