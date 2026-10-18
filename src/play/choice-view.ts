import type { ChoiceDef } from '../engine/level-def.ts';
import { formulaHtml } from '../formula.ts';
import { shuffle } from '../game/shuffle.ts';
import { formatGain } from '../scoring.ts';
import { later, type PlayHooks } from './types.ts';

function ordered(question: ChoiceDef): ChoiceDef['choices'] {
  const numeric = question.choices.every((choice) => /^\d+$/.test(choice.label));
  if (numeric) {
    return [...question.choices].sort((a, b) => Number(a.label) - Number(b.label));
  }
  return shuffle(question.choices);
}

export function mountChoice(
  host: HTMLElement,
  questions: ChoiceDef[],
  hooks: PlayHooks,
  mode: 'retry' | 'once',
  deadlineAt?: number,
): () => void {
  let index = 0;
  let open = true;
  let finished = false;
  const stops: (() => void)[] = [];
  const root = document.createElement('div');
  root.className = 'choice-wrap';
  host.append(root);

  const timer = document.createElement('div');
  timer.className = 'timer';
  const bar = document.createElement('span');
  timer.append(bar);
  if (deadlineAt) root.append(timer);

  const figure = document.createElement('div');
  figure.className = 'figure';
  const choices = document.createElement('div');
  choices.className = 'choices';
  root.append(figure, choices);

  function finish(): void {
    if (finished) return;
    finished = true;
    open = false;
    hooks.registerHint(null);
    hooks.onComplete();
  }

  function show(): void {
    const question = questions[index];
    if (!question) {
      finish();
      return;
    }
    open = true;
    hooks.setInstruction(question.prompt);
    hooks.setProgress(index, questions.length);
    hooks.setFeedback('idle', index === 0 ? 'Tap the answer that fits.' : '');
    hooks.setHintReady(true);
    hooks.registerHint(() => {
      if (!open) return;
      hooks.session.addHint();
      hooks.setHintReady(false);
      hooks.setFeedback('hint', question.hint);
      hooks.onHud();
      hooks.registerHint(null);
    });
    figure.replaceChildren();
    figure.classList.toggle('symbol', question.figureKind === 'symbol');
    if (question.figure) {
      figure.hidden = false;
      if (question.figureKind === 'formula') figure.innerHTML = formulaHtml(question.figure);
      else figure.textContent = question.figure;
    } else {
      figure.hidden = true;
    }
    choices.replaceChildren();
    for (const option of ordered(question)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.dataset.choice = option.id;
      button.textContent = option.label;
      button.addEventListener('click', () => pick(question, option.id, button));
      choices.append(button);
    }
  }

  function pick(question: ChoiceDef, id: string, button: HTMLButtonElement): void {
    if (!open || finished) return;
    const buttons = [...choices.querySelectorAll('button')];
    if (id === question.correctId) {
      open = false;
      button.classList.add('is-good');
      for (const node of buttons) node.disabled = true;
      const tick = hooks.session.answer(question.id, true, hooks.speedMs);
      hooks.float(formatGain(tick), true);
      hooks.setFeedback('ok', question.success);
      hooks.onHud();
      hooks.setProgress(index + 1, questions.length);
      const wait = mode === 'once' ? 700 : 650;
      stops.push(
        later(wait, () => {
          index += 1;
          if (index >= questions.length) finish();
          else show();
        }),
      );
      return;
    }
    button.classList.add('is-bad');
    button.disabled = true;
    if (!hooks.session.wasAttempted(question.id)) {
      hooks.session.answer(question.id, false, hooks.speedMs);
      hooks.onHud();
    }
    hooks.setFeedback('bad', question.wrong);
    if (mode === 'once') {
      open = false;
      for (const node of buttons) node.disabled = true;
      const right = buttons.find((node) => node.dataset.choice === question.correctId);
      right?.classList.add('is-good');
      stops.push(
        later(900, () => {
          index += 1;
          if (index >= questions.length) finish();
          else show();
        }),
      );
    }
  }

  const clock = window.setInterval(() => {
    if (!deadlineAt || finished) return;
    const total = Math.max(1, deadlineAt - hooks.session.startedAt);
    const left = deadlineAt - performance.now();
    bar.style.width = `${Math.max(0, Math.min(100, (left / total) * 100))}%`;
    timer.classList.toggle('is-low', left < 10_000);
    if (left <= 0) {
      const question = questions[index];
      if (question && open && !hooks.session.wasAttempted(question.id)) {
        hooks.session.answer(question.id, false, hooks.speedMs);
      }
      for (let cursor = index + 1; cursor < questions.length; cursor += 1) {
        const next = questions[cursor];
        if (next) hooks.session.answer(next.id, false, hooks.speedMs);
      }
      hooks.setFeedback('bad', 'Time is up. Unanswered questions count as misses.');
      finish();
    }
  }, 100);

  show();
  return () => {
    window.clearInterval(clock);
    for (const stop of stops) stop();
    hooks.registerHint(null);
    root.remove();
  };
}
