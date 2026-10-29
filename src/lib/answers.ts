// Everything a reader writes stays in their browser. Nothing here talks to a server.
import type { Question } from "./content";

export interface Entry {
  t: string;            // written at
  text: string;
  sealedUntil?: string; // present for a sealed letter
  openedAt?: string;    // set once the reader opens it
}

export const isSealed = (e: Entry) => !!e.sealedUntil && !e.openedAt;
export const isReady = (e: Entry) => isSealed(e) && new Date(e.sealedUntil!).getTime() <= Date.now();
export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
type Store = Record<string, Entry[]>;

const KEY = "sh-answers";
const DRAFT = "sh-draft:";

function read(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function getAll(): Store { return read(); }
export function getEntries(id: string): Entry[] { return read()[id] || []; }
export function hasAnswer(id: string): boolean { return (read()[id] || []).length > 0; }
export function answeredCount(ids: string[]): number {
  const s = read();
  return ids.filter((id) => (s[id] || []).length > 0).length;
}

export function addEntry(id: string, text: string): Entry {
  const s = read();
  const e = { t: new Date().toISOString(), text };
  s[id] = [e, ...(s[id] || [])];
  write(s);
  return e;
}
export function sealEntry(id: string, text: string, until: Date): Entry {
  const s = read();
  const e: Entry = { t: new Date().toISOString(), text, sealedUntil: until.toISOString() };
  s[id] = [e, ...(s[id] || [])];
  write(s);
  return e;
}
export function openEntry(id: string, t: string) {
  const s = read();
  s[id] = (s[id] || []).map((e) => (e.t === t ? { ...e, openedAt: new Date().toISOString() } : e));
  write(s);
}
/** Every sealed letter on this device, with its question id. */
export function sealedLetters(): { id: string; entry: Entry }[] {
  const out: { id: string; entry: Entry }[] = [];
  for (const [id, entries] of Object.entries(read())) for (const e of entries) if (isSealed(e)) out.push({ id, entry: e });
  return out.sort((a, b) => a.entry.sealedUntil!.localeCompare(b.entry.sealedUntil!));
}

export function updateEntry(id: string, t: string, text: string) {
  const s = read();
  s[id] = (s[id] || []).map((e) => (e.t === t ? { ...e, text } : e));
  write(s);
}
export function deleteEntry(id: string, t: string) {
  const s = read();
  s[id] = (s[id] || []).filter((e) => e.t !== t);
  if (s[id].length === 0) delete s[id];
  write(s);
}

export function getDraft(id: string): string {
  try { return localStorage.getItem(DRAFT + id) || ""; } catch { return ""; }
}
export function setDraft(id: string, text: string) {
  try { text ? localStorage.setItem(DRAFT + id, text) : localStorage.removeItem(DRAFT + id); } catch {}
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** One markdown file with every answer, newest first within each question. */
export function exportMarkdown(questions: Question[], categoryTitle: (key: string) => string): string {
  const s = read();
  const lines: string[] = ["# Still Here: my answers", "", `Exported ${new Date().toLocaleDateString()}`, ""];
  let cat = "";
  for (const q of questions) {
    const entries = s[q.id];
    if (!entries?.length) continue;
    if (q.cat !== cat) { cat = q.cat; lines.push(`## ${categoryTitle(cat)}`, ""); }
    lines.push(`### ${q.text}`, "");
    for (const e of entries) {
      if (isSealed(e)) lines.push(`*Sealed on ${formatDate(e.t)}, opens ${formatDate(e.sealedUntil!)}*`, "");
      else lines.push(`*${formatDate(e.t)}*`, "", e.text.trim(), "");
    }
  }
  return lines.join("\n");
}

export function exportJson(): string {
  let hidden: unknown = { q: [], p: [] }, saved: unknown = [];
  try { hidden = JSON.parse(localStorage.getItem("sh-hidden") || '{"q":[],"p":[]}'); } catch {}
  try { saved = JSON.parse(localStorage.getItem("sh-saved") || "[]"); } catch {}
  return JSON.stringify({ app: "still-here", version: 2, exported: new Date().toISOString(), answers: read(), hidden, saved }, null, 2);
}

/** Merges a backup into this device without overwriting anything already here. */
export function importJson(text: string): number {
  const parsed = JSON.parse(text);
  const incoming: Store = parsed?.answers && typeof parsed.answers === "object" ? parsed.answers : parsed;
  const s = read();
  let added = 0;
  for (const [id, entries] of Object.entries(incoming)) {
    if (!Array.isArray(entries)) continue;
    const have = new Set((s[id] || []).map((e) => e.t));
    for (const e of entries) {
      if (e && typeof e.t === "string" && typeof e.text === "string" && !have.has(e.t)) {
        s[id] = [...(s[id] || []), e]; added++;
      }
    }
    if (s[id]) s[id].sort((a, b) => b.t.localeCompare(a.t));
  }
  write(s);
  // hidden questions and pieces, and saved pieces, merge in too
  try {
    if (parsed?.hidden && typeof parsed.hidden === "object") {
      const cur = JSON.parse(localStorage.getItem("sh-hidden") || '{"q":[],"p":[]}');
      const q = Array.from(new Set([...(cur.q || []), ...(parsed.hidden.q || [])]));
      const p = Array.from(new Set([...(cur.p || []), ...(parsed.hidden.p || [])]));
      localStorage.setItem("sh-hidden", JSON.stringify({ q, p }));
    }
    if (Array.isArray(parsed?.saved)) {
      const cur: string[] = JSON.parse(localStorage.getItem("sh-saved") || "[]");
      localStorage.setItem("sh-saved", JSON.stringify(Array.from(new Set([...cur, ...parsed.saved]))));
    }
  } catch {}
  return added;
}
