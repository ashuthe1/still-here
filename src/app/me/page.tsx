"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pieces, themes, questions, categories, pieceHref, questionHref, headline, headlineAuthor } from "@/lib/content";
import { getSaved } from "@/lib/saved";
import { getAll, exportMarkdown, exportJson, importJson, formatDate, isSealed, isReady, daysUntil, sealedLetters, type Entry } from "@/lib/answers";
import { Envelope } from "@/components/Icons";

function download(name: string, text: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export default function MePage() {
  const [saved, setSaved] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, Entry[]>>({});
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { setSaved(getSaved()); setAnswers(getAll()); }, []);

  const answered = questions.filter((q) => answers[q.id]?.some((e) => !isSealed(e)))
    .sort((a, b) => answers[b.id][0].t.localeCompare(answers[a.id][0].t));
  const sealed = Object.keys(answers).length ? sealedLetters() : [];
  const savedPieces = saved.map((id) => pieces.find((p) => p.id === id)).filter(Boolean) as typeof pieces;
  const catTitle = (k: string) => categories.find((c) => c.key === k)?.title ?? k;

  async function onImport(f?: File) {
    if (!f) return;
    try { const n = importJson(await f.text()); setAnswers(getAll()); setMsg(`Added ${n} answer${n === 1 ? "" : "s"}.`); }
    catch { setMsg("That file could not be read."); }
  }

  return (
    <main className="wrap">
      <section className="theme-hero">
        <div className="eyebrow"><b>Yours</b></div>
        <h1>Your answers</h1>
        <p className="tagline">{answered.length ? `${answered.length} question${answered.length === 1 ? "" : "s"} answered. ` : ""}Kept on this device only.</p>
        <div className="row-actions" style={{ marginTop: 24 }}>
          <button className="pill" onClick={() => download("still-here-answers.md", exportMarkdown(questions, catTitle), "text/markdown")} disabled={!answered.length}>Export as text</button>
          <button className="pill" onClick={() => download("still-here-backup.json", exportJson(), "application/json")} disabled={!answered.length}>Backup file</button>
          <button className="pill" onClick={() => file.current?.click()}>Restore a backup</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          {msg && <span className="muted" style={{ fontSize: "0.85rem" }}>{msg}</span>}
        </div>
      </section>
      {sealed.length > 0 && (
        <section className="sealed-list">
          <div className="eyebrow" style={{ marginBottom: 10 }}><b>Sealed letters</b></div>
          {sealed.map(({ id, entry }) => {
            const q = questions.find((x) => x.id === id); if (!q) return null;
            const c = categories.find((x) => x.key === q.cat)!;
            const ready = isReady(entry);
            return (
              <Link key={entry.t} href={questionHref(q)} className={`letter-banner ${ready ? "ready" : ""}`} style={{ ["--accent" as string]: c.accent }}>
                <span className="env-icon"><Envelope /></span>
                <span className="letter-text">
                  <b>{ready ? "Ready to open" : `Opens ${formatDate(entry.sealedUntil!)}`}</b>
                  <span className="muted">Sealed {formatDate(entry.t)}{ready ? "" : ` · ${daysUntil(entry.sealedUntil!)} days to go`}</span>
                </span>
              </Link>
            );
          })}
        </section>
      )}
      <section className="list">
        {answered.length === 0 && <p className="empty">Nothing written yet. <Link href="/ask/start/" className="u">Start with twelve questions.</Link></p>}
        {answered.map((q) => {
          const c = categories.find((x) => x.key === q.cat)!;
          const e = answers[q.id].find((x) => !isSealed(x))!;
          return (
            <Link key={q.id} href={questionHref(q)} className="row" style={{ ["--accent" as string]: c.accent }}>
              <span className="kind" style={{ color: c.accent }}>{c.title}</span>
              <div>
                <p className="text">{q.text}</p>
                <p className="excerpt">{e.text}</p>
                <div className="who"><span className="muted">{formatDate(e.t)}{answers[q.id].length > 1 ? ` · ${answers[q.id].length} answers` : ""}</span></div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="theme-hero" style={{ paddingTop: 64 }}>
        <div className="eyebrow"><b>Saved lines</b></div>
        <h2 className="serif" style={{ fontWeight: 300, fontSize: "2rem", margin: "6px 0 0", letterSpacing: "-0.02em" }}>From the shelf</h2>
      </section>
      <section className="list">
        {savedPieces.length === 0 && <p className="empty">Nothing saved yet. Press the bookmark on any piece you read.</p>}
        {savedPieces.map((p) => {
          const t = themes.find((x) => x.key === p.theme)!;
          return (
            <Link key={p.id} href={pieceHref(p)} className="row" style={{ ["--accent" as string]: t.accent }}>
              <span className="kind" style={{ color: t.accent }}>{t.title}</span>
              <div>
                <p className={`text ${p.type === "letter" ? "letter" : ""}`}>{headline(p)}</p>
                <div className="who"><b>{headlineAuthor(p) === "Still Here" ? p.title : headlineAuthor(p)}</b></div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
