"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/content";
import { questions, questionHref } from "@/lib/content";
import { addEntry, deleteEntry, getDraft, getEntries, setDraft, updateEntry, formatDate, type Entry } from "@/lib/answers";
import { renderQuestionCard, type QuestionCardMode } from "@/lib/card";
import { Share, Printer } from "./Icons";

export default function QuestionEditor({ question, accent, categoryTitle, nextHref }: { question: Question; accent: string; categoryTitle: string; nextHref: string }) {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState<null | "share" | "print">(null);
  const [printWithAnswer, setPrintWithAnswer] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const ta = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    setText(getDraft(question.id));
    setEntries(getEntries(question.id));
    setEditing(null);
    setLoaded(true);
  }, [question.id]);

  useEffect(() => {
    const el = ta.current; if (!el) return;
    el.style.height = "auto"; el.style.height = Math.max(160, el.scrollHeight) + "px";
  }, [text]);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 1800); }

  function onChange(v: string) { setText(v); if (!editing) setDraft(question.id, v); }

  function save() {
    const v = text.trim();
    if (!v) return;
    if (editing) { updateEntry(question.id, editing, v); setEditing(null); }
    else { addEntry(question.id, v); setDraft(question.id, ""); }
    setEntries(getEntries(question.id));
    setText("");
    flash("Kept on this device");
  }

  function startEdit(e: Entry) { setEditing(e.t); setText(e.text); ta.current?.focus(); }
  function remove(e: Entry) {
    if (!confirm("Delete this answer? This cannot be undone.")) return;
    deleteEntry(question.id, e.t); setEntries(getEntries(question.id));
    if (editing === e.t) { setEditing(null); setText(""); }
  }

  function notToday() {
    const others = questions.filter((q) => q.id !== question.id);
    const q = others[Math.floor(Math.random() * others.length)];
    router.push(nextHref.includes("/random/") ? questionHref(q) : nextHref);
  }

  function latestAnswer(): string { return text.trim() || entries[0]?.text || ""; }

  /** Phones get the system share sheet with just the file. Laptops download one PNG. */
  async function share(withAnswer: boolean) {
    setMenu(null);
    try {
      const blob = await renderQuestionCard(question, categoryTitle, accent, withAnswer ? "answer" : "question", latestAnswer());
      const file = new File([blob], `still-here-${question.slug}${withAnswer ? "-answer" : ""}.png`, { type: "image/png" });
      const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
      if (phone && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        flash("Image saved to your downloads");
      }
    } catch { flash("Could not make image"); }
  }

  function print(withAnswer: boolean) {
    setMenu(null);
    setPrintWithAnswer(withAnswer);
    document.body.classList.add("print-sheet-mode");
    const done = () => { document.body.classList.remove("print-sheet-mode"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 60);
  }

  const showDeeper = !!question.deeper && (text.trim().length > 40 || entries.length > 0);

  return (
    <div className="editor">
      <label className="eyebrow" htmlFor="answer">{editing ? "Editing an earlier answer" : entries.length ? "Answer it again" : "Your answer"}</label>
      <textarea
        id="answer" ref={ta} className="answer" value={text} onChange={(e) => onChange(e.target.value)}
        placeholder={loaded ? "Write here. Nobody else will see it." : ""} spellCheck={false}
      />
      <div className="row-actions">
        <button className="btn" onClick={save} disabled={!text.trim()}>{editing ? "Save changes" : "Keep this"}</button>
        {editing ? (
          <button className="pill" onClick={() => { setEditing(null); setText(getDraft(question.id)); }}>Cancel</button>
        ) : (
          <button className="pill" onClick={notToday}>Not today</button>
        )}
        <span className="faint autosave">{text && !editing ? "Draft saved as you type" : ""}</span>
      </div>

      {showDeeper && (
        <div className="deeper">
          <span className="eyebrow">Go a little deeper</span>
          <p>{question.deeper}</p>
        </div>
      )}

      {entries.length > 0 && (
        <section className="entries">
          <span className="eyebrow">What you wrote</span>
          {entries.map((e) => (
            <article key={e.t} className={`entry ${editing === e.t ? "editing" : ""}`}>
              <header>
                <span>{formatDate(e.t)}</span>
                <span className="entry-actions">
                  <button onClick={() => startEdit(e)}>Edit</button>
                  <button onClick={() => remove(e)}>Delete</button>
                </span>
              </header>
              {e.text.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
            </article>
          ))}
        </section>
      )}

      <div className="actions">
        <button className={`pill ${menu === "share" ? "on" : ""}`} onClick={() => setMenu(menu === "share" ? null : "share")}><Share />Share</button>
        <button className={`pill ${menu === "print" ? "on" : ""}`} onClick={() => setMenu(menu === "print" ? null : "print")}><Printer />Print</button>
      </div>
      {menu && (
        <div className="chooser" role="group" aria-label={menu === "share" ? "Share as an image" : "Print"}>
          <span className="eyebrow">{menu === "share" ? "Share as an image" : "Print a sheet"}</span>
          <div className="row-actions">
            <button className="pill" onClick={() => (menu === "share" ? share(false) : print(false))}>Just the question</button>
            <button className="pill" onClick={() => (menu === "share" ? share(true) : print(true))} disabled={!latestAnswer()}>With my answer</button>
          </div>
        </div>
      )}
      {mounted && createPortal(
        <div className="print-root" aria-hidden>
          <div className="print-sheet">
            <div className="eyebrow">{categoryTitle}</div>
            <h1>{question.text}</h1>
            {question.why && <p className="why">{question.why}</p>}
            {printWithAnswer ? (
              <div className="print-answer">
                {entries[0] && !text.trim() && <div className="faint">{formatDate(entries[0].t)}</div>}
                {latestAnswer().split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : <div className="ruled tall" />}
            {question.deeper && <p className="deeper-line">Then: {question.deeper}</p>}
            <footer><span className="dot" /> Still Here</footer>
          </div>
        </div>,
        document.body
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}
