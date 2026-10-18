/** Where a fact was checked. `note` records a caveat that the student text does not need to carry. */
export type Citation = {
  source: string;
  note?: string;
};

export type ZoneDef = {
  id: string;
  label: string;
  sub: string;
  color: string;
};

export type SortItemDef = Citation & {
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

export type ChoiceDef = Citation & {
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

export type AtomChallengeDef = Citation & {
  symbol: string;
  massNumber: number;
  hint: string;
};

export type HuntSceneId = 'city' | 'body' | 'kitchen';

export type HuntPromptDef = Citation & {
  id: string;
  scene: HuntSceneId;
  prompt: string;
  targetId: string;
  hint: string;
  wrong: string;
  success: string;
};

export type MoleculeDef = Citation & {
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
  /** Optional reaction the success text teaches. Must balance. */
  equation?: string;
};

export type FormulaPromptDef = Citation & {
  id: string;
  formula: string;
  element: string;
  elementName: string;
  choices: number[];
  hint: string;
  wrong: string;
  success: string;
};

export type TableBlank = Citation & {
  symbol: string;
};

type LevelBase = {
  id: string;
  number: number;
  world: number;
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
    | { kind: 'table'; blanks: TableBlank[] }
    | { kind: 'hunt'; prompts: HuntPromptDef[] }
    | { kind: 'molecule'; molecules: MoleculeDef[] }
    | { kind: 'formula'; prompts: FormulaPromptDef[] }
    | { kind: 'rush'; seconds: number; questions: ChoiceDef[] }
  );
