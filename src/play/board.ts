import { drawNeonChip, drawNeonPanel, fitCanvas, hit, type Rect } from './draw.ts';

export type Chip = {
  id: string;
  label: string;
  sub?: string;
  color: string;
  locked?: boolean;
  zoneId?: string | null;
  meta?: string;
};

export type Zone = {
  id: string;
  label: string;
  sub?: string;
  color: string;
};

export type DropOutcome = { accept: boolean };

type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Anim = { x: number; y: number; tx: number; ty: number; from: number; dur: number };

type BoardHooks = {
  height: (width: number, zones: Zone[], chips: Chip[]) => number;
  layout: (
    width: number,
    height: number,
    zones: Zone[],
    chips: Chip[],
  ) => { zones: Record<string, Rect>; chips: Record<string, Rect> };
  onDrop: (chipId: string, zoneId: string | null) => DropOutcome;
  drawBackdrop?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  drawZone?: (ctx: CanvasRenderingContext2D, zone: Zone, rect: Rect, hot: boolean) => void;
};

export class DragBoard {
  private readonly canvas: HTMLCanvasElement;
  private readonly hooks: BoardHooks;
  private ctx: CanvasRenderingContext2D;
  private zones: Zone[] = [];
  private chips: Chip[] = [];
  private zoneRects: Record<string, Rect> = {};
  private chipRects: Record<string, Rect> = {};
  private drag: {
    id: string;
    dx: number;
    dy: number;
    x: number;
    y: number;
    pointer: number;
    lift: number;
    originX: number;
    originY: number;
  } | null = null;
  private selected: string | null = null;
  private anims = new Map<string, Anim>();
  private sparks: Spark[] = [];
  private hot: string | null = null;
  private raf = 0;
  private readonly ro: ResizeObserver;
  private destroyed = false;
  private cssW = 1;
  private cssH = 1;

  constructor(host: HTMLElement, hooks: BoardHooks) {
    this.hooks = hooks;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'board';
    host.append(this.canvas);
    this.ctx = fitCanvas(this.canvas, 1, 1);
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    void document.fonts?.ready.then(() => {
      if (!this.destroyed) this.draw();
    });
    this.resize();
    this.loop();
  }

  set(zones: Zone[], chips: Chip[]): void {
    this.zones = zones;
    this.chips = chips;
    this.resize();
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.canvas.remove();
  }

  private resize = (): void => {
    const width = this.canvas.parentElement?.clientWidth ?? 320;
    if (width < 20) return;
    const nextH = Math.max(280, this.hooks.height(width, this.zones, this.chips));
    const same = width === this.cssW && nextH === this.cssH && this.canvas.width > 10;
    this.cssW = width;
    this.cssH = nextH;
    if (!same) {
      this.ctx = fitCanvas(this.canvas, this.cssW, this.cssH);
      this.anims.clear();
    }
    this.relayout();
    this.draw();
  };

  private relayout(): void {
    const laid = this.hooks.layout(this.cssW, this.cssH, this.zones, this.chips);
    this.zoneRects = laid.zones;
    this.chipRects = laid.chips;
  }

  private loop = (): void => {
    if (this.destroyed) return;
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private draw(): void {
    const ctx = this.ctx;
    const now = performance.now();
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    const bg = ctx.createLinearGradient(0, 0, 0, this.cssH);
    bg.addColorStop(0, 'rgba(16, 22, 42, 0.95)');
    bg.addColorStop(1, 'rgba(7, 9, 16, 0.95)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.cssW, this.cssH);
    this.hooks.drawBackdrop?.(ctx, this.cssW, this.cssH);

    for (const zone of this.zones) {
      const rect = this.zoneRects[zone.id];
      if (!rect) continue;
      if (this.hooks.drawZone) this.hooks.drawZone(ctx, zone, rect, this.hot === zone.id);
      else {
        drawNeonPanel(ctx, rect, zone.color, this.hot === zone.id);
        ctx.fillStyle = zone.color;
        ctx.font = `700 ${rect.w < 130 ? 13 : 15}px Outfit, "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.label, rect.x + rect.w / 2, rect.y + 20, rect.w - 12);
        if (zone.sub) {
          ctx.fillStyle = 'rgba(244, 247, 255, 0.62)';
          ctx.font = '500 11px Outfit, "Segoe UI", sans-serif';
          ctx.fillText(zone.sub, rect.x + rect.w / 2, rect.y + 38, rect.w - 12);
        }
      }
    }

    for (const chip of this.chips) {
      const base = this.chipRects[chip.id];
      if (!base) continue;
      const rect = this.placed(chip.id, base, now);
      const dragging = this.drag?.id === chip.id || this.selected === chip.id;
      drawNeonChip(ctx, rect, chip.label, chip.sub, chip.color, dragging || Boolean(chip.locked));
    }

    this.sparks = this.sparks.filter((spark) => spark.life > 0);
    for (const spark of this.sparks) {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.life -= 0.02;
      ctx.globalAlpha = Math.max(0, spark.life);
      ctx.fillStyle = spark.color;
      ctx.shadowColor = spark.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(spark.x, spark.y, 3, 3);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  private placed(id: string, base: Rect, now: number): Rect {
    if (this.drag?.id === id) return { ...base, x: this.drag.x, y: this.drag.y };
    const anim = this.anims.get(id);
    if (!anim) return base;
    const k = Math.min(1, (now - anim.from) / anim.dur);
    const e = k * k * (3 - 2 * k);
    if (k >= 1) this.anims.delete(id);
    return { ...base, x: anim.x + (anim.tx - anim.x) * e, y: anim.y + (anim.ty - anim.y) * e };
  }

  private local(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private onDown = (event: PointerEvent): void => {
    const point = this.local(event);
    const now = performance.now();
    for (let i = this.chips.length - 1; i >= 0; i -= 1) {
      const chip = this.chips[i]!;
      if (chip.locked) continue;
      const base = this.chipRects[chip.id];
      if (!base) continue;
      const rect = this.placed(chip.id, base, now);
      if (!hit(rect, point.x, point.y)) continue;
      this.canvas.setPointerCapture(event.pointerId);
      const lift = event.pointerType === 'touch' ? 36 : 0;
      this.selected = chip.id;
      this.drag = {
        id: chip.id,
        dx: point.x - rect.x,
        dy: point.y - rect.y,
        x: rect.x,
        y: rect.y,
        pointer: event.pointerId,
        lift,
        originX: point.x,
        originY: point.y,
      };
      event.preventDefault();
      return;
    }
    if (this.selected) {
      const zoneId = this.zoneAt(point.x, point.y);
      if (zoneId) {
        const chipId = this.selected;
        const from = this.chipRects[chipId];
        this.selected = null;
        this.finishDrop(chipId, zoneId, from?.x ?? point.x, from?.y ?? point.y);
        event.preventDefault();
      }
    }
  };

  private onMove = (event: PointerEvent): void => {
    if (!this.drag || event.pointerId !== this.drag.pointer) return;
    const point = this.local(event);
    const moved = Math.hypot(point.x - this.drag.originX, point.y - this.drag.originY) > 12;
    this.drag.x = point.x - this.drag.dx;
    this.drag.y = point.y - this.drag.dy - (moved ? this.drag.lift : 0);
    const chip = this.chips.find((item) => item.id === this.drag?.id);
    const base = chip ? this.chipRects[chip.id] : undefined;
    if (!base) return;
    const cx = this.drag.x + base.w / 2;
    const cy = this.drag.y + base.h / 2;
    this.hot = this.zoneAt(cx, cy);
  };

  private onUp = (event: PointerEvent): void => {
    if (!this.drag || event.pointerId !== this.drag.pointer) return;
    const drag = this.drag;
    this.drag = null;
    this.hot = null;
    const point = this.local(event);
    const moved = Math.hypot(point.x - drag.originX, point.y - drag.originY) > 12;
    if (!moved) return;
    this.selected = null;
    const chip = this.chips.find((item) => item.id === drag.id);
    const base = chip ? this.chipRects[chip.id] : undefined;
    if (!chip || !base) return;
    const cx = drag.x + base.w / 2;
    const cy = drag.y + base.h / 2;
    this.finishDrop(chip.id, this.zoneAt(cx, cy), drag.x, drag.y);
  };

  private finishDrop(chipId: string, zoneId: string | null, fromX: number, fromY: number): void {
    const outcome = this.hooks.onDrop(chipId, zoneId);
    this.relayout();
    const next = this.chipRects[chipId];
    const chip = this.chips.find((item) => item.id === chipId);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (next) {
      this.anims.set(chipId, {
        x: fromX,
        y: fromY,
        tx: next.x,
        ty: next.y,
        from: performance.now(),
        dur: reduce ? 1 : 180,
      });
    }
    if (outcome.accept && next && chip) this.burst(next.x + next.w / 2, next.y + next.h / 2, chip.color);
  }

  private zoneAt(x: number, y: number): string | null {
    let best: string | null = null;
    let bestDist = Infinity;
    for (const zone of this.zones) {
      const rect = this.zoneRects[zone.id];
      if (!rect || !hit(rect, x, y, 10)) continue;
      const dx = x - (rect.x + rect.w / 2);
      const dy = y - (rect.y + rect.h / 2);
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        best = zone.id;
        bestDist = dist;
      }
    }
    return best;
  }

  private burst(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i += 1) {
      const angle = (Math.PI * 2 * i) / 12;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * (1.2 + Math.random()),
        vy: Math.sin(angle) * (1.2 + Math.random()),
        life: 1,
        color,
      });
    }
  }
}

export function layoutBins(
  width: number,
  _height: number,
  zones: Zone[],
  chips: Chip[],
): { zones: Record<string, Rect>; chips: Record<string, Rect> } {
  const pad = 12;
  const gap = 8;
  const zoneH = 210;
  const zoneW = (width - pad * 2 - gap * (zones.length - 1)) / Math.max(1, zones.length);
  const zoneRects: Record<string, Rect> = {};
  zones.forEach((zone, index) => {
    zoneRects[zone.id] = { x: pad + index * (zoneW + gap), y: pad, w: zoneW, h: zoneH };
  });
  const trayTop = pad + zoneH + 12;
  const free = chips.filter((chip) => !chip.locked);
  const cols = Math.max(2, Math.min(free.length || 1, Math.floor((width - pad * 2 + gap) / 112) || 2));
  const tokenW = (width - pad * 2 - gap * (cols - 1)) / cols;
  const tokenH = 58;
  const chipRects: Record<string, Rect> = {};
  free.forEach((chip, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    chipRects[chip.id] = {
      x: pad + col * (tokenW + gap),
      y: trayTop + row * (tokenH + gap),
      w: tokenW,
      h: tokenH,
    };
  });
  for (const zone of zones) {
    const rect = zoneRects[zone.id];
    if (!rect) continue;
    const inside = chips.filter((chip) => chip.locked && chip.zoneId === zone.id);
    inside.forEach((chip, index) => {
      chipRects[chip.id] = {
        x: rect.x + 8,
        y: rect.y + 50 + index * 36,
        w: rect.w - 16,
        h: 32,
      };
    });
  }
  return { zones: zoneRects, chips: chipRects };
}

export function binsHeight(width: number, _zones: Zone[], chips: Chip[]): number {
  const pad = 12;
  const gap = 8;
  const free = chips.filter((chip) => !chip.locked).length;
  const cols = Math.max(2, Math.min(Math.max(free, 1), Math.floor((width - pad * 2 + gap) / 112) || 2));
  const rows = Math.max(1, Math.ceil(free / cols));
  return pad + 210 + 12 + rows * 66 + pad;
}
