"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pieces, themes, dailyIndex, headline, headlineAuthor, pieceHref } from "@/lib/content";
import { ArrowRight } from "./Icons";
import { hiddenPieces, pickVisible } from "@/lib/hidden";

export default function DailyPiece() {
  const [p, setP] = useState<typeof pieces[number] | null>(null);
  useEffect(() => {
    const start = dailyIndex(new Date(), pieces.length);
    setP(pickVisible(pieces, start, new Set(hiddenPieces())) ?? pieces[start]);
  }, []);
  if (!p) return <div className="today skeleton" aria-hidden />;
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
