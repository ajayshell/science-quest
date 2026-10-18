export type ZoneDef = {
  id: string;
  label: string;
  sub: string;
  color: string;
};

export type SortItemDef = {
  id: string;
  label: string;
  sub: string;
  zoneId: string;
  hint: string;
  wrong: string;
  success: string;
};

export type SortRoundDef = {
  instruction: string;
  zones: ZoneDef[];
  items: SortItemDef[];
};

export type ChoiceDef = {
  id: string;
  prompt: string;
  figure?: string;
  figureKind?: 'formula' | 'symbol' | 'text';
  choices: { id: string; label: string }[];
  correctId: string;
  hint: string;
  wrong: string;
  success: string;
};

export type AtomChallengeDef = {
  symbol: string;
  massNumber: number;
  hint: string;
};

export type HuntSceneId = 'city' | 'body' | 'kitchen';

export type HuntPromptDef = {
  id: string;
  scene: HuntSceneId;
  prompt: string;
  targetId: string;
  hint: string;
  wrong: string;
  success: string;
};

export type MoleculeDef = {
  id: string;
  name: string;
  formula: string;
  slots: { id: string; element: string; x: number; y: number }[];
  bonds: [string, string][];
  doubleBonds?: [string, string][];
  ionic?: boolean;
  bank: string[];
  hint: string;
  success: string;
};

export type FormulaPromptDef = {
  id: string;
  formula: string;
  element: string;
  elementName: string;
  choices: number[];
  hint: string;
  wrong: string;
  success: string;
};

type LevelBase = {
  id: string;
  number: number;
  world: 1 | 2 | 3;
  title: string;
  summary: string;
  how: string;
  parSeconds: number;
  cardIds: string[];
  speedMs: number;
  boss?: boolean;
};

export type LevelDef = LevelBase &
  (
    | { kind: 'sort'; rounds: SortRoundDef[] }
    | { kind: 'atom'; challenges: AtomChallengeDef[] }
    | { kind: 'choice'; questions: ChoiceDef[] }
    | { kind: 'table'; blanks: string[] }
    | { kind: 'hunt'; prompts: HuntPromptDef[] }
    | { kind: 'molecule'; molecules: MoleculeDef[] }
    | { kind: 'formula'; prompts: FormulaPromptDef[] }
    | { kind: 'rush'; seconds: number; questions: ChoiceDef[] }
  );
