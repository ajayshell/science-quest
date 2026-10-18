export type Rect = { x: number; y: number; w: number; h: number };

export const FONT = 'Outfit, "Segoe UI", sans-serif';

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function hit(rect: Rect, x: number, y: number, pad = 0): boolean {
  return x >= rect.x - pad && y >= rect.y - pad && x <= rect.x + rect.w + pad && y <= rect.y + rect.h + pad;
}

export function drawNeonPanel(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  color: string,
  hot: boolean,
): void {
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
  ctx.fillStyle = hot ? 'rgba(94, 242, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)';
  ctx.fill();
  ctx.lineWidth = hot ? 2 : 1.5;
  ctx.setLineDash([7, 6]);
  ctx.strokeStyle = hot ? color : 'rgba(168, 179, 212, 0.45)';
  ctx.shadowColor = color;
  ctx.shadowBlur = hot ? 16 : 0;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
}

export function drawNeonChip(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  label: string,
  sub: string | undefined,
  color: string,
  active: boolean,
): void {
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, Math.min(16, rect.h / 2));
  ctx.fillStyle = 'rgba(7, 10, 20, 0.94)';
  ctx.fill();
  ctx.lineWidth = active ? 2.5 : 1.5;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = active ? 18 : 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f4f7ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const big = rect.h < 42 ? 13 : 16;
  ctx.font = `700 ${big}px ${FONT}`;
  const labelY = sub ? rect.y + rect.h * 0.38 : rect.y + rect.h / 2;
  ctx.fillText(label, rect.x + rect.w / 2, labelY, Math.max(8, rect.w - 14));
  if (sub) {
    ctx.font = `500 11px ${FONT}`;
    ctx.fillStyle = 'rgba(244, 247, 255, 0.68)';
    ctx.fillText(sub, rect.x + rect.w / 2, rect.y + rect.h * 0.72, Math.max(8, rect.w - 14));
  }
}

export function fitCanvas(canvas: HTMLCanvasElement, cssW: number, cssH: number): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
