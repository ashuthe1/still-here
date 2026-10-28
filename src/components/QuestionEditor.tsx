"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/content";
import { questions, questionHref } from "@/lib/content";
import { addEntry, deleteEntry, getDraft, getEntries, setDraft, updateEntry, formatDate, sealEntry, openEntry, isSealed, isReady, daysUntil, type Entry } from "@/lib/answers";
import { renderQuestionCard, renderSealedCard, type QuestionCardMode } from "@/lib/card";
import { Share, Printer, Seal } from "./Icons";
import DatePicker from "./DatePicker";
import { isStandalone, isPhone } from "@/lib/site";

export default function QuestionEditor({ question, accent, categoryTitle, nextHref }: { question: Question; accent: string; categoryTitle: string; nextHref: string }) {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState<null | "share" | "print" | "seal">(null);
  const [customDate, setCustomDate] = useState("");
  const [pickDate, setPickDate] = useState(false);
  const [justOpened, setJustOpened] = useState<string | null>(null);
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

  function seal(until: Date) {
    const v = text.trim();
    if (!v) return;
    sealEntry(question.id, v, until);
    setDraft(question.id, "");
    setEntries(getEntries(question.id));
    setText(""); setMenu(null);
    flash(`Sealed. It opens on ${formatDate(until.toISOString())}.`);
  }
  function inMonths(n: number): Date { const d = new Date(); d.setMonth(d.getMonth() + n); return d; }
  function open(e: Entry) {
    openEntry(question.id, e.t);
    setEntries(getEntries(question.id));
    setJustOpened(e.t);
  }
  async function shareSealed(e: Entry) {
    setMenu(null);
    try {
      const blob = await renderSealedCard(categoryTitle, accent, formatDate(e.sealedUntil!));
      const file = new File([blob], `still-here-sealed-letter.png`, { type: "image/png" });
      const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
      if (phone && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] });
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); flash("Image saved to your downloads"); }
    } catch { flash("Could not make image"); }
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

  function latestAnswer(): string { return text.trim() || entries.find((e) => !isSealed(e))?.text || ""; }

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

  /** In the installed app there is no print dialog, so hand a paper sheet to the share sheet instead. */
  async function printAsSheet(withAnswer: boolean) {
    try {
      const blob = await renderQuestionCard(question, categoryTitle, accent, withAnswer ? "answer" : "ruled", latestAnswer(), true);
      const file = new File([blob], `still-here-${question.slug}-sheet.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        flash("Choose Print, or Save to Files");
        await navigator.share({ files: [file] });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        flash("Sheet saved as an image");
      }
    } catch { flash("Could not make the sheet"); }
  }

  function print(withAnswer: boolean) {
    setMenu(null);
    if (isStandalone() && isPhone()) { printAsSheet(withAnswer); return; }
    setPrintWithAnswer(withAnswer);
    document.body.classList.add("print-sheet-mode");
    const done = () => { document.body.classList.remove("print-sheet-mode"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 60);
  }

  const showDeeper = !!question.deeper && (text.trim().length > 40 || entries.length > 0);

  return (
    <div className="editor">
      <label className="eyebrow" htmlFor="answer">{editing ? "Editing an earlier answer" : question.seal ? (entries.length ? "Write another" : "Your letter") : entries.length ? "Answer it again" : "Your answer"}</label>
      <textarea
        id="answer" ref={ta} className="answer" value={text} onChange={(e) => onChange(e.target.value)}
        placeholder={loaded ? "Write here. Nobody else will see it." : ""} spellCheck={false}
      />
      <div className="row-actions">
        {question.seal && !editing ? (
          <button className={`btn ${menu === "seal" ? "" : ""}`} onClick={() => setMenu(menu === "seal" ? null : "seal")} disabled={!text.trim()}><Seal /> Seal it</button>
        ) : (
          <button className="btn" onClick={save} disabled={!text.trim()}>{editing ? "Save changes" : "Keep this"}</button>
        )}
        {question.seal && !editing && <button className="pill" onClick={save} disabled={!text.trim()}>Keep it open instead</button>}
        {editing ? (
          <button className="pill" onClick={() => { setEditing(null); setText(getDraft(question.id)); }}>Cancel</button>
        ) : (
          <button className="pill" onClick={notToday}>Not today</button>
        )}
        <span className="faint autosave">{text && !editing ? "Draft saved as you type" : ""}</span>
      </div>

      {menu === "seal" && (
        <div className="chooser seal-chooser" role="group" aria-label="When should it open?">
          <span className="eyebrow">When should it open?</span>
          <p className="muted small">Once sealed, it stays hidden, even from you, until that day. Choose a date you will still be glad about.</p>
          <div className="row-actions">
            <button className="pill" onClick={() => seal(inMonths(3))}>In three months</button>
            <button className="pill" onClick={() => seal(inMonths(6))}>In six months</button>
            <button className="pill" onClick={() => seal(inMonths(12))}>In a year</button>
            <button className={`pill ${pickDate ? "on" : ""}`} onClick={() => setPickDate((v) => !v)}>A date of my own</button>
          </div>
          {pickDate && (
            <div className="date-row">
              <DatePicker value={customDate} min={new Date(Date.now() + 86400000)} onChange={setCustomDate} />
              <div className="row-actions" style={{ marginTop: 12 }}>
                <button className="btn" disabled={!customDate} onClick={() => customDate && seal(new Date(customDate + "T09:00:00"))}>
                  {customDate ? `Seal until ${formatDate(customDate)}` : "Pick a day above"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showDeeper && (
        <div className="deeper">
          <span className="eyebrow">Go a little deeper</span>
          <p>{question.deeper}</p>
        </div>
      )}

      {entries.length > 0 && (
        <section className="entries">
          <span className="eyebrow">What you wrote</span>
          {entries.map((e) => isSealed(e) ? (
            <article key={e.t} className={`envelope ${isReady(e) ? "ready" : ""}`}>
              <div className="flap" aria-hidden />
              <div className="wax" aria-hidden><Seal /></div>
              <div className="env-body">
                <span className="eyebrow">{isReady(e) ? "Ready to open" : "Sealed letter"}</span>
                <p className="env-title">{isReady(e) ? "The day has come." : `Opens ${formatDate(e.sealedUntil!)}`}</p>
                <p className="env-sub">Sealed {formatDate(e.t)}{isReady(e) ? "" : ` · ${daysUntil(e.sealedUntil!)} day${daysUntil(e.sealedUntil!) === 1 ? "" : "s"} to go`}</p>
                <div className="row-actions">
                  {isReady(e) ? <button className="btn" onClick={() => open(e)}>Open the letter</button> : <button className="pill" onClick={() => shareSealed(e)}><Share /> Share that you sealed one</button>}
                  <button className="pill subtle" onClick={() => remove(e)}>Delete</button>
                </div>
              </div>
            </article>
          ) : (
            <article key={e.t} className={`entry ${editing === e.t ? "editing" : ""} ${justOpened === e.t ? "revealed" : ""}`}>
              {e.openedAt && <div className="opened-note">Sealed {formatDate(e.t)} · opened {formatDate(e.openedAt)}</div>}
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
