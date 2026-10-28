"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { questions, categories, dailyIndex, questionHref } from "@/lib/content";
import { ArrowRight, Shuffle } from "./Icons";

export default function DailyQuestion() {
  const [i, setI] = useState<number | null>(null);
  useEffect(() => { setI(dailyIndex(new Date(), questions.length, 1)); }, []);
  if (i === null) return <div className="today skeleton" aria-hidden />;
  const q = questions[i];
  const c = categories.find((x) => x.key === q.cat)!;
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="today" style={{ ["--accent" as string]: c.accent }}>
      <div className="eyebrow"><b>Tonight&apos;s question</b> &nbsp;·&nbsp; {date}</div>
      <p className="today-text plain q-text">{q.text}</p>
      {q.why && <p className="why">{q.why}</p>}
      <div className="row-actions">
        <Link href={questionHref(q)} className="btn">Write your answer <ArrowRight /></Link>
        <Link href="/ask/random/" className="pill"><Shuffle /> Another one</Link>
      </div>
    </div>
  );
}
