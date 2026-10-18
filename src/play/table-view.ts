import { bySymbol, elementColor } from '../data/elements.ts';
import { shuffle } from '../game/shuffle.ts';
import { formatGain } from '../scoring.ts';
import { DragBoard, type Chip, type Zone } from './board.ts';
import { FONT, roundRect, type Rect } from './draw.ts';
import { TABLE_COLUMNS, TABLE_ROWS } from './table-map.ts';
import { later, type PlayHooks } from './types.ts';

type Cell = { symbol: string | null; rect: Rect; blank: boolean; z: number | null };

export function mountTable(host: HTMLElement, blanks: string[], hooks: PlayHooks): () => void {
  const blankSet = new Set(blanks);
  let cells: Cell[] = [];
  const chips: Chip[] = shuffle(blanks).map((symbol) => {
    const element = bySymbol.get(symbol);
    return {
      id: symbol,
      label: symbol,
      sub: element ? String(element.z) : '',
      color: elementColor(symbol),
      meta: symbol,
    };
  });
  const zones: Zone[] = blanks.map((symbol) => ({
    id: symbol,
    label: symbol,
    color: elementColor(symbol),
  }));

  function layout(width: number, _height: number, _zones: Zone[], live: Chip[]) {
    const margin = 4;
    const cell = Math.min(72, (width - margin * 2) / 8);
    const gridW = cell * 8;
    const x0 = (width - gridW) / 2;
    const y0 = 28;
    cells = [];
    const zoneRects: Record<string, Rect> = {};
    TABLE_ROWS.forEach((row, r) => {
      row.forEach((symbol, c) => {
        const rect = { x: x0 + c * cell + 2, y: y0 + r * cell + 2, w: cell - 4, h: cell - 4 };
        const element = symbol ? bySymbol.get(symbol) : undefined;
        cells.push({
          symbol,
          rect,
          blank: Boolean(symbol && blankSet.has(symbol)),
          z: element?.z ?? null,
        });
        if (symbol && blankSet.has(symbol)) zoneRects[symbol] = rect;
      });
    });
    const trayTop = y0 + 4 * cell + 16;
    const free = live.filter((chip) => !chip.locked);
    const cols = Math.max(2, Math.min(free.length || 1, Math.floor((width - 16) / 72) || 2));
    const gap = 8;
    const tokenW = (width - 16 - gap * (cols - 1)) / cols;
    const chipRects: Record<string, Rect> = {};
    free.forEach((chip, index) => {
      chipRects[chip.id] = {
        x: 8 + (index % cols) * (tokenW + gap),
        y: trayTop + Math.floor(index / cols) * 64,
        w: tokenW,
        h: 56,
      };
    });
    for (const chip of live) {
      if (chip.locked && chip.zoneId && zoneRects[chip.zoneId]) {
        const rect = zoneRects[chip.zoneId]!;
        chipRects[chip.id] = { x: rect.x + 3, y: rect.y + 3, w: rect.w - 6, h: rect.h - 6 };
      }
    }
    return { zones: zoneRects, chips: chipRects };
  }

  function height(width: number): number {
    const cell = Math.min(72, (width - 8) / 8);
    const free = Math.max(1, chips.filter((chip) => !chip.locked).length);
    const cols = Math.max(2, Math.min(free, Math.floor((width - 16) / 72) || 2));
    const rows = Math.ceil(free / cols);
    return 28 + 4 * cell + 16 + rows * 64 + 12;
  }

  const placed = (): number => chips.filter((chip) => chip.locked).length;
  let stop: (() => void) | null = null;

  function armHint(): void {
    const next = chips.find((chip) => !chip.locked);
    hooks.setHintReady(Boolean(next));
    hooks.registerHint(() => {
      const chip = chips.find((item) => !item.locked);
      const element = chip ? bySymbol.get(chip.id) : undefined;
      if (!element) return;
      hooks.session.addHint();
      hooks.setHintReady(false);
      hooks.setFeedback(
        'hint',
        `${element.name} (${element.symbol}) is atomic number ${element.z}. Period ${element.period}, group ${element.group}.`,
      );
      hooks.onHud();
      hooks.registerHint(null);
    });
  }

  const board = new DragBoard(host, {
    height,
    layout,
    drawBackdrop: (ctx, width) => {
      ctx.fillStyle = 'rgba(168, 179, 212, 0.75)';
      ctx.font = `600 11px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cell = Math.min(72, (width - 8) / 8);
      const x0 = (width - cell * 8) / 2;
      TABLE_COLUMNS.forEach((group, index) => {
        ctx.fillText(String(group), x0 + index * cell + cell / 2, 14);
      });
      for (const item of cells) {
        if (!item.symbol) continue;
        roundRect(ctx, item.rect.x, item.rect.y, item.rect.w, item.rect.h, 8);
        const filled = item.blank && chips.some((chip) => chip.locked && chip.id === item.symbol);
        ctx.fillStyle = filled ? 'rgba(255,255,255,0.02)' : 'rgba(94, 242, 255, 0.04)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = item.blank ? 'rgba(255, 200, 87, 0.7)' : 'rgba(94, 242, 255, 0.28)';
        ctx.stroke();
        if (!item.blank && item.symbol) {
          const element = bySymbol.get(item.symbol);
          ctx.fillStyle = element ? elementColor(item.symbol) : '#f4f7ff';
          ctx.font = `700 ${Math.max(12, item.rect.h * 0.34)}px ${FONT}`;
          ctx.fillText(item.symbol, item.rect.x + item.rect.w / 2, item.rect.y + item.rect.h * 0.42);
          ctx.fillStyle = 'rgba(244,247,255,0.6)';
          ctx.font = `500 ${Math.max(9, item.rect.h * 0.2)}px ${FONT}`;
          ctx.fillText(String(element?.z ?? ''), item.rect.x + item.rect.w / 2, item.rect.y + item.rect.h * 0.74);
        }
      }
    },
    drawZone: (ctx, _zone, rect, hot) => {
      if (!hot) return;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
      ctx.strokeStyle = '#ffc857';
      ctx.shadowColor = '#ffc857';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    onDrop: (chipId, zoneId) => {
      const chip = chips.find((item) => item.id === chipId);
      if (!chip || chip.locked) return { accept: false };
      if (!zoneId) return { accept: false };
      if (zoneId !== chip.id) {
        const element = bySymbol.get(chip.id);
        if (!hooks.session.wasAttempted(chip.id)) {
          hooks.session.answer(chip.id, false, hooks.speedMs);
          hooks.onHud();
        }
        hooks.setFeedback(
          'bad',
          element
            ? `${element.name} does not go in that gap. Count across from the filled neighbors.`
            : 'That gap is a different element.',
        );
        return { accept: false };
      }
      chip.locked = true;
      chip.zoneId = zoneId;
      const tick = hooks.session.answer(chip.id, true, hooks.speedMs);
      const element = bySymbol.get(chip.id);
      hooks.float(formatGain(tick), true);
      hooks.setFeedback(
        'ok',
        element ? `${element.name} sits in period ${element.period}, group ${element.group}.` : 'Placed.',
      );
      hooks.setProgress(placed(), blanks.length);
      hooks.onHud();
      if (chips.every((item) => item.locked)) {
        hooks.registerHint(null);
        stop = later(600, () => hooks.onComplete());
      } else {
        armHint();
      }
      return { accept: true };
    },
  });

  hooks.setInstruction('Fill each glowing gap. Chips show the symbol and the atomic number.');
  hooks.setFeedback('idle', 'Drag a chip into its gap, or tap the chip and then the gap. Group numbers are along the top.');
  hooks.setProgress(0, blanks.length);
  armHint();
  board.set(zones, chips);

  return () => {
    stop?.();
    board.destroy();
    hooks.registerHint(null);
  };
}
