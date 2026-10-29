"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { questions, categories, dailyIndex, questionHref } from "@/lib/content";
import { ArrowRight, Shuffle } from "./Icons";
import { hiddenQuestions, pickVisible, randomVisible } from "@/lib/hidden";

export default function DailyQuestion() {
  const [q, setQ] = useState<typeof questions[number] | null>(null);
  const router = useRouter();
  useEffect(() => {
    const start = dailyIndex(new Date(), questions.length, 1);
    setQ(pickVisible(questions, start, new Set(hiddenQuestions())) ?? questions[start]);
  }, []);
  function another() {
    const next = randomVisible(questions, new Set(hiddenQuestions()), q?.id);
    if (next) router.push(questionHref(next));
  }
  if (!q) return <div className="today skeleton" aria-hidden />;
  const c = categories.find((x) => x.key === q.cat)!;
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="today" style={{ ["--accent" as string]: c.accent }}>
      <div className="eyebrow"><b>Tonight&apos;s question</b> &nbsp;·&nbsp; {date}</div>
      <p className="today-text plain q-text">{q.text}</p>
      {q.why && <p className="why">{q.why}</p>}
      <div className="row-actions">
        <Link href={questionHref(q)} className="btn">Write your answer <ArrowRight /></Link>
        <button className="pill" onClick={another}><Shuffle /> Another one</button>
      </div>
    </div>
  );
}
