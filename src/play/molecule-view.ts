import { bySymbol, elementColor } from '../data/elements.ts';
import type { MoleculeDef } from '../engine/level-def.ts';
import { formatGain } from '../scoring.ts';
import { DragBoard, type Chip, type Zone } from './board.ts';
import { FONT, type Rect } from './draw.ts';
import { later, type PlayHooks } from './types.ts';

export function mountMolecule(host: HTMLElement, molecules: MoleculeDef[], hooks: PlayHooks): () => void {
  let index = 0;
  let chips: Chip[] = [];
  let stop: (() => void) | null = null;
  const misses: Record<string, number> = {};
  let revealed = false;
  let slotRects: Record<string, Rect> = {};
  let playH = 300;

  function molecule(): MoleculeDef {
    return molecules[index] ?? molecules[0]!;
  }

  function zonesOf(current: MoleculeDef): Zone[] {
    return current.slots.map((slot) => ({
      id: slot.id,
      label: slot.element,
      color: elementColor(slot.element),
    }));
  }

  function makeChips(current: MoleculeDef): Chip[] {
    return current.bank.map((element, chipIndex) => ({
      id: `${current.id}-${chipIndex}`,
      label: element,
      sub: bySymbol.get(element)?.name ?? element,
      color: elementColor(element),
      meta: element,
    }));
  }

  function layout(width: number, _height: number, _zones: Zone[], live: Chip[]) {
    const current = molecule();
    playH = Math.min(340, Math.max(230, width * 0.72));
    const slot = Math.max(54, Math.min(76, width * 0.16));
    slotRects = {};
    const zoneRects: Record<string, Rect> = {};
    for (const item of current.slots) {
      const rect = {
        x: item.x * width - slot / 2,
        y: item.y * playH - slot / 2,
        w: slot,
        h: slot,
      };
      slotRects[item.id] = rect;
      zoneRects[item.id] = rect;
    }
    const free = live.filter((chip) => !chip.locked);
    const cols = Math.max(2, Math.min(free.length || 1, Math.floor((width - 16) / 84) || 2));
    const gap = 8;
    const tokenW = (width - 16 - gap * (cols - 1)) / cols;
    const trayTop = playH + 8;
    const chipRects: Record<string, Rect> = {};
    free.forEach((chip, chipIndex) => {
      chipRects[chip.id] = {
        x: 8 + (chipIndex % cols) * (tokenW + gap),
        y: trayTop + Math.floor(chipIndex / cols) * 62,
        w: tokenW,
        h: 54,
      };
    });
    for (const chip of live) {
      if (chip.locked && chip.zoneId && zoneRects[chip.zoneId]) {
        const rect = zoneRects[chip.zoneId]!;
        chipRects[chip.id] = { x: rect.x + 6, y: rect.y + 6, w: rect.w - 12, h: rect.h - 12 };
      }
    }
    return { zones: zoneRects, chips: chipRects };
  }

  function height(width: number): number {
    const area = Math.min(340, Math.max(230, width * 0.72));
    const free = Math.max(1, chips.filter((chip) => !chip.locked).length);
    const cols = Math.max(2, Math.min(free, Math.floor((width - 16) / 84) || 2));
    return area + 8 + Math.ceil(free / cols) * 62 + 12;
  }

  function drawBonds(ctx: CanvasRenderingContext2D): void {
    const current = molecule();
    const center = (id: string): { x: number; y: number } | null => {
      const rect = slotRects[id];
      if (!rect) return null;
      return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
    };
    const line = (a: string, b: string, gap: number, dashed: boolean): void => {
      const p = center(a);
      const q = center(b);
      if (!p || !q) return;
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (-dy / len) * gap;
      const oy = (dx / len) * gap;
      ctx.beginPath();
      ctx.moveTo(p.x + ox, p.y + oy);
      ctx.lineTo(q.x + ox, q.y + oy);
      ctx.strokeStyle = dashed ? 'rgba(169, 150, 255, 0.9)' : 'rgba(94, 242, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash(dashed ? [5, 5] : []);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    };
    for (const [a, b] of current.bonds) line(a, b, 0, Boolean(current.ionic));
    for (const [a, b] of current.doubleBonds ?? []) {
      line(a, b, -3, false);
      line(a, b, 3, false);
    }
    ctx.fillStyle = 'rgba(244,247,255,0.72)';
    ctx.font = `700 18px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(current.name, 14, 12);
    for (const slot of current.slots) {
      const occupied = chips.some((chip) => chip.locked && chip.zoneId === slot.id);
      const rect = slotRects[slot.id];
      if (!rect || occupied) continue;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 200, 87, 0.75)';
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      const show = revealed || (misses[slot.id] ?? 0) >= 2;
      if (show) {
        ctx.fillStyle = 'rgba(255, 200, 87, 0.8)';
        ctx.font = `700 ${Math.max(16, rect.w * 0.28)}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(slot.element, rect.x + rect.w / 2, rect.y + rect.h / 2);
      }
    }
  }

  function arm(current: MoleculeDef): void {
    revealed = false;
    hooks.setInstruction(`Build ${current.name}. Formula ${current.formula}.`);
    hooks.setProgress(index, molecules.length);
    hooks.setFeedback('idle', 'Drag an atom into a slot, or tap the atom and then the slot.');
    hooks.setHintReady(true);
    hooks.registerHint(() => {
      revealed = true;
      hooks.session.addHint();
      hooks.setHintReady(false);
      hooks.setFeedback('hint', current.hint);
      hooks.onHud();
      hooks.registerHint(null);
    });
  }

  const board = new DragBoard(host, {
    height,
    layout,
    drawBackdrop: (ctx) => drawBonds(ctx),
    drawZone: () => undefined,
    onDrop: (chipId, zoneId) => {
      const current = molecule();
      const chip = chips.find((item) => item.id === chipId);
      const slot = current.slots.find((item) => item.id === zoneId);
      if (!chip || chip.locked || !slot) return { accept: false };
      if (chips.some((item) => item.locked && item.zoneId === slot.id)) return { accept: false };
      const scope = `${current.id}:${slot.id}`;
      if (chip.meta !== slot.element) {
        misses[slot.id] = (misses[slot.id] ?? 0) + 1;
        if (!hooks.session.wasAttempted(scope)) {
          hooks.session.answer(scope, false, hooks.speedMs);
          hooks.onHud();
        }
        const needed = bySymbol.get(slot.element)?.name ?? slot.element;
        const got = bySymbol.get(chip.meta ?? '')?.name ?? chip.label;
        hooks.setFeedback('bad', `That slot needs ${needed}, not ${got}. The formula is ${current.formula}.`);
        return { accept: false };
      }
      chip.locked = true;
      chip.zoneId = slot.id;
      const tick = hooks.session.answer(scope, true, hooks.speedMs);
      hooks.float(formatGain(tick), true);
      hooks.onHud();
      const done = current.slots.every((item) => chips.some((entry) => entry.locked && entry.zoneId === item.id));
      if (done) {
        hooks.setFeedback('ok', current.success);
        hooks.setProgress(index + 1, molecules.length);
        hooks.registerHint(null);
        stop?.();
        stop = later(900, () => {
          index += 1;
          if (index >= molecules.length) hooks.onComplete();
          else {
            chips = makeChips(molecule());
            arm(molecule());
            board.set(zonesOf(molecule()), chips);
          }
        });
      } else {
        hooks.setFeedback('ok', `${bySymbol.get(slot.element)?.name ?? slot.element} locked in.`);
      }
      return { accept: true };
    },
  });

  chips = makeChips(molecule());
  arm(molecule());
  board.set(zonesOf(molecule()), chips);

  return () => {
    stop?.();
    board.destroy();
    hooks.registerHint(null);
  };
}
