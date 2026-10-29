"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Question } from "@/lib/content";
import { questionHref } from "@/lib/content";
import { hiddenQuestions } from "@/lib/hidden";
import AnsweredMark from "./AnsweredMark";

/** A category's questions, with the ones set aside tucked under a count at the bottom. */
export default function QuestionList({ list }: { list: Question[] }) {
  const [hid, setHid] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  useEffect(() => { setHid(new Set(hiddenQuestions())); }, []);
  const visible = list.filter((q) => !hid.has(q.id));
  const hiddenOnes = list.filter((q) => hid.has(q.id));
  const render = (q: Question, i: number, dim = false) => (
    <Link key={q.id} href={questionHref(q)} className={`row ${dim ? "dim" : ""}`}>
      <span className="kind">{dim ? "Hidden" : String(i + 1).padStart(2, "0")}</span>
      <div>
        <p className="text">{q.text}</p>
        <div className="who"><span className="muted">{q.why}</span> <AnsweredMark id={q.id} /></div>
      </div>
    </Link>
  );
  return (
    <section className="list">
      {visible.map((q, i) => render(q, i))}
      {hiddenOnes.length > 0 && (
        <div className="hidden-row">
          <button className="pill subtle" onClick={() => setShowHidden((v) => !v)}>
            {showHidden ? "Hide them again" : `${hiddenOnes.length} set aside · show`}
          </button>
        </div>
      )}
      {showHidden && hiddenOnes.map((q, i) => render(q, i, true))}
    </section>
  );
}
