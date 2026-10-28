"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { startPath, getQuestionById, questionHref } from "@/lib/content";
import { getAll } from "@/lib/answers";
import { ArrowRight } from "./Icons";

const KEY = "sh-welcomed";

/** Shown once, to someone who has never written here. Three lines and one door. */
export default function Welcome() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
      if (Object.keys(getAll()).length) { localStorage.setItem(KEY, "1"); return; }
      setShow(true);
    } catch {}
  }, []);
  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);
  function done() { try { localStorage.setItem(KEY, "1"); } catch {} setShow(false); }
  if (!show) return null;
  const first = getQuestionById(startPath[0]);
  return (
    <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-card">
        <div className="wordmark" style={{ marginBottom: 28 }}><span className="dot" aria-hidden />Still Here</div>
        <h1 id="welcome-title">A quiet place to meet yourself.</h1>
        <ul className="welcome-lines">
          <li style={{ animationDelay: "0.25s" }}><span className="n">1</span>One gentle question a day. No right answers.</li>
          <li style={{ animationDelay: "0.45s" }}><span className="n">2</span>Everything you write stays on this phone. No account, nothing sent anywhere.</li>
          <li style={{ animationDelay: "0.65s" }}><span className="n">3</span>Answer the same question a year from now, and see what moved.</li>
        </ul>
        <div className="welcome-actions" style={{ animationDelay: "0.9s" }}>
          {first ? (
            <Link href={questionHref(first)} className="btn gold" onClick={done}>Begin with the first question <ArrowRight /></Link>
          ) : (
            <button className="btn gold" onClick={done}>Begin</button>
          )}
          <button className="pill" onClick={done}>Just look around</button>
        </div>
        {first && <p className="welcome-first faint">It starts with: <em>{first.text}</em></p>}
      </div>
    </div>
  );
}
