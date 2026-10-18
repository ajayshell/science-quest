const MARKS: Record<string, string> = {
  atom: '<circle cx="32" cy="32" r="4"/><ellipse cx="32" cy="32" rx="22" ry="9"/><ellipse cx="32" cy="32" rx="22" ry="9" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="22" ry="9" transform="rotate(120 32 32)"/>',
  flask:
    '<path d="M26 8h12M28 8v16L16 50a8 8 0 0 0 7 10h18a8 8 0 0 0 7-10L36 24V8"/><path d="M20 40h24"/>',
  comet: '<circle cx="42" cy="22" r="8"/><path d="M36 28 12 50M32 24 8 40M38 32 18 54"/>',
  bolt: '<path d="M36 6 16 36h14l-4 22 22-32H32l4-20z"/>',
  crystal: '<path d="M32 6 50 24 32 58 14 24z"/><path d="M14 24h36M32 6v52M32 24 14 24M32 24 50 24"/>',
  wave: '<path d="M6 34c6-12 10-12 16 0s10 12 16 0 10-12 16 0"/>',
  rocket:
    '<path d="M32 6c10 8 14 20 14 32l-8 6-6-8-6 8-8-6c0-12 4-24 14-32z"/><circle cx="32" cy="28" r="4"/><path d="M18 40l-6 12 12-4M46 40l6 12-12-4"/>',
  sun: '<circle cx="32" cy="32" r="10"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"/>',
};

export function avatarSvg(id: string): string {
  const body = MARKS[id] ?? MARKS.atom;
  return `<svg class="avatar-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function markSvg(): string {
  return `<svg class="brand-mark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">${MARKS.atom}</svg>`;
}
