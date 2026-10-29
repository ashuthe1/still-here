"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Piece } from "@/lib/content";
import { pieceHref, headline, headlineAuthor } from "@/lib/content";
import { hiddenPieces } from "@/lib/hidden";

const KIND = { line: "Line", reflection: "Reflection", letter: "Letter" } as const;

export default function PieceList({ list }: { list: Piece[] }) {
  const [hid, setHid] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  useEffect(() => { setHid(new Set(hiddenPieces())); }, []);
  const visible = list.filter((p) => !hid.has(p.id));
  const hiddenOnes = list.filter((p) => hid.has(p.id));
  const render = (p: Piece, dim = false) => {
    const original = headlineAuthor(p) === "Still Here";
    return (
      <Link key={p.id} href={pieceHref(p)} className={`row ${dim ? "dim" : ""}`}>
        <span className={`kind ${p.type}`}>{dim ? "Hidden" : KIND[p.type]}</span>
        <div>
          <p className={`text ${p.type === "letter" ? "letter" : ""}`}>{headline(p)}</p>
          <div className="who">
            {original ? <b>{p.title}</b> : <><b>{headlineAuthor(p)}</b>{p.type === "reflection" && p.title ? <> &nbsp;·&nbsp; {p.title}</> : null}</>}
          </div>
        </div>
      </Link>
    );
  };
  return (
    <section className="list">
      {visible.map((p) => render(p))}
      {hiddenOnes.length > 0 && (
        <div className="hidden-row">
          <button className="pill subtle" onClick={() => setShowHidden((v) => !v)}>
            {showHidden ? "Hide them again" : `${hiddenOnes.length} hidden · show`}
          </button>
        </div>
      )}
      {showHidden && hiddenOnes.map((p) => render(p, true))}
    </section>
  );
}
