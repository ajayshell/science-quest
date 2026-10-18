import '@fontsource/outfit/latin-400.css';
import '@fontsource/outfit/latin-500.css';
import '@fontsource/outfit/latin-700.css';
import '@fontsource/outfit/latin-800.css';
import '@fontsource/syne/latin-700.css';
import '@fontsource/syne/latin-800.css';
import './styles.css';
import { LocalProgressStore } from './store/LocalProgressStore.ts';
import { emptyProgress, type SaveData } from './store/types.ts';
import { getSubject } from './subjects/registry.ts';
import { renderAlbum } from './ui/album.ts';
import { renderHelp } from './ui/help.ts';
import { renderHub } from './ui/hub.ts';
import { reduceNav, showsTopBar, type NavAction, type NavState } from './ui/nav.ts';
import { renderPlay } from './ui/play-screen.ts';
import { renderProfiles } from './ui/profiles.ts';
import { renderRanks } from './ui/ranks.ts';
import { renderSubjects } from './ui/subjects.ts';
import { renderTopBar } from './ui/topbar.ts';
import type { AppCtx, Route } from './ui/types.ts';

const store = new LocalProgressStore();
const box: { save: SaveData } = { save: store.load() };
const view = document.querySelector('#view');
if (!view) throw new Error('Missing #view');

let cleanup: (() => void) | null = null;
let nav: NavState = { route: { name: 'subjects' }, subjectId: 'chemistry' };

function dispatch(action: NavAction): void {
  nav = reduceNav(nav, action);
  render(nav.route);
}

const ctx: AppCtx = {
  get save() {
    return box.save;
  },
  get subjectId() {
    return nav.subjectId;
  },
  set subjectId(id: string) {
    nav = { ...nav, subjectId: id };
  },
  persist() {
    store.save(box.save);
  },
  go(route: Route) {
    dispatch({ type: 'go', route });
  },
  home() {
    dispatch({ type: 'home' });
  },
  openSubject(subjectId: string) {
    const playable = getSubject(subjectId).status === 'playable';
    dispatch({ type: 'open-subject', subjectId, playable });
  },
  choosePlayer() {
    dispatch({ type: 'choose-player' });
  },
  switchPlayer() {
    dispatch({ type: 'switch-player' });
  },
  back() {
    dispatch({ type: 'back' });
  },
  progress() {
    const profileId = box.save.profiles.some((profile) => profile.id === box.save.activeProfileId)
      ? box.save.activeProfileId
      : box.save.profiles[0]!.id;
    const bag = box.save.progress[profileId];
    const slice = bag?.[nav.subjectId];
    if (slice) return slice;
    const created = emptyProgress();
    if (bag) bag[nav.subjectId] = created;
    return created;
  },
  profile() {
    return (
      box.save.profiles.find((profile) => profile.id === box.save.activeProfileId) ?? box.save.profiles[0]!
    );
  },
  replaceSave(data: SaveData) {
    box.save = data;
    store.save(data);
  },
  exportJson() {
    store.save(box.save);
    return store.exportJson();
  },
  importJson(json: string) {
    box.save = store.importJson(json);
  },
};

function render(route: Route): void {
  cleanup?.();
  cleanup = null;
  view!.replaceChildren();
  const screen = document.createElement('div');
  screen.className = 'screen';
  view!.append(screen);
  if (showsTopBar(route)) screen.append(renderTopBar(ctx, route));
  if (route.name === 'profiles') cleanup = renderProfiles(screen, ctx);
  else if (route.name === 'subjects') cleanup = renderSubjects(screen, ctx);
  else if (route.name === 'hub') cleanup = renderHub(screen, ctx);
  else if (route.name === 'play') cleanup = renderPlay(screen, route.level, ctx);
  else if (route.name === 'cards') cleanup = renderAlbum(screen, ctx);
  else if (route.name === 'ranks') cleanup = renderRanks(screen, ctx);
  else cleanup = renderHelp(screen, ctx);
  window.scrollTo(0, 0);
}

const shell = document.querySelector('#app');
shell?.insertAdjacentHTML(
  'afterbegin',
  '<div class="aurora" aria-hidden="true"></div><div class="grid-fade" aria-hidden="true"></div>',
);

render(nav.route);
