"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { startPath, getQuestionById, questionHref } from "@/lib/content";
import { hasAnswer } from "@/lib/answers";
import { ArrowRight } from "./Icons";

/** "Start with 13 questions" for a newcomer; "Continue, 5 of 13" once they have begun. */
export default function StartBanner() {
  const [done, setDone] = useState(0);
  const [next, setNext] = useState<string>("/ask/start/");
  useEffect(() => {
    const answered = startPath.filter(hasAnswer);
    setDone(answered.length);
    const pending = startPath.find((id) => !hasAnswer(id));
    const q = pending ? getQuestionById(pending) : undefined;
    setNext(q ? questionHref(q) : "/ask/start/");
  }, []);
  const total = startPath.length;
  const finished = done >= total;
  return (
    <Link href={done > 0 && !finished ? next : "/ask/start/"} className="start-banner">
      <div>
        <div className="eyebrow"><b>{done === 0 ? "New here?" : finished ? "Start Here, done" : "In progress"}</b></div>
        <h2>{done === 0 ? `Start with ${total} questions` : finished ? "You have answered all of them" : `Continue Start Here, ${done} of ${total}`}</h2>
        <p>{done === 0
          ? "A gentle first pass across every part of your life. Twenty minutes, or a week of evenings."
          : finished ? "Come back to any of them whenever you like, and see what has moved." : "Pick up where you left off. No hurry."}</p>
        {done > 0 && !finished && <div className="start-progress" aria-hidden><span style={{ width: `${(done / total) * 100}%` }} /></div>}
      </div>
      <ArrowRight />
    </Link>
  );
}
