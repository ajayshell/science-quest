import type { HuntSceneId } from '../data/levels/types.ts';
import { FONT, roundRect } from './draw.ts';

export type SceneObject = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type SceneDef = {
  title: string;
  objects: SceneObject[];
};

export const SCENES: Record<HuntSceneId, SceneDef> = {
  city: {
    title: 'Night street',
    objects: [
      { id: 'balloon', label: 'Balloon', x: 0.06, y: 0.08, w: 0.24, h: 0.4 },
      { id: 'sign', label: 'Sign', x: 0.58, y: 0.1, w: 0.34, h: 0.26 },
      { id: 'can', label: 'Can', x: 0.08, y: 0.58, w: 0.22, h: 0.32 },
      { id: 'wire', label: 'Wire', x: 0.64, y: 0.56, w: 0.28, h: 0.32 },
    ],
  },
  body: {
    title: 'A person',
    objects: [
      { id: 'lungs', label: 'Lungs', x: 0.32, y: 0.16, w: 0.36, h: 0.28 },
      { id: 'blood', label: 'Blood', x: 0.62, y: 0.4, w: 0.24, h: 0.26 },
      { id: 'bone', label: 'Bone', x: 0.12, y: 0.62, w: 0.34, h: 0.26 },
    ],
  },
  kitchen: {
    title: 'Kitchen counter',
    objects: [
      { id: 'salt', label: 'Shaker', x: 0.08, y: 0.28, w: 0.24, h: 0.48 },
      { id: 'pan', label: 'Pan', x: 0.38, y: 0.46, w: 0.28, h: 0.32 },
      { id: 'ring', label: 'Ring', x: 0.7, y: 0.36, w: 0.22, h: 0.34 },
    ],
  },
};

function box(obj: SceneObject, w: number, h: number): { x: number; y: number; w: number; h: number } {
  return { x: obj.x * w, y: obj.y * h, w: obj.w * w, h: obj.h * h };
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: HuntSceneId,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#10182e');
  sky.addColorStop(1, '#070910');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  if (scene === 'city') drawCity(ctx, width, height);
  if (scene === 'body') drawBody(ctx, width, height);
  if (scene === 'kitchen') drawKitchen(ctx, width, height);
}

function drawCity(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.strokeStyle = 'rgba(94, 242, 255, 0.25)';
  ctx.lineWidth = 2;
  for (const building of [
    { x: 0.3, y: 0.34, bw: 0.12, bh: 0.66 },
    { x: 0.44, y: 0.22, bw: 0.1, bh: 0.78 },
  ]) {
    ctx.strokeRect(building.x * w, building.y * h, building.bw * w, building.bh * h);
  }
  ctx.beginPath();
  ctx.moveTo(0, h * 0.86);
  ctx.lineTo(w, h * 0.86);
  ctx.strokeStyle = 'rgba(255, 78, 205, 0.45)';
  ctx.shadowColor = '#ff4ecd';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const sign = box(SCENES.city.objects[1]!, w, h);
  roundRect(ctx, sign.x + 8, sign.y + 10, sign.w - 16, sign.h - 28, 8);
  ctx.strokeStyle = '#ff4ecd';
  ctx.shadowColor = '#ff4ecd';
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.fillStyle = '#ff4ecd';
  ctx.font = `800 ${Math.max(14, sign.h * 0.28)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OPEN', sign.x + sign.w / 2, sign.y + sign.h * 0.42);
  ctx.shadowBlur = 0;

  const balloon = box(SCENES.city.objects[0]!, w, h);
  ctx.beginPath();
  ctx.ellipse(balloon.x + balloon.w / 2, balloon.y + balloon.h * 0.32, balloon.w * 0.28, balloon.h * 0.28, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffc857';
  ctx.shadowColor = '#ffc857';
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(balloon.x + balloon.w / 2, balloon.y + balloon.h * 0.6);
  ctx.lineTo(balloon.x + balloon.w / 2, balloon.y + balloon.h * 0.92);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const can = box(SCENES.city.objects[2]!, w, h);
  roundRect(ctx, can.x + can.w * 0.28, can.y + 8, can.w * 0.44, can.h - 20, 10);
  ctx.strokeStyle = '#5ef2ff';
  ctx.shadowColor = '#5ef2ff';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const wire = box(SCENES.city.objects[3]!, w, h);
  ctx.beginPath();
  ctx.strokeStyle = '#ffb15e';
  ctx.shadowColor = '#ffb15e';
  ctx.shadowBlur = 10;
  const x0 = wire.x + 10;
  const y0 = wire.y + wire.h * 0.55;
  ctx.moveTo(x0, y0);
  for (let i = 0; i < 5; i += 1) {
    const cx = x0 + i * (wire.w - 20) / 4;
    ctx.quadraticCurveTo(cx + 8, y0 - 18, cx + (wire.w - 20) / 8, y0);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawBody(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.strokeStyle = 'rgba(94, 242, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#5ef2ff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.16, w * 0.07, h * 0.08, 0, 0, Math.PI * 2);
  ctx.moveTo(w * 0.5, h * 0.24);
  ctx.lineTo(w * 0.5, h * 0.62);
  ctx.moveTo(w * 0.5, h * 0.34);
  ctx.lineTo(w * 0.28, h * 0.48);
  ctx.moveTo(w * 0.5, h * 0.34);
  ctx.lineTo(w * 0.72, h * 0.48);
  ctx.moveTo(w * 0.5, h * 0.62);
  ctx.lineTo(w * 0.38, h * 0.9);
  ctx.moveTo(w * 0.5, h * 0.62);
  ctx.lineTo(w * 0.62, h * 0.9);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const lungs = box(SCENES.body.objects[0]!, w, h);
  ctx.strokeStyle = '#7eb6ff';
  ctx.shadowColor = '#7eb6ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(lungs.x + lungs.w * 0.32, lungs.y + lungs.h * 0.55, lungs.w * 0.22, lungs.h * 0.32, 0, 0, Math.PI * 2);
  ctx.ellipse(lungs.x + lungs.w * 0.68, lungs.y + lungs.h * 0.55, lungs.w * 0.22, lungs.h * 0.32, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const blood = box(SCENES.body.objects[1]!, w, h);
  ctx.fillStyle = '#ff4ecd';
  ctx.shadowColor = '#ff4ecd';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.ellipse(blood.x + blood.w / 2, blood.y + blood.h * 0.58, blood.w * 0.22, blood.h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  const bone = box(SCENES.body.objects[2]!, w, h);
  ctx.strokeStyle = '#d7ffe7';
  ctx.fillStyle = 'rgba(215, 255, 231, 0.12)';
  ctx.shadowColor = '#d7ffe7';
  ctx.shadowBlur = 10;
  const bx = bone.x + bone.w * 0.15;
  const by = bone.y + bone.h * 0.35;
  roundRect(ctx, bx, by, bone.w * 0.7, bone.h * 0.28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(bx, by + bone.h * 0.14, bone.h * 0.16, 0, Math.PI * 2);
  ctx.arc(bx + bone.w * 0.7, by + bone.h * 0.14, bone.h * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawKitchen(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.strokeStyle = 'rgba(255, 200, 87, 0.45)';
  ctx.shadowColor = '#ffc857';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(w * 0.04, h * 0.78);
  ctx.lineTo(w * 0.96, h * 0.78);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const salt = box(SCENES.kitchen.objects[0]!, w, h);
  roundRect(ctx, salt.x + salt.w * 0.3, salt.y + salt.h * 0.2, salt.w * 0.4, salt.h * 0.62, 8);
  ctx.strokeStyle = '#5ef2ff';
  ctx.shadowColor = '#5ef2ff';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(salt.x + salt.w * 0.38, salt.y + salt.h * 0.2);
  ctx.lineTo(salt.x + salt.w * 0.5, salt.y + 4);
  ctx.lineTo(salt.x + salt.w * 0.62, salt.y + salt.h * 0.2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const pan = box(SCENES.kitchen.objects[1]!, w, h);
  ctx.strokeStyle = '#ff7a90';
  ctx.shadowColor = '#ff7a90';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(pan.x + pan.w * 0.4, pan.y + pan.h * 0.55, pan.w * 0.28, pan.h * 0.28, 0, 0, Math.PI * 2);
  ctx.moveTo(pan.x + pan.w * 0.66, pan.y + pan.h * 0.55);
  ctx.lineTo(pan.x + pan.w * 0.92, pan.y + pan.h * 0.42);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const ring = box(SCENES.kitchen.objects[2]!, w, h);
  ctx.strokeStyle = '#ffc857';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ffc857';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.ellipse(ring.x + ring.w / 2, ring.y + ring.h * 0.55, ring.w * 0.24, ring.h * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
}
