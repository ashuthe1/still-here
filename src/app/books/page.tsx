import Link from "next/link";
import type { Metadata } from "next";
import { books, bookHref, BOOK_SHELVES, booksOfKind } from "@/lib/content";
import { Cover, MotifDefs } from "@/components/BookPage";

export const metadata: Metadata = {
  title: "Books",
  description: "Small books you swipe through: stories, conversations, advice from animals, short lists, and old notebooks in plain words.",
  alternates: { canonical: "/books/" },
};

export default function BooksPage() {
  const shelves = BOOK_SHELVES.filter((s) => booksOfKind(s.kind).length);
  return (
    <main className="wrap books-page">
      <MotifDefs />
      <section className="hero hero-tight">
        <div className="eyebrow">Read · Books</div>
        <h1 className="serif books-title">Small books for a few quiet minutes</h1>
        <p className="muted">{books.length} books, each a handful of pages. Swipe through one tonight.</p>
        <nav className="shelf-chips" aria-label="Kinds of books">
          {shelves.map((s) => (
            <a key={s.kind} href={`#${s.kind}`} className="chip">{s.title} <span>{booksOfKind(s.kind).length}</span></a>
          ))}
        </nav>
      </section>
      {shelves.map((s) => (
        <section key={s.kind} id={s.kind} className="section book-shelf">
          <div className="section-head">
            <h2>{s.title}</h2>
            <span className="faint small">{s.blurb}</span>
          </div>
          <div className="book-grid">
            {booksOfKind(s.kind).map((b) => (
              <Link key={b.slug} href={bookHref(b)} className="shelf-book" aria-label={`${b.title}. ${b.hook}`}>
                <Cover book={b} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
