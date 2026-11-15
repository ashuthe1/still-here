import Link from "next/link";
import { themes, themeHref, books, bookHref, BOOK_SHELVES, booksOfKind } from "@/lib/content";
import { Cover, MotifDefs } from "@/components/BookPage";
import DailyPiece from "@/components/DailyPiece";
import { ArrowRight } from "@/components/Icons";

/** The Read home: books first, then the line of the day, then the rooms. Shown at / and /read/. */
export default function ReadHome({ home = false }: { home?: boolean }) {
  return (
    <main className="wrap" {...(home ? { "data-home": "" } : {})}>
      <MotifDefs />
      {books.length > 0 && (
        <section className="section books-section" id="books">
          <div className="section-head">
            <h2><Link href="/books/">Books</Link></h2>
            <Link href="/books/" className="link-arrow">All {books.length} books</Link>
          </div>
          <div className="shelf">
            {books.slice(0, 10).map((b) => (
              <Link key={b.slug} href={bookHref(b)} className="shelf-book" aria-label={`${b.title}. ${b.hook}`}>
                <Cover book={b} />
              </Link>
            ))}
            <Link href="/books/" className="shelf-more">
              <span className="serif">All {books.length} books</span>
              <ArrowRight />
            </Link>
          </div>
          <nav className="shelf-chips" aria-label="Kinds of books">
            {BOOK_SHELVES.filter((s) => booksOfKind(s.kind).length).map((s) => (
              <Link key={s.kind} href={`/books/#${s.kind}`} className="chip">{s.title} <span>{booksOfKind(s.kind).length}</span></Link>
            ))}
          </nav>
        </section>
      )}

      <section className="hero hero-tight">
        <DailyPiece />
      </section>

      <section className="section">
        <Link href="/ask/" className="ask-teaser">
          <span className="eyebrow">Ask &amp; Find</span>
          <span className="serif ask-teaser-q">One thoughtful question tonight, and a private place to answer it.</span>
          <span className="link-arrow">Open tonight&apos;s question <ArrowRight /></span>
        </Link>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Where are you right now?</h2>
          <Link href="/random/" className="link-arrow">A random piece</Link>
        </div>
        <div className="grid">
          {themes.map((t) => (
            <Link key={t.key} href={themeHref(t.key)} className="tile" style={{ ["--a" as string]: t.accent }}>
              <div>
                <h3><span className="dot" aria-hidden />{t.title}</h3>
                <p>{t.tagline}</p>
              </div>
              <span className="count">{t.count} pieces</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
