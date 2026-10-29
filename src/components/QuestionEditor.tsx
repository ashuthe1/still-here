"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/content";
import { questions, questionHref } from "@/lib/content";
import { addEntry, deleteEntry, getDraft, getEntries, setDraft, updateEntry, formatDate, sealEntry, openEntry, isSealed, isReady, daysUntil, type Entry } from "@/lib/answers";
import { renderQuestionCard, renderSealedCard, type QuestionCardMode, type CardSize } from "@/lib/card";
import ShapeToggle from "./ShapeToggle";
import { Share, Printer, Seal } from "./Icons";
import DatePicker from "./DatePicker";
import EnvelopeArt from "./EnvelopeArt";
import PaperPlane from "./PaperPlane";
import { isStandalone, isPhone } from "@/lib/site";
import { isHiddenQuestion, hideQuestion, unhideQuestion, hiddenQuestions, randomVisible } from "@/lib/hidden";
import { shareBlob, haptic } from "@/lib/native";

export default function QuestionEditor({ question, accent, categoryTitle, nextHref }: { question: Question; accent: string; categoryTitle: string; nextHref: string }) {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState<null | "share" | "print" | "seal">(null);
  const [shape, setShape] = useState<CardSize>("feed");
  const [sealShare, setSealShare] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [pickDate, setPickDate] = useState(false);
  const [justOpened, setJustOpened] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [sealing, setSealing] = useState<{ until: Date; closed: boolean } | null>(null);
  const [flying, setFlying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [printWithAnswer, setPrintWithAnswer] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const ta = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    setText(getDraft(question.id));
    setEntries(getEntries(question.id));
    setEditing(null);
    setHidden(isHiddenQuestion(question.id));
    setLoaded(true);
  }, [question.id]);

  useEffect(() => {
    const el = ta.current; if (!el) return;
    el.style.height = "auto"; el.style.height = Math.max(160, el.scrollHeight) + "px";
  }, [text]);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 1800); }

  function onChange(v: string) { setText(v); if (!editing) setDraft(question.id, v); }

  function commitSave(v: string) {
    if (editing) { updateEntry(question.id, editing, v); setEditing(null); }
    else { addEntry(question.id, v); setDraft(question.id, ""); }
    setEntries(getEntries(question.id));
    setText("");
  }
  function save() {
    const v = text.trim();
    if (!v) return;
    if (question.send === "younger" && !editing) {
      // fold it into a plane and send it back before it lands in the list
      setFlying(true);
      setTimeout(() => { commitSave(v); setFlying(false); flash("Sent. They got it."); }, 2200);
      return;
    }
    commitSave(v);
    haptic("light");
    flash("Kept on this device");
  }

  function seal(until: Date) {
    const v = text.trim();
    if (!v || sealing) return;
    setMenu(null);
    // the letter goes in, the flap comes down, the wax lands; then it is really sealed
    setSealing({ until, closed: false });
    setTimeout(() => setSealing({ until, closed: true }), 80);
    setTimeout(() => haptic("medium"), 1500);
    setTimeout(() => {
      sealEntry(question.id, v, until);
      setDraft(question.id, "");
      setEntries(getEntries(question.id));
      setText("");
      setSealing(null);
      flash(`Sealed. It opens on ${formatDate(until.toISOString())}.`);
    }, 2300);
  }
  function inMonths(n: number): Date { const d = new Date(); d.setMonth(d.getMonth() + n); return d; }
  function open(e: Entry) {
    if (opening) return;
    setOpening(e.t);
    haptic("success");
    // let the flap lift and the letter slide out before the words appear
    setTimeout(() => {
      openEntry(question.id, e.t);
      setEntries(getEntries(question.id));
      setJustOpened(e.t);
      setOpening(null);
    }, 1100);
  }
  function progressOf(e: Entry): number {
    const a = new Date(e.t).getTime(), b = new Date(e.sealedUntil!).getTime(), n = Date.now();
    if (b <= a) return 100;
    return Math.max(0, Math.min(100, ((n - a) / (b - a)) * 100));
  }
  async function shareSealed(e: Entry, size: CardSize) {
    setMenu(null); setSealShare(null);
    try {
      const blob = await renderSealedCard(categoryTitle, accent, formatDate(e.sealedUntil!), size);
      const file = new File([blob], `still-here-sealed-letter${size === "story" ? "-story" : ""}.png`, { type: "image/png" });
      if (await shareBlob(blob, file.name)) return;
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

  function nextVisibleHref(): string {
    const hid = new Set(hiddenQuestions());
    if (!nextHref.includes("/random/")) {
      const target = questions.find((q) => questionHref(q) === nextHref);
      if (target && !hid.has(target.id)) return nextHref;
    }
    const q = randomVisible(questions, hid, question.id);
    return q ? questionHref(q) : "/";
  }
  function notToday() { router.push(nextVisibleHref()); }
  function notForMe() {
    hideQuestion(question.id);
    setHidden(true);
    flash("Hidden. It is under Yours if you change your mind.");
    setTimeout(() => router.push(nextVisibleHref()), 900);
  }
  function bringBack() { unhideQuestion(question.id); setHidden(false); flash("Back in the rotation"); }

  function latestAnswer(): string { return text.trim() || entries.find((e) => !isSealed(e))?.text || ""; }

  /** Phones get the system share sheet with just the file. Laptops download one PNG. */
  async function share(withAnswer: boolean) {
    setMenu(null);
    try {
      const blob = await renderQuestionCard(question, categoryTitle, accent, withAnswer ? "answer" : "question", latestAnswer(), false, shape);
      const file = new File([blob], `still-here-${question.slug}${withAnswer ? "-answer" : ""}${shape === "story" ? "-story" : ""}.png`, { type: "image/png" });
      if (await shareBlob(blob, file.name)) return;
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
      if (await shareBlob(blob, file.name)) { flash("Choose Print, or save it"); return; }
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
      {hidden && (
        <div className="hidden-note">
          <span>You set this question aside. It will not come up on its own.</span>
          <button className="pill" onClick={bringBack}>Bring it back</button>
        </div>
      )}
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
          <>
            <button className="pill" onClick={notToday}>Not today</button>
            {!hidden && <button className="pill subtle" onClick={notForMe} title="Hide this question for good">Not for me</button>}
          </>
        )}
        <span className="faint autosave">{text && !editing ? "Draft saved as you type" : ""}</span>
      </div>

      {sealing && (
        <div className="stage" role="status" aria-live="polite">
          <div className="stage-art"><EnvelopeArt open={!sealing.closed} closing={sealing.closed} /></div>
          <p className="stage-cap">Sealing until <b>{formatDate(sealing.until.toISOString())}</b></p>
          <p className="stage-sub">Not even you can read it before then.</p>
        </div>
      )}
      {flying && (
        <div className="stage fly" role="status" aria-live="polite">
          <div className="stage-art plane-wrap"><PaperPlane /><span className="trail" /></div>
          <p className="stage-cap">Folded, and sent back.</p>
          <p className="stage-sub">To the you who was fifteen. They needed that.</p>
        </div>
      )}
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
            <article key={e.t} className={`envelope ${isReady(e) ? "ready" : ""} ${opening === e.t ? "opening" : ""}`}>
              <div className="env-left"><EnvelopeArt open={opening === e.t} ready={isReady(e)} /></div>
              <div className="env-body">
                <span className="eyebrow">{isReady(e) ? "Ready to open" : "A sealed letter"}</span>
                <p className="env-title">{isReady(e) ? "The day has come." : `Opens ${formatDate(e.sealedUntil!)}`}</p>
                <p className="env-sub">
                  {isReady(e)
                    ? `You sealed this on ${formatDate(e.t)}. Nobody has read it since, not even you.`
                    : `Sealed ${formatDate(e.t)} · ${daysUntil(e.sealedUntil!)} day${daysUntil(e.sealedUntil!) === 1 ? "" : "s"} to go`}
                </p>
                {!isReady(e) && <div className="env-progress" aria-hidden><span style={{ width: `${progressOf(e)}%` }} /></div>}
                <div className="row-actions">
                  {isReady(e)
                    ? <button className="btn gold" onClick={() => open(e)} disabled={opening === e.t}>{opening === e.t ? "Opening…" : "Open the letter"}</button>
                    : <button className={`pill ${sealShare === e.t ? "on" : ""}`} onClick={() => setSealShare(sealShare === e.t ? null : e.t)}><Share /> Share that you sealed one</button>}
                  <button className="pill subtle" onClick={() => remove(e)}>Delete</button>
                </div>
                {sealShare === e.t && (
                  <div className="row-actions" style={{ marginTop: 10 }}>
                    <button className="pill" onClick={() => shareSealed(e, "feed")}>For the feed</button>
                    <button className="pill" onClick={() => shareSealed(e, "story")}>For a story</button>
                  </div>
                )}
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
          {menu === "share" && <ShapeToggle value={shape} onChange={setShape} />}
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
