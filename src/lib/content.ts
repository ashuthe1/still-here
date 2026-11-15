import data from "@/data/content.json";

export type PieceType = "line" | "reflection" | "letter";

export interface Piece {
  id: string;
  theme: string;
  slug: string;
  type: PieceType;
  author: string;
  title: string;
  source: string;
  url: string;
  quote: string;
  quoteAuthor: string;
  quoteSource: string;
  note: string;
  tags: string[];
  body: string;
  order: number;
}

export interface Theme {
  key: string;
  title: string;
  tagline: string;
  accent: string;
  order: number;
  intro: string;
  count: number;
}

export const themes: Theme[] = data.themes as Theme[];
export const pieces: Piece[] = data.pieces as Piece[];

export function getTheme(key: string): Theme | undefined {
  return themes.find((t) => t.key === key);
}

export function piecesFor(theme: string): Piece[] {
  return pieces.filter((p) => p.theme === theme);
}

export function getPiece(theme: string, slug: string): Piece | undefined {
  return pieces.find((p) => p.theme === theme && p.slug === slug);
}

export function pieceHref(p: Pick<Piece, "theme" | "slug">): string {
  return `/t/${p.theme}/${p.slug}/`;
}

export function themeHref(key: string): string {
  return `/t/${key}/`;
}

/** The text a reader would quote: the quote for a reflection, the body otherwise. */
export function headline(p: Piece): string {
  return p.type === "reflection" ? p.quote : p.body;
}

export function headlineAuthor(p: Piece): string {
  return p.type === "reflection" ? p.quoteAuthor : p.author;
}

/** Deterministic daily pick: same piece for everyone on the same calendar day. */
export function dailyIndex(date: Date, n: number, salt = 0): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  const seed = date.getFullYear() * 1000 + day + salt * 7919;
  // xorshift so neighbouring days do not pick neighbouring pieces
  let x = seed ^ 0x9e3779b9;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return Math.abs(x) % n;
}

export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

// ---------------- Ask & Find ----------------

export interface Category {
  key: string;
  title: string;
  tagline: string;
  accent: string;
  order: number;
  intro: string;
  count: number;
}

export interface Question {
  id: string;
  cat: string;
  slug: string;
  text: string;
  why: string;
  deeper: string;
  read: string;
  tags: string[];
  order: number;
  seal?: boolean;
  send?: string;   // "younger": the letter is sent back to a younger self when kept
  daily?: boolean; // in the hand-picked pool for tonight's question
}

export const categories: Category[] = (data as { categories: Category[] }).categories;
export const questions: Question[] = (data as { questions: Question[] }).questions;
export const startPath: string[] = (data as { start: string[] }).start;

export function getCategory(key: string): Category | undefined {
  return categories.find((c) => c.key === key);
}
export function questionsFor(cat: string): Question[] {
  return questions.filter((q) => q.cat === cat);
}
export function getQuestion(cat: string, slug: string): Question | undefined {
  return questions.find((q) => q.cat === cat && q.slug === slug);
}
export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
export function getPieceById(id: string): Piece | undefined {
  return pieces.find((p) => p.id === id);
}
export function questionHref(q: Pick<Question, "cat" | "slug">): string {
  return `/ask/${q.cat}/${q.slug}/`;
}
export function categoryHref(key: string): string {
  return `/ask/${key}/`;
}

/**
 * The hand-picked pool for tonight's question, interleaved by category so that
 * consecutive days come from different parts of life.
 */
export const dailyPool: Question[] = (() => {
  const byCat = categories.map((c) => questions.filter((q) => q.daily && q.cat === c.key));
  const out: Question[] = [];
  for (let i = 0; byCat.some((l) => i < l.length); i++) for (const l of byCat) if (i < l.length) out.push(l[i]);
  return out;
})();

/** Tonight's question: walks the pool in order, one step per calendar day, the same for everyone. */
export function dailyPoolIndex(date: Date): number {
  const days = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return ((days % dailyPool.length) + dailyPool.length) % dailyPool.length;
}

// ---------------- Books ----------------

export type BookKind = "story" | "talk" | "creature" | "list" | "pair" | "notes";

export interface Book {
  slug: string;
  title: string;
  hook: string;     // the line under the title on the cover
  kind: BookKind;
  motif: string;    // key of the line drawing in Motif.tsx
  accent: string;
  order: number;
  labels: string[]; // pair books: the two half labels, e.g. ["What I said", "What I meant"]
  credit: string;   // notes books: the source
  ask: string;      // the question the last page hands over to
  close: string;    // the line on the last page, above the question
  pages: string[];  // raw page text
  moods: string[];  // keys of MOODS this byte suits
  mins: number;     // reading time, rounded
}

export const books: Book[] = ((data as { books?: Book[] }).books ?? []) as Book[];

export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}
export function bookHref(b: Pick<Book, "slug">): string {
  return `/b/${b.slug}/`;
}

/** One run of text inside a line; marked runs get the highlighter. */
export interface Run { text: string; mark: boolean }
export type PageLine =
  | { kind: "h"; runs: Run[] }
  | { kind: "p"; runs: Run[] }
  | { kind: "cap"; runs: Run[] }
  | { kind: "half"; side: "A" | "B"; runs: Run[] }
  | { kind: "say"; side: "them" | "me"; runs: Run[] }
  | { kind: "draw"; name: string }
  | { kind: "gap" };

export function runs(text: string): Run[] {
  const out: Run[] = [];
  text.split(/(==[^=]+==)/).forEach((s) => {
    if (!s) return;
    if (s.startsWith("==") && s.endsWith("==")) out.push({ text: s.slice(2, -2), mark: true });
    else out.push({ text: s, mark: false });
  });
  return out;
}

/**
 * Parses one page of a book into lines. A blank line becomes a gap.
 *   # heading   ~ caption   A:/B: pair halves   > they say   < I say   @drawing
 */
export function parsePage(raw: string): PageLine[] {
  const out: PageLine[] = [];
  for (const line of raw.split("\n")) {
    const s = line.trim();
    if (!s) { if (out.length && out[out.length - 1].kind !== "gap") out.push({ kind: "gap" }); continue; }
    if (s.startsWith("# ")) out.push({ kind: "h", runs: runs(s.slice(2)) });
    else if (s.startsWith("~ ")) out.push({ kind: "cap", runs: runs(s.slice(2)) });
    else if (/^[AB]: /.test(s)) out.push({ kind: "half", side: s[0] as "A" | "B", runs: runs(s.slice(3)) });
    else if (s.startsWith("> ")) out.push({ kind: "say", side: "them", runs: runs(s.slice(2)) });
    else if (s.startsWith("< ")) out.push({ kind: "say", side: "me", runs: runs(s.slice(2)) });
    else if (/^@[a-z-]+$/.test(s)) out.push({ kind: "draw", name: s.slice(1) });
    else out.push({ kind: "p", runs: runs(s) });
  }
  while (out.length && out[out.length - 1].kind === "gap") out.pop();
  return out;
}

export const plain = (r: Run[]) => r.map((x) => x.text).join("");

/** The drawing a page asks for with "@name", if any. */
export function pageDrawing(lines: PageLine[]): string | undefined {
  const d = lines.find((l) => l.kind === "draw");
  return d && d.kind === "draw" ? d.name : undefined;
}

/** The shelves on the Books page, in order. */
export const BOOK_SHELVES: { kind: BookKind; title: string; blurb: string }[] = [
  { kind: "story", title: "Stories", blurb: "Small stories about ordinary people, told a page at a time." },
  { kind: "talk", title: "Conversations", blurb: "Two people, a few honest questions." },
  { kind: "creature", title: "Advice from small friends", blurb: "Gentle, slightly ridiculous wisdom from animals who have thought about it." },
  { kind: "list", title: "Short lists", blurb: "One idea a page." },
  { kind: "pair", title: "In pairs", blurb: "How it looked, and how it was." },
  { kind: "notes", title: "Old notebooks", blurb: "Very old books, in plain words." },
];
export const booksOfKind = (k: BookKind) => books.filter((b) => b.kind === k);

/** "How are you feeling?" on Read: each mood opens the bytes tagged with it. */
export const MOODS: { key: string; label: string; line: string }[] = [
  { key: "tired", label: "Tired", line: "For when you're running on empty." },
  { key: "overthinking", label: "Overthinking", line: "For a busy head." },
  { key: "home", label: "Missing home", line: "Families, kitchens, the people who raised you." },
  { key: "lonely", label: "A bit lonely", line: "Small kindnesses, from strangers and old friends." },
  { key: "stuck", label: "Stuck", line: "For starting again, slowly." },
  { key: "love", label: "Thinking of someone", line: "The quiet ways people love each other." },
  { key: "smile", label: "Need a smile", line: "Gentle, a little funny, very short." },
];
export const booksForMood = (m: string) => books.filter((b) => b.moods.includes(m));
