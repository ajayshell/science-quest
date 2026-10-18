import { bySymbol, byZ, type ElementRecord } from '../data/elements.ts';
import type { AtomChallengeDef } from '../data/levels/types.ts';
import { formatGain } from '../scoring.ts';
import { FONT, fitCanvas, hit, roundRect, type Rect } from './draw.ts';
import { later, type PlayHooks } from './types.ts';

type Kind = 'p' | 'n' | 'e';

const COLOR: Record<Kind, string> = {
  p: '#ff4ecd',
  n: '#5ef2ff',
  e: '#ffc857',
};

const LABEL: Record<Kind, string> = {
  p: 'Proton',
  n: 'Neutron',
  e: 'Electron',
};

export function mountAtom(host: HTMLElement, challenges: AtomChallengeDef[], hooks: PlayHooks): () => void {
  let index = 0;
  let stop: (() => void) | null = null;
  const counts: Record<Kind, number> = { p: 0, n: 0, e: 0 };
  const wrap = document.createElement('div');
  wrap.className = 'atom-wrap';
  const readout = document.createElement('div');
  readout.className = 'readout';
  const canvas = document.createElement('canvas');
  canvas.className = 'board';
  const check = document.createElement('button');
  check.type = 'button';
  check.className = 'primary';
  check.textContent = 'Check atom';
  wrap.append(readout, canvas, check);
  host.append(wrap);

  let ctx = fitCanvas(canvas, 300, 420);
  let drag: { kind: Kind; x: number; y: number; pointer: number; moved: boolean } | null = null;
  let tokenRects: Record<Kind, Rect> = {
    p: { x: 0, y: 0, w: 0, h: 0 },
    n: { x: 0, y: 0, w: 0, h: 0 },
    e: { x: 0, y: 0, w: 0, h: 0 },
  };
  let minusRects: Record<Kind, Rect> = {
    p: { x: 0, y: 0, w: 0, h: 0 },
    n: { x: 0, y: 0, w: 0, h: 0 },
    e: { x: 0, y: 0, w: 0, h: 0 },
  };
  let nucleus = { x: 0, y: 0, r: 40 };
  let shellOuter = 120;

  function element(): ElementRecord {
    const challenge = challenges[index]!;
    return bySymbol.get(challenge.symbol) ?? byZ.get(1)!;
  }

  function syncReadout(): void {
    const known = byZ.get(counts.p);
    const charge = counts.p - counts.e;
    const chargeText = charge === 0 ? '0 neutral' : charge > 0 ? `+${charge}` : String(charge);
    readout.replaceChildren();
    for (const [label, value] of [
      ['Element', known ? known.name : counts.p === 0 ? '—' : 'Unknown'],
      ['Mass number', String(counts.p + counts.n)],
      ['Charge', chargeText],
    ] as const) {
      const cell = document.createElement('div');
      const k = document.createElement('span');
      k.textContent = label;
      const v = document.createElement('strong');
      v.textContent = value;
      cell.append(k, v);
      readout.append(cell);
    }
  }

  function layout(): void {
    const width = Math.max(280, wrap.clientWidth || host.clientWidth || 320);
    const height = Math.max(430, Math.min(560, Math.round(width * 0.95)));
    ctx = fitCanvas(canvas, width, height);
    const trayH = 96;
    nucleus = { x: width / 2, y: (height - trayH) * 0.48, r: Math.max(46, Math.min(width, height) * 0.11) };
    shellOuter = Math.min(width * 0.42, (height - trayH) * 0.42);
    const gap = 8;
    const tokenW = (width - 24 - gap * 2) / 3;
    (['p', 'n', 'e'] as const).forEach((kind, i) => {
      const rect = { x: 12 + i * (tokenW + gap), y: height - trayH + 8, w: tokenW, h: 72 };
      tokenRects[kind] = rect;
      minusRects[kind] = { x: rect.x + rect.w - 48, y: rect.y + 14, w: 44, h: 44 };
    });
  }

  function draw(): void {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createRadialGradient(nucleus.x, nucleus.y, 10, nucleus.x, nucleus.y, shellOuter * 1.4);
    bg.addColorStop(0, 'rgba(94, 242, 255, 0.08)');
    bg.addColorStop(1, 'rgba(7, 9, 16, 0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1.5;
    for (const [radius, alpha] of [
      [shellOuter * 0.62, 0.55],
      [shellOuter, 0.8],
    ] as const) {
      ctx.beginPath();
      ctx.arc(nucleus.x, nucleus.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(94, 242, 255, ${alpha})`;
      ctx.shadowColor = '#5ef2ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    const inner = Math.min(2, counts.e);
    const outer = Math.max(0, counts.e - 2);
    const dots: { x: number; y: number }[] = [];
    for (let i = 0; i < inner; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI;
      dots.push({
        x: nucleus.x + Math.cos(angle) * shellOuter * 0.62,
        y: nucleus.y + Math.sin(angle) * shellOuter * 0.62,
      });
    }
    for (let i = 0; i < outer; i += 1) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(8, outer);
      dots.push({
        x: nucleus.x + Math.cos(angle) * shellOuter,
        y: nucleus.y + Math.sin(angle) * shellOuter,
      });
    }
    for (const dot of dots) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.e;
      ctx.shadowColor = COLOR.e;
      ctx.shadowBlur = 12;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(nucleus.x, nucleus.y, nucleus.r, 0, Math.PI * 2);
    const core = ctx.createRadialGradient(nucleus.x, nucleus.y, 4, nucleus.x, nucleus.y, nucleus.r);
    core.addColorStop(0, '#ffd0f4');
    core.addColorStop(1, '#ff4ecd');
    ctx.fillStyle = core;
    ctx.shadowColor = '#ff4ecd';
    ctx.shadowBlur = 22;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a0b18';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 13px ${FONT}`;
    ctx.fillText(`${counts.p}p · ${counts.n}n`, nucleus.x, nucleus.y);

    ctx.fillStyle = 'rgba(244,247,255,0.55)';
    ctx.font = `500 12px ${FONT}`;
    ctx.fillText('Electrons fill the inner shell (2), then the next (8).', width / 2, nucleus.y + shellOuter + 22, width - 24);

    if (drag) {
      ctx.beginPath();
      ctx.arc(drag.x, drag.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = COLOR[drag.kind];
      ctx.shadowColor = COLOR[drag.kind];
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    (['p', 'n', 'e'] as const).forEach((kind) => {
      const rect = tokenRects[kind];
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
      ctx.fillStyle = 'rgba(7,10,20,0.92)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = COLOR[kind];
      ctx.shadowColor = COLOR[kind];
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f4f7ff';
      ctx.textAlign = 'left';
      ctx.font = `700 14px ${FONT}`;
      ctx.fillText(LABEL[kind], rect.x + 10, rect.y + 28, Math.max(24, rect.w - 58));
      ctx.fillStyle = COLOR[kind];
      ctx.font = `700 18px ${FONT}`;
      ctx.fillText(String(counts[kind]), rect.x + 12, rect.y + 52);
      const minus = minusRects[kind];
      ctx.beginPath();
      ctx.arc(minus.x + minus.w / 2, minus.y + minus.h / 2, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244,247,255,0.7)';
      ctx.stroke();
      ctx.fillStyle = '#f4f7ff';
      ctx.textAlign = 'center';
      ctx.font = `700 18px ${FONT}`;
      ctx.fillText('–', minus.x + minus.w / 2, minus.y + minus.h / 2 + 1);
    });
  }

  function local(event: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function add(kind: Kind, where: 'nucleus' | 'shell' | 'tap'): boolean {
    if (where === 'tap') {
      counts[kind] += 1;
      return true;
    }
    if ((kind === 'p' || kind === 'n') && where === 'shell') {
      hooks.setFeedback('bad', `${LABEL[kind]}s belong in the nucleus, not in the shells.`);
      return false;
    }
    if (kind === 'e' && where === 'nucleus') {
      hooks.setFeedback('bad', 'Electrons stay in the shells around the nucleus.');
      return false;
    }
    counts[kind] += 1;
    hooks.setFeedback('idle', '');
    return true;
  }

  function renderChallenge(): void {
    const challenge = challenges[index];
    if (!challenge) {
      hooks.onComplete();
      return;
    }
    counts.p = 0;
    counts.n = 0;
    counts.e = 0;
    const row = element();
    hooks.setInstruction(`Build a neutral ${row.name}-${challenge.massNumber} atom.`);
    hooks.setProgress(index, challenges.length);
    hooks.setFeedback('idle', 'Drag particles in, or tap one to add it. Minus takes one away.');
    hooks.setHintReady(true);
    hooks.registerHint(() => {
      hooks.session.addHint();
      hooks.setHintReady(false);
      hooks.setFeedback('hint', challenge.hint);
      hooks.onHud();
      hooks.registerHint(null);
    });
    syncReadout();
    layout();
    draw();
  }

  function onDown(event: PointerEvent): void {
    const point = local(event);
    for (const kind of ['p', 'n', 'e'] as const) {
      if (hit(minusRects[kind], point.x, point.y)) {
        counts[kind] = Math.max(0, counts[kind] - 1);
        syncReadout();
        draw();
        return;
      }
    }
    for (const kind of ['p', 'n', 'e'] as const) {
      if (!hit(tokenRects[kind], point.x, point.y)) continue;
      canvas.setPointerCapture(event.pointerId);
      drag = { kind, x: point.x, y: point.y - (event.pointerType === 'touch' ? 28 : 0), pointer: event.pointerId, moved: false };
      event.preventDefault();
      return;
    }
  }

  function onMove(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointer) return;
    const point = local(event);
    if (Math.hypot(point.x - drag.x, point.y - drag.y) > 8) drag.moved = true;
    drag.x = point.x;
    drag.y = point.y - 28 * (event.pointerType === 'touch' ? 1 : 0);
    draw();
  }

  function onUp(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointer) return;
    const current = drag;
    drag = null;
    const point = local(event);
    const dist = Math.hypot(point.x - nucleus.x, point.y - nucleus.y);
    if (!current.moved) add(current.kind, 'tap');
    else if (dist <= nucleus.r + 28) add(current.kind, 'nucleus');
    else if (dist <= shellOuter + 24) add(current.kind, 'shell');
    syncReadout();
    draw();
  }

  check.addEventListener('click', () => {
    const challenge = challenges[index];
    if (!challenge) return;
    const row = element();
    const neutrons = challenge.massNumber - row.z;
    const ok = counts.p === row.z && counts.n === neutrons && counts.e === row.z;
    const scope = `atom-${challenge.symbol}`;
    if (!ok) {
      if (!hooks.session.wasAttempted(scope)) hooks.session.answer(scope, false, hooks.speedMs);
      const notes: string[] = [];
      if (counts.p !== row.z) {
        notes.push(`${row.name} has atomic number ${row.z}, so it needs ${row.z} protons. You have ${counts.p}.`);
      }
      if (counts.n !== neutrons) {
        notes.push(
          `Mass number ${challenge.massNumber} means protons + neutrons = ${challenge.massNumber}. Neutrons should be ${neutrons}.`,
        );
      }
      if (counts.e !== row.z) {
        notes.push(`A neutral atom has charge 0, so electrons must equal protons (${row.z}).`);
      }
      hooks.setFeedback('bad', notes.join(' '));
      hooks.onHud();
      return;
    }
    const tick = hooks.session.answer(scope, true, hooks.speedMs);
    hooks.float(formatGain(tick), true);
    hooks.setFeedback('ok', `${row.name}-${challenge.massNumber} is built. Charge 0, mass number ${challenge.massNumber}.`);
    hooks.onHud();
    hooks.setProgress(index + 1, challenges.length);
    check.disabled = true;
    stop?.();
    stop = later(800, () => {
      check.disabled = false;
      index += 1;
      renderChallenge();
    });
  });

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  const ro = new ResizeObserver(() => {
    layout();
    draw();
  });
  ro.observe(wrap);
  renderChallenge();

  return () => {
    stop?.();
    ro.disconnect();
    hooks.registerHint(null);
    wrap.remove();
  };
}
