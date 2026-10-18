import type { SortItemDef, SortRoundDef } from '../engine/level-def.ts';
import { shuffle } from '../game/shuffle.ts';
import { formatGain } from '../scoring.ts';
import { DragBoard, binsHeight, layoutBins, type Chip, type Zone } from './board.ts';
import { later, type PlayHooks } from './types.ts';

export function mountSort(host: HTMLElement, rounds: SortRoundDef[], hooks: PlayHooks): () => void {
  const goal = rounds.reduce((sum, round) => sum + round.items.length, 0);
  let placed = 0;
  let roundIndex = 0;
  let items: SortItemDef[] = [];
  let chips: Chip[] = [];
  let stopLater: (() => void) | null = null;
  let board: DragBoard | null = null;

  function zonesOf(round: SortRoundDef): Zone[] {
    return round.zones.map((zone) => ({
      id: zone.id,
      label: zone.label,
      sub: zone.sub,
      color: zone.color,
    }));
  }

  function load(index: number): void {
    const round = rounds[index];
    if (!round) {
      hooks.onComplete();
      return;
    }
    items = round.items;
    chips = shuffle(round.items).map((item) => ({
      id: item.id,
      label: item.label,
      sub: item.sub,
      color: '#5ef2ff',
      locked: false,
      zoneId: null,
    }));
    hooks.setInstruction(round.instruction);
    hooks.setFeedback('idle', 'Drag a card into a bin, or tap a card and then its bin.');
    hooks.setProgress(placed, goal);
    hooks.setHintReady(true);
    hooks.registerHint(() => {
      const next = items.find((item) => !chips.find((chip) => chip.id === item.id)?.locked);
      if (!next) return;
      hooks.session.addHint();
      hooks.setHintReady(false);
      hooks.setFeedback('hint', next.hint);
      hooks.onHud();
      hooks.registerHint(null);
    });
    board?.set(zonesOf(round), chips);
  }

  board = new DragBoard(host, {
    height: binsHeight,
    layout: layoutBins,
    onDrop: (chipId, zoneId) => {
      const round = rounds[roundIndex];
      const item = items.find((entry) => entry.id === chipId);
      const chip = chips.find((entry) => entry.id === chipId);
      if (!round || !item || !chip || chip.locked) return { accept: false };
      if (!zoneId) return { accept: false };
      if (zoneId !== item.zoneId) {
        if (!hooks.session.wasAttempted(item.id)) {
          hooks.session.answer(item.id, false, hooks.speedMs);
          hooks.onHud();
        }
        hooks.setFeedback('bad', item.wrong);
        return { accept: false };
      }
      chip.locked = true;
      chip.zoneId = zoneId;
      placed += 1;
      const tick = hooks.session.answer(item.id, true, hooks.speedMs);
      hooks.float(formatGain(tick), true);
      hooks.setFeedback('ok', item.success);
      hooks.setProgress(placed, goal);
      hooks.onHud();
      if (chips.every((entry) => entry.locked)) {
        stopLater?.();
        stopLater = later(700, () => {
          roundIndex += 1;
          if (roundIndex >= rounds.length) hooks.onComplete();
          else load(roundIndex);
        });
      } else {
        hooks.setHintReady(true);
        hooks.registerHint(() => {
          const next = items.find((entry) => !chips.find((c) => c.id === entry.id)?.locked);
          if (!next) return;
          hooks.session.addHint();
          hooks.setHintReady(false);
          hooks.setFeedback('hint', next.hint);
          hooks.onHud();
          hooks.registerHint(null);
        });
      }
      return { accept: true };
    },
  });

  load(0);
  return () => {
    stopLater?.();
    board?.destroy();
    hooks.registerHint(null);
  };
}
