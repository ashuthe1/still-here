// Questions and pieces the reader has set aside. On the device only, like everything else.
const KEY = "sh-hidden";
interface Store { q: string[]; p: string[] }

function read(): Store {
  try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); return { q: Array.isArray(s.q) ? s.q : [], p: Array.isArray(s.p) ? s.p : [] }; }
  catch { return { q: [], p: [] }; }
}
function write(s: Store) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

export function hiddenQuestions(): string[] { return read().q; }
export function hiddenPieces(): string[] { return read().p; }
export function isHiddenQuestion(id: string): boolean { return read().q.includes(id); }
export function isHiddenPiece(id: string): boolean { return read().p.includes(id); }

export function hideQuestion(id: string) { const s = read(); if (!s.q.includes(id)) s.q.unshift(id); write(s); }
export function unhideQuestion(id: string) { const s = read(); s.q = s.q.filter((x) => x !== id); write(s); }
export function hidePiece(id: string) { const s = read(); if (!s.p.includes(id)) s.p.unshift(id); write(s); }
export function unhidePiece(id: string) { const s = read(); s.p = s.p.filter((x) => x !== id); write(s); }

export function getHidden(): Store { return read(); }
export function mergeHidden(incoming: Partial<Store>) {
  const s = read();
  for (const id of incoming.q || []) if (!s.q.includes(id)) s.q.push(id);
  for (const id of incoming.p || []) if (!s.p.includes(id)) s.p.push(id);
  write(s);
}

/** A deterministic pick that steps past hidden ids. */
export function pickVisible<T extends { id: string }>(list: T[], start: number, hidden: Set<string>): T | undefined {
  if (!list.length) return undefined;
  for (let k = 0; k < list.length; k++) {
    const item = list[(start + k) % list.length];
    if (!hidden.has(item.id)) return item;
  }
  return list[start % list.length];
}
export function randomVisible<T extends { id: string }>(list: T[], hidden: Set<string>, exclude?: string): T | undefined {
  const pool = list.filter((x) => !hidden.has(x.id) && x.id !== exclude);
  const from = pool.length ? pool : list;
  return from[Math.floor(Math.random() * from.length)];
}
