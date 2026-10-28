import type { Metadata } from "next";
import Link from "next/link";
import { themes, pieces, categories, questions } from "@/lib/content";
import { GitHub } from "@/components/Icons";

export const metadata: Metadata = { title: "About" };

export default function About() {
  const authors = Array.from(new Set(pieces.map((p) => (p.type === "reflection" ? p.quoteAuthor : p.author)).filter((a) => a && a !== "Still Here"))).sort();
  return (
    <main className="wrap page about">
      <div className="eyebrow"><b>About</b></div>
      <h1>A quiet place to meet yourself.</h1>
      <p>
        <strong>Still Here</strong> asks you one gentle question at a time and gives you somewhere private to answer. It is not a test and there is nothing to get right. The point is to notice what you actually think, and to have it in your own words when you come back later.
      </p>

      <h2>Ask &amp; Find</h2>
      <p>
        {questions.length} questions in {categories.length} categories, from who you are and what you want to work, love, time, and what you are grateful for. One is chosen for everyone each day. Write as much or as little as you like. Every answer is kept with its date, and you can answer the same question again months later and see both side by side. After you write, a small follow-up appears. If a question is not for tonight, skip it. There are no streaks and nothing to lose.
      </p>

      <h2>Read</h2>
      <p>
        A shelf of {pieces.length} short pieces in {themes.length} rooms: attributed lines from people worth listening to, reflections that sit with one of those lines for a few paragraphs, and original letters written straight to you. Each question links to a piece that goes with it.
      </p>

      <h2>Share and print</h2>
      <p>
        Any question can be shared as an image, on its own or with your answer. Any question can be printed as a sheet to write on by hand, or with your answer on it. A whole category prints as a booklet. Sharing is always your choice.
      </p>

      <h2>Privacy</h2>
      <p>
        <strong>Everything you write stays on this device.</strong> There are no accounts, no server, no tracking, and nothing is sent anywhere. From <Link className="u" href="/me/">Yours</Link> you can export all your answers as one text file, download a backup, or restore one on a new phone. Clearing your browser data will clear your answers, so keep a backup if they matter to you.
      </p>

      <h2>Credits</h2>
      <p>
        Lines are quoted briefly and credited with a source. Nothing is copied at length from any book still in print. If a line stays with you, buy the book. The evening questions follow a habit Seneca described two thousand years ago. The tone owes something to <a className="u" href="https://www.amazon.com/s?k=Between+Heaven+and+Earth+TheFallenPoet" target="_blank" rel="noopener noreferrer">Between Heaven and Earth</a> by TheFallenPoet, a collection of poems about losing and finding yourself.
      </p>
      <p className="faint" style={{ fontSize: "0.9rem" }}>Voices on the shelf ({authors.length}): {authors.join(", ")}.</p>

      <h2>Open source</h2>
      <p>
        The whole thing, questions included, is open source under the MIT licence. Read it, fork it, or suggest a question.
        {" "}<a className="u oss-inline" href="https://github.com/ashuthe1/still-here" target="_blank" rel="noopener noreferrer"><GitHub /> github.com/ashuthe1/still-here</a>
      </p>
    </main>
  );
}
