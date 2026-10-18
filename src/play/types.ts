import type { LevelSession } from '../game/session.ts';

export type FeedbackKind = 'ok' | 'bad' | 'hint' | 'idle';

export type PlayHooks = {
  session: LevelSession;
  speedMs: number;
  setInstruction: (text: string) => void;
  setFeedback: (kind: FeedbackKind, text: string) => void;
  setProgress: (done: number, goal: number) => void;
  setHintReady: (ready: boolean) => void;
  onHud: () => void;
  onComplete: () => void;
  registerHint: (fn: (() => void) | null) => void;
  float: (text: string, ok: boolean) => void;
};

export function later(ms: number, fn: () => void): () => void {
  const id = window.setTimeout(fn, ms);
  return () => window.clearTimeout(id);
}
