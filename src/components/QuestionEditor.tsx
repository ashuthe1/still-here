"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/content";
import { questions, questionHref } from "@/lib/content";
import { addEntry, deleteEntry, getDraft, getEntries, setDraft, updateEntry, formatDate, type Entry } from "@/lib/answers";
import { renderQuestionCard, type QuestionCardMode } from "@/lib/card";
import { Share, Image as ImageIcon, Printer, Send } from "./Icons";

export default function QuestionEditor({ question, accent, categoryTitle, nextHref }: { question: Question; accent: string; categoryTitle: string; nextHref: string }) {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
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

  async function card(mode: QuestionCardMode) {
    try {
      const answer = text.trim() || entries[0]?.text || "";
      const blob = await renderQuestionCard(question, categoryTitle, accent, mode, answer);
      const file = new File([blob], `still-here-${question.slug}-${mode}.png`, { type: "image/png" });
      if (mode !== "ruled" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Still Here" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        flash("Image saved");
      }
    } catch { flash("Could not make image"); }
  }

  async function sendText() {
    const answer = text.trim() || entries[0]?.text || "";
    const body = `${question.text}\n\n${answer}\n\n— written on Still Here`;
    if (navigator.share) { try { await navigator.share({ title: "Still Here", text: body }); return; } catch {} }
    try { await navigator.clipboard.writeText(body); flash("Copied, ready to paste"); } catch { flash("Could not copy"); }
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
        <button className="pill" onClick={() => card("question")}><Share />Share the question</button>
        <button className="pill" onClick={() => card("ruled")}><Printer />Sheet to write on</button>
        <button className="pill" onClick={() => card("answer")} disabled={!text.trim() && !entries.length}><ImageIcon />With my answer</button>
        <button className="pill" onClick={sendText} disabled={!text.trim() && !entries.length}><Send />Send as text</button>
      </div>
      <p className="faint share-note">Sharing is always your choice. Send a question to someone, or an answer to someone who matters.</p>
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}
