"use client";
import Link from "next/link";
import { useState } from "react";
import { MOODS, booksForMood, bookHref } from "@/lib/content";
import { Cover } from "./BookPage";
import ReadMark from "./ReadMark";

/** "How are you feeling?" A tap opens a short shelf of bytes for that feeling. */
export default function MoodPicker({ title = "How are you feeling?" }: { title?: string }) {
  const [m, setM] = useState<string | null>(null);
  const mood = MOODS.find((x) => x.key === m);
  const list = m ? booksForMood(m) : [];
  return (
    <div className="mood">
      <h2 className="mood-title">{title}</h2>
      <div className="mood-chips" role="group" aria-label="Pick a feeling">
        {MOODS.map((x) => (
          <button key={x.key} className={`chip ${m === x.key ? "on" : ""}`} aria-pressed={m === x.key} onClick={() => setM(m === x.key ? null : x.key)}>
            {x.label}
          </button>
        ))}
      </div>
      {mood && (
        <div className="mood-pick" key={mood.key}>
          <p className="muted small">{mood.line} {list.length} bytes.</p>
          <div className="shelf">
            {list.map((b) => (
              <Link key={b.slug} href={bookHref(b)} className="shelf-book" aria-label={`${b.title}. ${b.hook}`}>
                <Cover book={b} />
                <ReadMark slug={b.slug} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
