"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { search, words, highlight, type Hit } from "@/lib/search";

const GROUPS: { kind: Hit["kind"]; label: string }[] = [
  { kind: "answer", label: "What you wrote" },
  { kind: "question", label: "Questions" },
  { kind: "piece", label: "From the shelf" },
];

function Marked({ text, ws }: { text: string; ws: string[] }) {
  return <>{highlight(text, ws).map((p, i) => (p.hit ? <mark key={i}>{p.s}</mark> : <span key={i}>{p.s}</span>))}</>;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const box = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { const u = new URL(window.location.href); setQ(u.searchParams.get("q") || ""); } catch {}
    box.current?.focus();
  }, []);

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
      window.history.replaceState(null, "", u.toString());
    } catch {}
  }, [q]);

  const ws = useMemo(() => words(q), [q]);
  const hits = useMemo(() => search(q), [q]);

  return (
    <main className="wrap page search">
      <div className="eyebrow"><b>Search</b></div>
      <input
        ref={box} className="search-box" type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="A word, a name, a feeling…" aria-label="Search questions, your answers, and the shelf" autoComplete="off"
      />
      {!q && <p className="faint search-hint">Searches the questions, everything you have written, and the shelf. Nothing leaves this device.</p>}
      {q && ws.length > 0 && hits.length === 0 && <p className="empty">Nothing for that. Try one word.</p>}
      {GROUPS.map((g) => {
        const list = hits.filter((h) => h.kind === g.kind);
        if (!list.length) return null;
        return (
          <section key={g.kind} className="results">
            <div className="section-head"><h2>{g.label}</h2><span className="faint" style={{ fontSize: "0.85rem" }}>{list.length}</span></div>
            {list.map((h, i) => (
              <Link key={h.href + i} href={h.href} className="hit" style={{ ["--accent" as string]: h.accent }}>
                <span className="hit-meta"><span className="dot" aria-hidden />{h.meta}</span>
                <p className="hit-title"><Marked text={h.title} ws={ws} /></p>
                {h.snippet && <p className="hit-snippet"><Marked text={h.snippet} ws={ws} /></p>}
              </Link>
            ))}
          </section>
        );
      })}
    </main>
  );
}
