"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { books, bookHref, getBook, type Book } from "@/lib/content";
import { getProgress, inProgress } from "@/lib/bytes";
import { Cover, kindLabel } from "./BookPage";
import { ArrowRight } from "./Icons";

/**
 * The one byte to read now. A newcomer gets the first byte, chosen to connect fastest.
 * After that: tonight's pick from what they haven't read, the same all evening.
 */
export default function TodayByte() {
  const [pick, setPick] = useState<{ b: Book; label: string }>({ b: books[0], label: "Start here" });
  useEffect(() => {
    const prog = getProgress();
    if (!Object.keys(prog).length) return;
    const open = inProgress()?.slug;
    const unread = books.filter((b) => !prog[b.slug]?.done && b.slug !== open);
    const pool = unread.length ? unread : books;
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    const b = pool[day % pool.length];
    if (b && getBook(b.slug)) setPick({ b, label: unread.length ? "Tonight's byte" : "Read one again" });
  }, []);
  const { b, label } = pick;
  return (
    <Link href={bookHref(b)} className="today-byte" style={{ ["--accent" as string]: b.accent }}>
      <div className="today-cover"><Cover book={b} /></div>
      <div className="tb-text">
        <span className="eyebrow"><b>{label}</b></span>
        <h2 className="serif">{b.title}</h2>
        <p className="muted">{b.hook}</p>
        <span className="faint small">{b.mins} min · {kindLabel(b)}</span>
        <span className="btn gold today-go">Start reading <ArrowRight /></span>
      </div>
    </Link>
  );
}
