"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { startPath, getQuestionById, categories, questionHref } from "@/lib/content";
import { hasAnswer } from "@/lib/answers";
import { ArrowRight } from "@/components/Icons";

export default function StartPage() {
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => { setDone(new Set(startPath.filter(hasAnswer))); }, []);
  const list = startPath.map(getQuestionById).filter(Boolean) as NonNullable<ReturnType<typeof getQuestionById>>[];
  const next = list.find((q) => !done.has(q.id)) || list[0];
  return (
    <main className="wrap">
      <section className="theme-hero">
        <div className="eyebrow"><b>Start here</b> &nbsp;·&nbsp; {done.size} of {list.length} answered</div>
        <h1>{list.length} questions to begin</h1>
        <p className="tagline">One from each part of your life. Take them in order, or not.</p>
        <div className="row-actions" style={{ marginTop: 28 }}>
          <Link href={questionHref(next)} className="btn">{done.size ? "Continue" : "Begin"} <ArrowRight /></Link>
        </div>
      </section>
      <section className="list">
        {list.map((q, i) => {
          const c = categories.find((x) => x.key === q.cat)!;
          return (
            <Link key={q.id} href={questionHref(q)} className="row" style={{ ["--accent" as string]: c.accent }}>
              <span className="kind" style={{ color: c.accent }}>{done.has(q.id) ? "Done" : String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text">{q.text}</p>
                <div className="who"><span className="muted">{c.title}</span></div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
