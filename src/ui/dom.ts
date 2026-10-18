export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function toast(message: string, bad = false): void {
  const node = el('div', bad ? 'toast bad' : 'toast', message);
  document.body.append(node);
  window.setTimeout(() => node.remove(), 3200);
}

export function download(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = el('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function starRow(count: number, className = 'stars'): HTMLElement {
  const wrap = el('span', className);
  wrap.setAttribute('aria-label', `${count} of 3 stars`);
  for (let i = 0; i < 3; i += 1) {
    wrap.append(el('span', i < count ? 'star on' : 'star', '★'));
  }
  return wrap;
}
