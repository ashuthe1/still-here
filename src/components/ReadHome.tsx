import Link from "next/link";
import { themes, themeHref, books, bookHref, BOOK_SHELVES, booksOfKind } from "@/lib/content";
import { Cover, MotifDefs } from "@/components/BookPage";
import DailyPiece from "@/components/DailyPiece";
import Welcome from "@/components/Welcome";
import ContinueByte from "@/components/ContinueByte";
import ReadMark from "@/components/ReadMark";
import Greeting from "@/components/Greeting";
import TodayByte from "@/components/TodayByte";
import MoodPicker from "@/components/MoodPicker";
import { ArrowRight } from "@/components/Icons";

/** The order shelves appear on the home page: the warmest first. */
const ROWS = ["story", "creature", "list", "talk", "pair", "notes"] as const;

/**
 * The Read home, shown at / and /read/. Built so a first visit lands on something
 * worth reading within seconds: a greeting, one byte to start with, a way to say how
 * you feel, then the shelves, the line of the day, Ask & Find, and the rooms.
 */
export default function ReadHome({ home = false }: { home?: boolean }) {
  return (
    <main className="wrap read-home" {...(home ? { "data-home": "" } : {})}>
      <MotifDefs />
      {home && <Welcome />}

      {books.length > 0 && (
        <section className="section read-top">
          <Greeting />
          <ContinueByte />
          <TodayByte />
        </section>
      )}

      {books.length > 0 && (
        <section className="section mood-section">
          <MoodPicker />
        </section>
      )}

      {ROWS.map((kind) => {
        const shelf = BOOK_SHELVES.find((s) => s.kind === kind)!;
        const list = booksOfKind(kind);
        if (!list.length) return null;
        return (
          <section key={kind} className="section byte-row" id={kind === "story" ? "bytes" : undefined}>
            <div className="section-head">
              <h2><Link href={`/bytes/#${kind}`}>{shelf.title}</Link></h2>
              <Link href={`/bytes/#${kind}`} className="link-arrow">All {list.length}</Link>
            </div>
            <div className="shelf">
              {list.slice(0, 8).map((b) => (
                <Link key={b.slug} href={bookHref(b)} className="shelf-book" aria-label={`${b.title}. ${b.hook}`}>
                  <Cover book={b} />
                  <ReadMark slug={b.slug} />
                </Link>
              ))}
              {list.length > 8 && (
                <Link href={`/bytes/#${kind}`} className="shelf-more">
                  <span className="serif">All {list.length}</span>
                  <ArrowRight />
                </Link>
              )}
            </div>
          </section>
        );
      })}

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
