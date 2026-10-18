import type { Profile, ProfileProgress, SaveData } from '../store/types.ts';

export type Route =
  | { name: 'profiles' }
  | { name: 'hub' }
  | { name: 'play'; level: number }
  | { name: 'cards' }
  | { name: 'ranks' }
  | { name: 'scoring' };

export type AppCtx = {
  readonly save: SaveData;
  persist: () => void;
  go: (route: Route) => void;
  progress: () => ProfileProgress;
  profile: () => Profile;
  replaceSave: (data: SaveData) => void;
  exportJson: () => string;
  importJson: (json: string) => void;
};
