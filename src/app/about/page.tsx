import type { Metadata } from "next";
import { themes, pieces } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default function About() {
  const authors = Array.from(new Set(pieces.map((p) => (p.type === "reflection" ? p.quoteAuthor : p.author)).filter((a) => a && a !== "Still Here"))).sort();
  return (
    <main className="wrap page">
      <div className="eyebrow"><b>About</b></div>
      <h1>A small shelf for 2am.</h1>
      <p>
        <strong>Still Here</strong> is a shelf of lines about life, hardship, and finding yourself. It is small on purpose. Every piece had to earn its place: it has to be true, it has to be credited to the right person, and it has to leave you a bit more able to face tomorrow than you were before you read it. Comfort alone was not enough to get in.
      </p>
      <p>
        There are three kinds of pieces. <strong>Lines</strong> are short, attributed quotes. <strong>Reflections</strong> take someone else&apos;s line and sit with it for a few paragraphs. <strong>Letters</strong> are original, written to you. Each of the {themes.length} rooms opens with one.
      </p>
      <p>
        Quotes from living authors are kept short and credited with a source. Nothing is copied at length from a book still in print. If a line gets you, buy the book.
      </p>
      <p>
        The tone owes something to <a className="u" href="https://www.amazon.com/s?k=Between+Heaven+and+Earth+TheFallenPoet" target="_blank" rel="noopener noreferrer">Between Heaven and Earth</a> by TheFallenPoet, a collection of poems about losing and finding yourself. Two of its lines appear here with credit.
      </p>
      <p>Voices in this collection ({authors.length}): {authors.join(", ")}.</p>
      <p>
        Saved pieces live in your browser only. There are no accounts, no tracking, and no feed. {pieces.length} pieces and counting.
      </p>
    </main>
  );
}
