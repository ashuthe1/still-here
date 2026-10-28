"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, questions, categoryHref } from "@/lib/content";
import { answeredCount } from "@/lib/answers";

export default function CategoryGrid() {
  const [done, setDone] = useState<Record<string, number>>({});
  useEffect(() => {
    const d: Record<string, number> = {};
    for (const c of categories) d[c.key] = answeredCount(questions.filter((q) => q.cat === c.key).map((q) => q.id));
    setDone(d);
  }, []);
  return (
    <div className="grid grid-5">
      {categories.map((c) => (
        <Link key={c.key} href={categoryHref(c.key)} className="tile" style={{ ["--a" as string]: c.accent }}>
          <div>
            <h3><span className="dot" aria-hidden />{c.title}</h3>
            <p>{c.tagline}</p>
          </div>
          <span className="count">{done[c.key] ? `${done[c.key]} of ${c.count} answered` : `${c.count} questions`}</span>
        </Link>
      ))}
    </div>
  );
}
