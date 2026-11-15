import Link from "next/link";
import type { Metadata } from "next";
import { books, bookHref, BOOK_SHELVES, booksOfKind } from "@/lib/content";
import { Cover, MotifDefs } from "@/components/BookPage";
import ReadMark from "@/components/ReadMark";
import ContinueByte from "@/components/ContinueByte";
import MoodPicker from "@/components/MoodPicker";

export const metadata: Metadata = {
  title: "Bytes",
  description: "Bytes: small stories you swipe through in a few minutes. Stories, conversations, advice from animals, short lists, and old notebooks in plain words.",
  alternates: { canonical: "/bytes/" },
};

export default function BytesPage() {
  const shelves = BOOK_SHELVES.filter((s) => booksOfKind(s.kind).length);
  return (
    <main className="wrap books-page">
      <MotifDefs />
      <section className="hero hero-tight">
        <div className="eyebrow">Read · Bytes</div>
        <h1 className="serif books-title">Bytes: small reads for a few quiet minutes</h1>
        <p className="muted">{books.length} bytes, each a handful of pages. Swipe through one tonight.</p>
        <ContinueByte />
        <nav className="shelf-chips" aria-label="Kinds of bytes">
          {shelves.map((s) => (
            <a key={s.kind} href={`#${s.kind}`} className="chip">{s.title} <span>{booksOfKind(s.kind).length}</span></a>
          ))}
        </nav>
      </section>
      <section className="section mood-section">
        <MoodPicker title="Or pick by how you feel" />
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
                <ReadMark slug={b.slug} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
