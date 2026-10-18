import { getCard } from '../data/cards.ts';
import { WORLDS, getLevel } from '../data/levels/index.ts';
import { LevelSession } from '../game/session.ts';
import { isUnlocked } from '../game/unlock.ts';
import { mountLevel } from '../play/mount.ts';
import type { PlayHooks } from '../play/types.ts';
import { HINT_COST, comboMultiplier, formatClock, formatMult, rateStars } from '../scoring.ts';
import { applyLevelResult, type Award } from '../store/award.ts';
import { formulaHtml } from '../formula.ts';
import type { AppCtx } from './types.ts';
import { el, starRow } from './dom.ts';

type Snapshot = {
  stars: 1 | 2 | 3;
  gross: number;
  hintsUsed: number;
  firstTryCorrect: number;
  total: number;
  elapsedMs: number;
  bestCombo: number;
  award: Award;
};

export function renderPlay(root: HTMLElement, levelNumber: number, ctx: AppCtx): () => void {
  const level = getLevel(levelNumber);
  if (!isUnlocked(ctx.progress(), level.number)) {
    ctx.go({ name: 'hub' });
    return () => undefined;
  }
  const session = new LevelSession();
  let mode: 'intro' | 'play' | 'results' = 'intro';
  let innerStop: (() => void) | null = null;
  let snapshot: Snapshot | null = null;
  let hintFn: (() => void) | null = null;

  const screen = el('section', 'play');
  root.append(screen);

  function paint(): void {
    innerStop?.();
    innerStop = null;
    screen.replaceChildren();
    if (mode === 'intro') paintIntro();
    else if (mode === 'play') paintRun();
    else paintResults();
  }

  function paintIntro(): void {
    const world = WORLDS.find((item) => item.id === level.world);
    const card = el('article', 'intro');
    card.append(el('p', 'eyebrow', `${world?.kicker ?? 'World'} · Level ${String(level.number).padStart(2, '0')}`));
    card.append(el('h1', 'display', level.title));
    if (level.boss) card.append(el('p', 'boss-tag', 'Boss'));
    card.append(el('p', 'lede', level.summary));
    card.append(el('p', '', level.how));
    card.append(
      el(
        'p',
        'star-rule',
        `For 3 stars: every answer right on the first try, no hints, and finish within ${formatClock(level.parSeconds * 1000)}.`,
      ),
    );
    const row = el('div', 'tool-row');
    const start = el('button', 'primary', 'Start');
    start.type = 'button';
    start.addEventListener('click', () => {
      mode = 'play';
      session.start();
      paint();
    });
    const back = el('button', 'ghost', 'Back');
    back.type = 'button';
    back.addEventListener('click', () => ctx.go({ name: 'hub' }));
    row.append(start, back);
    card.append(row);
    screen.append(card);
  }

  function paintRun(): void {
    const hud = el('header', 'hud');
    const leave = el('button', 'ghost', 'Leave');
    leave.type = 'button';
    leave.addEventListener('click', confirmLeave);
    const titles = el('div', 'hud-title');
    titles.append(el('p', 'eyebrow', `Level ${level.number}`));
    titles.append(el('h1', '', level.title));
    const score = el('div', 'hud-score');
    const levelScore = el('strong', 'level-score', '0');
    const streak = el('span', 'streak', 'Streak 0');
    score.append(levelScore, streak);
    hud.append(leave, titles, score);

    const meta = el('div', 'hud-meta');
    const progress = el('span', 'progress-label', '0 / 0');
    const hint = el('button', 'hint', `Hint · ${HINT_COST}`);
    hint.type = 'button';
    meta.append(progress, hint);

    const instruction = el('p', 'instruction');
    const stage = el('div', 'stage');
    const feedback = el('p', 'feedback');
    feedback.setAttribute('role', 'status');
    screen.append(hud, meta, instruction, stage, feedback);

    const refresh = (): void => {
      const net = session.gross - session.hintsUsed * HINT_COST;
      levelScore.textContent = net >= 0 ? String(net) : '0';
      streak.textContent = `Streak ${session.combo} · next ${formatMult(comboMultiplier(session.combo))}`;
    };
    hint.addEventListener('click', () => hintFn?.());

    const hooks: PlayHooks = {
      session,
      speedMs: level.speedMs,
      setInstruction: (text) => {
        instruction.textContent = text;
      },
      setFeedback: (kind, text) => {
        feedback.className = `feedback is-${kind}`;
        feedback.textContent = text;
      },
      setProgress: (done, goal) => {
        progress.textContent = `${done} / ${goal}`;
      },
      setHintReady: (ready) => {
        hint.disabled = !ready;
      },
      onHud: refresh,
      onComplete: () => {
        const elapsedMs = session.elapsedMs();
        const stars = rateStars({
          firstTryCorrect: session.firstTryCorrect,
          total: session.total,
          elapsedMs,
          parMs: level.parSeconds * 1000,
          hintsUsed: session.hintsUsed,
        });
        const award = applyLevelResult(ctx.progress(), level.id, {
          gross: session.gross,
          hintsUsed: session.hintsUsed,
          stars,
          bestCombo: session.bestCombo,
          cardIds: level.cardIds,
        });
        ctx.persist();
        snapshot = {
          stars,
          gross: session.gross,
          hintsUsed: session.hintsUsed,
          firstTryCorrect: session.firstTryCorrect,
          total: session.total,
          elapsedMs,
          bestCombo: session.bestCombo,
          award,
        };
        mode = 'results';
        paint();
      },
      registerHint: (fn) => {
        hintFn = fn;
        hint.disabled = !fn;
      },
      float: (text, ok) => {
        const node = el('span', ok ? 'floater ok' : 'floater bad', text);
        stage.append(node);
        window.setTimeout(() => node.remove(), 1000);
      },
    };
    refresh();
    innerStop = mountLevel(stage, level, hooks);
  }

  function confirmLeave(): void {
    const dialog = el('dialog', 'card-dialog');
    dialog.append(el('h2', '', 'Leave this level?'));
    dialog.append(el('p', 'dialog-fact', 'This round is not saved. Hint points are only spent if you finish.'));
    const row = el('div', 'tool-row');
    const stay = el('button', 'primary', 'Keep playing');
    stay.type = 'button';
    stay.addEventListener('click', () => dialog.close());
    const exit = el('button', 'ghost', 'Leave');
    exit.type = 'button';
    exit.addEventListener('click', () => {
      dialog.close();
      ctx.go({ name: 'hub' });
    });
    row.append(stay, exit);
    dialog.append(row);
    dialog.addEventListener('close', () => dialog.remove());
    screen.append(dialog);
    dialog.showModal();
  }

  function paintResults(): void {
    const result = snapshot;
    if (!result) return;
    const card = el('article', 'results');
    if (result.stars === 3) {
      const sparks = el('div', 'spark-field');
      for (let i = 0; i < 16; i += 1) {
        const spark = el('i', 'spark');
        spark.style.setProperty('--a', `${(360 / 16) * i}deg`);
        spark.style.setProperty('--c', i % 2 === 0 ? 'var(--cyan)' : 'var(--magenta)');
        sparks.append(spark);
      }
      card.append(sparks);
    }
    card.append(el('p', 'eyebrow', 'Level clear'));
    card.append(el('h1', 'display', level.title));
    const stars = starRow(result.stars, 'stars big');
    card.append(stars);
    const delta = result.award.delta;
    const sign = delta > 0 ? `+${delta}` : String(delta);
    card.append(el('p', 'result-points', `${sign} bank`));
    card.append(
      el(
        'p',
        '',
        `Score ${result.gross} · hints −${result.hintsUsed * HINT_COST} · first try ${result.firstTryCorrect}/${result.total} · ${formatClock(result.elapsedMs)} · best streak ${result.bestCombo}`,
      ),
    );
    card.append(el('p', 'lede', bankSentence(result)));
    if (result.award.newCards.length) {
      card.append(el('h2', 'cards-head', 'New cards'));
      const row = el('div', 'new-cards');
      for (const id of result.award.newCards) {
        const collect = getCard(id);
        if (!collect) continue;
        const tile = el('div', 'collect mini');
        tile.style.setProperty('--accent', collect.accent);
        const formula = el('span', 'collect-formula');
        if (collect.kind === 'molecule') formula.innerHTML = formulaHtml(collect.formula);
        else formula.textContent = collect.formula;
        tile.append(formula, el('span', 'collect-title', collect.title));
        row.append(tile);
      }
      card.append(row);
    } else {
      card.append(el('p', '', 'No new cards this time. These are already in the album.'));
    }
    const actions = el('div', 'tool-row');
    if (level.number < 11) {
      const next = el('button', 'primary', 'Next level');
      next.type = 'button';
      next.addEventListener('click', () => ctx.go({ name: 'play', level: level.number + 1 }));
      actions.append(next);
    }
    const again = el('button', 'ghost', 'Replay');
    again.type = 'button';
    again.addEventListener('click', () => ctx.go({ name: 'play', level: level.number }));
    const hub = el('button', 'ghost', 'Hub');
    hub.type = 'button';
    hub.addEventListener('click', () => ctx.go({ name: 'hub' }));
    actions.append(again, hub);
    card.append(actions);
    screen.append(card);
  }

  paint();
  return () => {
    innerStop?.();
  };
}

function bankSentence(result: Snapshot): string {
  const { award } = result;
  if (award.delta > 0) return `Added ${award.delta} points to this profile.`;
  if (award.delta < 0) return `Hints cost ${award.spent}. The bank dropped by ${-award.delta}.`;
  if (award.spent > 0 && award.gained === award.spent) return 'New points and the hint cost cancelled out.';
  return 'No new best this time. Your record still stands.';
}
