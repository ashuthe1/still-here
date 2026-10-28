const KEY = "sh-saved";

export function getSaved(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function isSaved(id: string): boolean { return getSaved().includes(id); }
export function toggleSaved(id: string): boolean {
  const cur = getSaved();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next.includes(id);
}
