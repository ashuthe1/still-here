// On-device search over questions, the reader's own answers, and the shelf.
// Plain word matching: every word in the query has to appear somewhere in the text.
import { questions, pieces, categories, themes, questionHref, pieceHref, headline, headlineAuthor, type Question, type Piece } from "./content";
import { getAll, formatDate } from "./answers";

export interface Hit {
  kind: "answer" | "question" | "piece";
  href: string;
  title: string;      // the question text or the piece headline
  snippet: string;    // the matching passage
  meta: string;       // category / room, date
  accent: string;
}

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

export function words(q: string): string[] {
  return fold(q).split(/[^a-z0-9']+/).filter((w) => w.length > 1);
}

function matches(text: string, ws: string[]): boolean {
  const t = fold(text);
  return ws.every((w) => t.includes(w));
}

/** A short passage around the first matching word. */
export function snippet(text: string, ws: string[], span = 150): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= span) return flat;
  const t = fold(flat);
  let i = -1;
  for (const w of ws) { const k = t.indexOf(w); if (k >= 0 && (i < 0 || k < i)) i = k; }
  if (i < 0) return flat.slice(0, span) + "…";
  const start = Math.max(0, i - Math.floor(span / 3));
  const end = Math.min(flat.length, start + span);
  return (start > 0 ? "…" : "") + flat.slice(start, end).trim() + (end < flat.length ? "…" : "");
}

export function search(query: string, limitPerGroup = 12): Hit[] {
  const ws = words(query);
  if (!ws.length) return [];
  const hits: Hit[] = [];

  // 1. the reader's answers
  const all = getAll();
  let n = 0;
  for (const q of questions) {
    const entries = all[q.id];
    if (!entries?.length) continue;
    for (const e of entries) {
      if (n >= limitPerGroup) break;
      if (matches(e.text, ws)) {
        const c = categories.find((x) => x.key === q.cat);
        hits.push({ kind: "answer", href: questionHref(q), title: q.text, snippet: snippet(e.text, ws), meta: `Your answer · ${formatDate(e.t)}`, accent: c?.accent || "" });
        n++;
      }
    }
  }

  // 2. questions
  n = 0;
  for (const q of questions) {
    if (n >= limitPerGroup) break;
    if (matches(`${q.text} ${q.why} ${q.deeper}`, ws)) {
      const c = categories.find((x) => x.key === q.cat);
      hits.push({ kind: "question", href: questionHref(q), title: q.text, snippet: matches(q.text, ws) ? "" : snippet(`${q.why} ${q.deeper}`, ws), meta: c?.title || "", accent: c?.accent || "" });
      n++;
    }
  }

  // 3. the shelf
  n = 0;
  for (const p of pieces) {
    if (n >= limitPerGroup) break;
    const author = headlineAuthor(p);
    const body = `${headline(p)} ${p.body} ${author} ${p.title} ${p.source} ${p.note}`;
    if (matches(body, ws)) {
      const t = themes.find((x) => x.key === p.theme);
      const head = headline(p).split(/\n\s*\n/)[0];
      // The rest of the piece: the reflection paragraphs, or just the margin note for a line.
      const rest = p.type === "reflection" ? `${p.body} ${p.note}` : p.type === "letter" ? p.body.split(/\n\s*\n/).slice(1).join(" ") : p.note;
      const extra = !matches(head, ws) && matches(rest, ws) ? snippet(rest, ws) : "";
      hits.push({ kind: "piece", href: pieceHref(p), title: snippet(head, ws, 140), snippet: extra, meta: `${author === "Still Here" ? p.title : author} · ${t?.title || ""}`, accent: t?.accent || "" });
      n++;
    }
  }
  return hits;
}

/** Splits text into plain and matched segments so the page can highlight matches. */
export function highlight(text: string, ws: string[]): { s: string; hit: boolean }[] {
  if (!ws.length || !text) return [{ s: text, hit: false }];
  const pattern = ws.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const splitter = new RegExp(`(${pattern})`, "gi");
  const tester = new RegExp(`^(${pattern})$`, "i");
  return text.split(splitter).filter(Boolean).map((s) => ({ s, hit: tester.test(s) }));
}

export type { Question, Piece };
