"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { books, bookHref, dailyPool, dailyPoolIndex, questionHref, startPath, getQuestionById } from "@/lib/content";
import { getAll } from "@/lib/answers";
import { ArrowRight } from "./Icons";
import { Motif, MotifDefs } from "./BookPage";

const KEY = "sh-welcomed";

/**
 * Shown once, to someone new. Four small cards you swipe through, like a byte:
 * what this is, Bytes, Ask & Find, and where to begin.
 */
export default function Welcome() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [tonight, setTonight] = useState<string>("/ask/");
  const x0 = useRef(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
      if (Object.keys(getAll()).length) { localStorage.setItem(KEY, "1"); return; }
      const q = dailyPool[dailyPoolIndex(new Date())] ?? getQuestionById(startPath[0]);
      if (q) setTonight(questionHref(q));
      setShow(true);
    } catch {}
  }, []);

  function done() { try { localStorage.setItem(KEY, "1"); } catch {} setShow(false); }

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") done();
      if (e.key === "ArrowRight") setStep((s) => Math.min(3, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [show]);

  if (!show) return null;
  const first = books[0];
  const last = step === 3;

  return (
    <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={done}>
      <MotifDefs />
      <div
        className="welcome-card onboard"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - x0.current;
          if (dx < -50) setStep((s) => Math.min(3, s + 1));
          if (dx > 50) setStep((s) => Math.max(0, s - 1));
        }}
      >
        <div className="onboard-top">
          <div className="wordmark"><span className="dot" aria-hidden />Still Here</div>
          {!last && <button className="onboard-skip" onClick={done}>Skip</button>}
        </div>

        <div className="onboard-step" key={step}>
          {step === 0 && (
            <>
              <h1 id="welcome-title">A quiet place to meet yourself.</h1>
              <p>Small stories to read, and one good question a night to answer. Neither takes more than a few minutes.</p>
              <Motif name="chai" className="onboard-art" />
            </>
          )}
          {step === 1 && (
            <>
              <div className="eyebrow"><b>Bytes</b></div>
              <h1 id="welcome-title">Small stories you swipe through.</h1>
              <p>A dad who kept writing lunch-box notes. A grandmother folding laundry. A tortoise with opinions. Each one a handful of pages.</p>
              <Motif name="tortoise" className="onboard-art" />
            </>
          )}
          {step === 2 && (
            <>
              <div className="eyebrow"><b>Ask &amp; Find</b></div>
              <h1 id="welcome-title">One thoughtful question a night.</h1>
              <p>Write as much or as little as you like. It stays on this phone: no account, nothing sent anywhere. Answer again in a year and see what moved.</p>
              <Motif name="note" className="onboard-art" />
            </>
          )}
          {step === 3 && (
            <>
              <h1 id="welcome-title">Where would you like to begin?</h1>
              <div className="onboard-doors">
                {first && (
                  <Link href={bookHref(first)} className="onboard-door" onClick={done}>
                    <span className="eyebrow">Read a byte</span>
                    <span className="serif">{first.title}</span>
                    <ArrowRight />
                  </Link>
                )}
                <Link href={tonight} className="onboard-door" onClick={done}>
                  <span className="eyebrow">Ask &amp; Find</span>
                  <span className="serif">Answer tonight&apos;s question</span>
                  <ArrowRight />
                </Link>
              </div>
              <button className="pill onboard-look" onClick={done}>Just look around</button>
            </>
          )}
        </div>

        <div className="onboard-foot">
          <div className="onboard-dots" aria-hidden>
            {[0, 1, 2, 3].map((i) => <button key={i} tabIndex={-1} className={i === step ? "on" : ""} onClick={() => setStep(i)} />)}
          </div>
          {!last && <button className="btn gold" onClick={() => setStep(step + 1)}>{step === 0 ? "Show me" : "Next"} <ArrowRight /></button>}
          {last && step > 0 && <button className="pill subtle" onClick={() => setStep(step - 1)}>Back</button>}
        </div>
      </div>
    </div>
  );
}
