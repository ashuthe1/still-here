// Reading progress for Bytes, kept on this device only.
const KEY = "sh-bytes";

export interface ByteProgress { page: number; total: number; t: number; done: boolean }

export function getProgress(): Record<string, ByteProgress> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

/** Records the page a reader is on; reaching the last page marks the byte as read, for good. */
export function saveProgress(slug: string, page: number, total: number) {
  try {
    const all = getProgress();
    const prev = all[slug];
    all[slug] = { page, total, t: Date.now(), done: (prev?.done ?? false) || page >= total - 1 };
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("sh-bytes"));
  } catch {}
}

/** The byte most recently left part-way through, if any. */
export function inProgress(): { slug: string; p: ByteProgress } | null {
  const all = getProgress();
  let best: { slug: string; p: ByteProgress } | null = null;
  for (const [slug, p] of Object.entries(all)) {
    if (p.done || p.page < 1) continue;
    if (!best || p.t > best.p.t) best = { slug, p };
  }
  return best;
}
