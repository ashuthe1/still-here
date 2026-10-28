"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Piece } from "@/lib/content";
import { headline, headlineAuthor } from "@/lib/content";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Bookmark, Share, Copy, Image as ImageIcon } from "./Icons";
import { renderCard } from "@/lib/card";

export default function PieceActions({ piece, accent, prevHref, nextHref }: { piece: Piece; accent: string; prevHref?: string; nextHref?: string }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();

  useEffect(() => { setSaved(isSaved(piece.id)); }, [piece.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && nextHref) router.push(nextHref);
      if (e.key === "ArrowLeft" && prevHref) router.push(prevHref);
      if (e.key === "s" || e.key === "S") onSave();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextHref, prevHref, piece.id]);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 1800); }

  function onSave() {
    const on = toggleSaved(piece.id);
    setSaved(on);
    flash(on ? "Saved" : "Removed");
  }

  function textFor(): string {
    const t = headline(piece).replace(/\n\s*\n/g, "\n");
    const a = headlineAuthor(piece);
    return a === "Still Here" ? `${t}\n\n— Still Here` : `“${t}”\n— ${a}`;
  }

  async function onCopy() {
    try { await navigator.clipboard.writeText(textFor() + `\n${location.href}`); flash("Copied"); }
    catch { flash("Could not copy"); }
  }

  async function onShare() {
    const data = { title: "Still Here", text: textFor(), url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else onCopy();
  }

  async function onCard() {
    try {
      const blob = await renderCard(piece, accent);
      const file = new File([blob], `still-here-${piece.slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Still Here" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        flash("Image saved");
      }
    } catch { flash("Could not make image"); }
  }

  return (
    <>
      <div className="actions">
        <button className={`pill ${saved ? "on" : ""}`} onClick={onSave}><Bookmark filled={saved} />{saved ? "Saved" : "Save"}</button>
        <button className="pill" onClick={onShare}><Share />Share</button>
        <button className="pill" onClick={onCard}><ImageIcon />Image</button>
        <button className="pill" onClick={onCopy}><Copy />Copy</button>
      </div>
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </>
  );
}
