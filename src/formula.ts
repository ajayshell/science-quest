/** Count atoms in a chemical formula, including parentheses and a leading coefficient. */

const ELEMENT = /^[A-Z][a-z]?$/;

export function countAtoms(formula: string): Record<string, number> {
  const s = formula.replace(/\s+/g, '');
  if (!s) throw new Error('Empty formula');
  let i = 0;

  function peek(): string {
    return s[i] ?? '';
  }

  function parseCount(): number {
    if (!/[0-9]/.test(peek())) return 1;
    let n = 0;
    while (/[0-9]/.test(peek())) {
      n = n * 10 + (s.charCodeAt(i) - 48);
      i += 1;
    }
    if (n <= 0) throw new Error('Count cannot be 0');
    return n;
  }

  function add(into: Record<string, number>, extra: Record<string, number>, times: number): void {
    for (const [key, value] of Object.entries(extra)) {
      into[key] = (into[key] ?? 0) + value * times;
    }
  }

  function parseSequence(stop: string | null): Record<string, number> {
    const counts: Record<string, number> = {};
    if (peek() === '' || (stop !== null && peek() === stop)) {
      throw new Error(`Empty group in ${formula}`);
    }
    while (peek() && peek() !== stop) {
      if (peek() === '(') {
        i += 1;
        const inner = parseSequence(')');
        if (peek() !== ')') throw new Error(`Missing ) in ${formula}`);
        i += 1;
        add(counts, inner, parseCount());
      } else if (/[A-Z]/.test(peek())) {
        let sym = s[i] ?? '';
        i += 1;
        if (/[a-z]/.test(peek())) {
          sym += s[i] ?? '';
          i += 1;
        }
        if (!ELEMENT.test(sym)) throw new Error(`Bad element ${sym}`);
        const n = parseCount();
        counts[sym] = (counts[sym] ?? 0) + n;
      } else {
        throw new Error(`Unexpected "${peek()}" in ${formula}`);
      }
    }
    return counts;
  }

  let coefficient = 1;
  if (/[0-9]/.test(peek())) {
    coefficient = parseCount();
    if (!/[A-Z(]/.test(peek())) throw new Error(`Bad coefficient in ${formula}`);
  }

  const counts = parseSequence(null);
  if (i !== s.length) throw new Error(`Trailing input in ${formula}`);
  if (coefficient !== 1) {
    for (const key of Object.keys(counts)) {
      counts[key] = (counts[key] ?? 0) * coefficient;
    }
  }
  return counts;
}

export function atomCount(formula: string, element: string): number {
  return countAtoms(formula)[element] ?? 0;
}

/** True when both sides of `A + B -> C + D` contain the same atoms. */
export function equationBalances(equation: string): boolean {
  const sides = equation.split('->').map((side) => side.trim());
  if (sides.length !== 2 || !sides[0] || !sides[1]) return false;
  const tally = (side: string): Record<string, number> => {
    const totals: Record<string, number> = {};
    for (const term of side.split('+').map((part) => part.trim()).filter(Boolean)) {
      const counted = countAtoms(term);
      for (const [element, amount] of Object.entries(counted)) {
        totals[element] = (totals[element] ?? 0) + amount;
      }
    }
    return totals;
  };
  const left = tally(sides[0]);
  const right = tally(sides[1]);
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if ((left[key] ?? 0) !== (right[key] ?? 0)) return false;
  }
  return keys.size > 0;
}

/** ASCII formula → HTML with subscripts. A leading coefficient stays full size. */
export function formulaHtml(formula: string): string {
  const s = formula.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9()]+$/.test(s)) throw new Error(`Cannot render ${formula}`);
  let i = 0;
  let html = '';
  const leading = /^(\d+)/.exec(s);
  if (leading && /[A-Z(]/.test(s[leading[1].length] ?? '')) {
    html += leading[1];
    i = leading[1].length;
  }
  while (i < s.length) {
    const ch = s[i] ?? '';
    if (ch >= '0' && ch <= '9') {
      let n = '';
      while (i < s.length && (s[i] ?? '') >= '0' && (s[i] ?? '') <= '9') {
        n += s[i];
        i += 1;
      }
      html += `<sub>${n}</sub>`;
    } else {
      html += ch;
      i += 1;
    }
  }
  return html;
}
