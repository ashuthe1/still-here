"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Piece } from "@/lib/content";
import { headline, headlineAuthor, paragraphs } from "@/lib/content";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Bookmark, Share, Printer } from "./Icons";
import { renderCard, type CardSize } from "@/lib/card";
import { isStandalone, isPhone } from "@/lib/site";
import ShapeToggle from "./ShapeToggle";

export default function PieceActions({ piece, accent, themeTitle, prevHref, nextHref }: { piece: Piece; accent: string; themeTitle: string; prevHref?: string; nextHref?: string }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState<null | "share">(null);
  const [shape, setShape] = useState<CardSize>("feed");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setSaved(isSaved(piece.id)); setMounted(true); }, [piece.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
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

  async function share() {
    setMenu(null);
    try {
      const blob = await renderCard(piece, accent, shape);
      const file = new File([blob], `still-here-${piece.slug}${shape === "story" ? "-story" : ""}.png`, { type: "image/png" });
      if (isPhone() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        flash("Image saved to your downloads");
      }
    } catch { flash("Could not make image"); }
  }

  function print() {
    if (isStandalone() && isPhone()) { flash("Open this page in Safari to print"); return; }
    document.body.classList.add("print-sheet-mode");
    const done = () => { document.body.classList.remove("print-sheet-mode"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 60);
  }

  const author = headlineAuthor(piece);
  const original = author === "Still Here";
  const quoteText = piece.type === "reflection" ? piece.quote : headline(piece);

  return (
    <>
      <div className="actions">
        <button className={`pill ${saved ? "on" : ""}`} onClick={onSave}><Bookmark filled={saved} />{saved ? "Saved" : "Save"}</button>
        <button className={`pill ${menu === "share" ? "on" : ""}`} onClick={() => setMenu(menu ? null : "share")}><Share />Share</button>
        <button className="pill" onClick={print}><Printer />Print</button>
      </div>
      {menu === "share" && (
        <div className="chooser" role="group" aria-label="Share as an image">
          <span className="eyebrow">Share as an image</span>
          <ShapeToggle value={shape} onChange={setShape} />
          <div className="row-actions">
            <button className="btn" onClick={share}>Make the image</button>
          </div>
        </div>
      )}
      {mounted && createPortal(
        <div className="print-root" aria-hidden>
          <div className="print-sheet">
            <div className="eyebrow">{themeTitle}</div>
            <h1>{original ? piece.title : `\u201C${quoteText}\u201D`}</h1>
            {!original && <p className="why">{piece.type === "reflection" ? `${piece.quoteAuthor}${piece.quoteSource ? ", " + piece.quoteSource : ""}` : `${author}${piece.source ? ", " + piece.source : ""}`}</p>}
            {(original || piece.type === "reflection") && (
              <div className="print-answer">{paragraphs(piece.body).map((p, i) => <p key={i}>{p}</p>)}</div>
            )}
            {piece.note && !original && piece.type !== "reflection" && <p className="deeper-line">{piece.note}</p>}
            <footer><span className="dot" /> Still Here</footer>
          </div>
        </div>,
        document.body
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </>
  );
}
