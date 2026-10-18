import type { HuntPromptDef } from '../data/levels/types.ts';
import { formatGain } from '../scoring.ts';
import { fitCanvas } from './draw.ts';
import { SCENES, drawScene } from './scenes.ts';
import { later, type PlayHooks } from './types.ts';

export function mountHunt(host: HTMLElement, prompts: HuntPromptDef[], hooks: PlayHooks): () => void {
  let index = 0;
  let open = true;
  let stop: (() => void) | null = null;
  const wrap = document.createElement('div');
  wrap.className = 'scene-wrap';
  const title = document.createElement('p');
  title.className = 'scene-title';
  const stage = document.createElement('div');
  stage.className = 'scene';
  const canvas = document.createElement('canvas');
  stage.append(canvas);
  wrap.append(title, stage);
  host.append(wrap);

  function paint(): void {
    const prompt = prompts[index];
    if (!prompt) return;
    const ctx = fitCanvas(canvas, stage.clientWidth || 320, stage.clientHeight || 420);
    drawScene(ctx, prompt.scene, stage.clientWidth || 320, stage.clientHeight || 420);
  }

  function show(): void {
    const prompt = prompts[index];
    if (!prompt) {
      hooks.onComplete();
      return;
    }
    open = true;
    const scene = SCENES[prompt.scene];
    title.textContent = scene.title;
    hooks.setInstruction(prompt.prompt);
    hooks.setProgress(index, prompts.length);
    hooks.setFeedback('idle', 'Tap a glowing object.');
    hooks.setHintReady(true);
    hooks.registerHint(() => {
      if (!open) return;
      hooks.session.addHint();
      hooks.setHintReady(false);
      hooks.setFeedback('hint', prompt.hint);
      hooks.onHud();
      hooks.registerHint(null);
    });
    stage.querySelectorAll('button').forEach((node) => node.remove());
    for (const object of scene.objects) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'spot';
      button.style.left = `${object.x * 100}%`;
      button.style.top = `${object.y * 100}%`;
      button.style.width = `${object.w * 100}%`;
      button.style.height = `${object.h * 100}%`;
      button.setAttribute('aria-label', object.label);
      const caption = document.createElement('span');
      caption.textContent = object.label;
      button.append(caption);
      button.addEventListener('click', () => choose(object.id, button));
      stage.append(button);
    }
    paint();
  }

  function choose(id: string, button: HTMLButtonElement): void {
    const prompt = prompts[index];
    if (!prompt || !open) return;
    if (id !== prompt.targetId) {
      button.classList.add('is-bad');
      if (!hooks.session.wasAttempted(prompt.id)) {
        hooks.session.answer(prompt.id, false, hooks.speedMs);
        hooks.onHud();
      }
      hooks.setFeedback('bad', prompt.wrong);
      return;
    }
    open = false;
    button.classList.add('is-good');
    const tick = hooks.session.answer(prompt.id, true, hooks.speedMs);
    hooks.float(formatGain(tick), true);
    hooks.setFeedback('ok', prompt.success);
    hooks.setProgress(index + 1, prompts.length);
    hooks.onHud();
    stop?.();
    stop = later(800, () => {
      index += 1;
      show();
    });
  }

  const ro = new ResizeObserver(() => paint());
  ro.observe(stage);
  show();
  return () => {
    stop?.();
    ro.disconnect();
    hooks.registerHint(null);
    wrap.remove();
  };
}
