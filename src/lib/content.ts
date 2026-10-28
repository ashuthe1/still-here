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
