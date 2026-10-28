"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pieces, themes, dailyIndex, headline, headlineAuthor, pieceHref } from "@/lib/content";
import { ArrowRight } from "./Icons";

export default function DailyPiece() {
  const [i, setI] = useState<number | null>(null);
  useEffect(() => { setI(dailyIndex(new Date(), pieces.length)); }, []);
  if (i === null) return <div className="today skeleton" aria-hidden />;
  const p = pieces[i];
  const t = themes.find((x) => x.key === p.theme)!;
  const original = headlineAuthor(p) === "Still Here";
  return (
    <div className="today" style={{ ["--accent" as string]: t.accent }}>
      <div className="eyebrow"><b>Today</b> &nbsp;·&nbsp; {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
      <p className={`today-text ${original ? "plain" : ""}`} style={original ? { fontStyle: "italic" } : undefined}>
        {headline(p).split(/\n\s*\n/)[0]}
      </p>
      <div className="byline">
        <span className="name">{original ? (p.title || "Still Here") : headlineAuthor(p)}</span>
        {!original && (p.type === "reflection" ? p.quoteSource : p.source) && <span className="src">{p.type === "reflection" ? p.quoteSource : p.source}</span>}
      </div>
      <Link href={pieceHref(p)} className="link-arrow">Read it in {t.title} <ArrowRight /></Link>
    </div>
  );
}
