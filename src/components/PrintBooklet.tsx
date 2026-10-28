"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category, Question } from "@/lib/content";
import { categoryHref } from "@/lib/content";
import { getAll, formatDate, type Entry } from "@/lib/answers";
import { Printer, ArrowLeft } from "./Icons";

export default function PrintBooklet({ category, questions }: { category: Category; questions: Question[] }) {
  const [withAnswers, setWithAnswers] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Entry[]>>({});
  useEffect(() => { setAnswers(getAll()); }, []);
  const answeredHere = questions.filter((q) => answers[q.id]?.length).length;
  return (
    <main className="wrap booklet" style={{ ["--accent" as string]: category.accent }}>
      <div className="print-controls">
        <Link href={categoryHref(category.key)} className="crumb"><ArrowLeft /> {category.title}</Link>
        <label className="check">
          <input type="checkbox" checked={withAnswers} onChange={(e) => setWithAnswers(e.target.checked)} disabled={!answeredHere} />
          Include my answers {answeredHere ? `(${answeredHere})` : "(none yet)"}
        </label>
        <button className="btn" onClick={() => window.print()}><Printer /> Print</button>
      </div>
      <header className="print-cover">
        <div className="eyebrow"><b>Still Here</b> &nbsp;·&nbsp; Ask &amp; Find</div>
        <h1>{category.title}</h1>
        <p>{category.tagline}</p>
      </header>
      {questions.map((q, i) => {
        const es = withAnswers ? answers[q.id] || [] : [];
        return (
          <section key={q.id} className="print-q">
            <div className="eyebrow">{String(i + 1).padStart(2, "0")}</div>
            <h2>{q.text}</h2>
            {q.why && <p className="why">{q.why}</p>}
            {es.length ? es.map((e) => (
              <div key={e.t} className="print-answer">
                <div className="faint">{formatDate(e.t)}</div>
                {e.text.split(/\n+/).map((p, j) => <p key={j}>{p}</p>)}
              </div>
            )) : <div className="ruled" aria-hidden />}
            {q.deeper && <p className="deeper-line">Then: {q.deeper}</p>}
          </section>
        );
      })}
    </main>
  );
}
