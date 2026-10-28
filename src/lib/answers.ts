// Everything a reader writes stays in their browser. Nothing here talks to a server.
import type { Question } from "./content";

export interface Entry { t: string; text: string }
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
    for (const e of entries) lines.push(`*${formatDate(e.t)}*`, "", e.text.trim(), "");
  }
  return lines.join("\n");
}

export function exportJson(): string {
  return JSON.stringify({ app: "still-here", version: 1, exported: new Date().toISOString(), answers: read() }, null, 2);
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
  return added;
}
