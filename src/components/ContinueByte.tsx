"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBook, bookHref } from "@/lib/content";
import { inProgress } from "@/lib/bytes";
import { ArrowRight } from "./Icons";

/** "Pick up where you left off" for a byte read part of the way. */
export default function ContinueByte() {
  const [it, setIt] = useState<{ slug: string; page: number; total: number } | null>(null);
  useEffect(() => {
    const p = inProgress();
    if (p && getBook(p.slug)) setIt({ slug: p.slug, page: p.p.page, total: p.p.total });
  }, []);
  if (!it) return null;
  const b = getBook(it.slug)!;
  return (
    <Link href={`${bookHref(b)}#p${it.page + 1}`} className="continue-byte" style={{ ["--accent" as string]: b.accent }}>
      <span className="continue-bar" aria-hidden><span style={{ width: `${((it.page + 1) / it.total) * 100}%` }} /></span>
      <span className="continue-text">
        <span className="eyebrow">Pick up where you left off</span>
        <span className="serif">{b.title}</span>
        <span className="faint small">Page {it.page + 1} of {it.total}</span>
      </span>
      <ArrowRight />
    </Link>
  );
}
