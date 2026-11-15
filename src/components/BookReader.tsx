"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Book } from "@/lib/content";
import { bookHref } from "@/lib/content";
import { Cover, Page, EndPage, pageCount } from "./BookPage";
import { ArrowLeft, ArrowRight, Share, LinkIcon } from "./Icons";
import { renderBookPage } from "@/lib/bookcard";
import { shareBlob, shareBlobs, shareLink, haptic } from "@/lib/native";
import { isPhone } from "@/lib/site";

export default function BookReader({ book, next }: { book: Book; next?: Book }) {
  const total = pageCount(book);
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1900); };

  const go = useCallback((i: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const k = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: k * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setAt(k);
  }, [total]);

  // open on the page in the address (#p3), and keep it there as the reader turns pages
  useEffect(() => {
    const fromHash = (smooth: boolean) => {
      const m = window.location.hash.match(/^#p(\d+)$/);
      if (m) requestAnimationFrame(() => go(Number(m[1]) - 1, smooth));
    };
    fromHash(false);
    const onHash = () => fromHash(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [go]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setAt((prev) => (prev === i ? prev : i));
      clearTimeout(t);
      t = window.setTimeout(() => {
        const hash = i > 0 ? `#p${i + 1}` : " ";
        history.replaceState(history.state, "", hash === " " ? window.location.pathname : hash);
      }, 160);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(at + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(at - 1); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, go]);

  useEffect(() => { if (at > 0) haptic("light"); }, [at]);

  const fileName = (i: number) => `still-here-${book.slug}-${String(i + 1).padStart(2, "0")}.png`;

  async function sharePage() {
    setMenu(false); setBusy(true);
    try {
      const blob = await renderBookPage(book, at, next);
      const name = fileName(at);
      if (await shareBlob(blob, name)) return;
      const file = new File([blob], name, { type: "image/png" });
      if (isPhone() && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] });
      else { download(blob, name); flash("Image saved to your downloads"); }
    } catch (e) { if (!(e instanceof Error && /abort|cancel/i.test(e.name + e.message))) flash("Could not make the image"); }
    finally { setBusy(false); }
  }

  async function shareAll() {
    setMenu(false); setBusy(true);
    try {
      const blobs: Blob[] = [];
      for (let i = 0; i < total; i++) blobs.push(await renderBookPage(book, i, next));
      const names = blobs.map((_, i) => fileName(i));
      if (await shareBlobs(blobs, names)) return;
      const files = blobs.map((b, i) => new File([b], names[i], { type: "image/png" }));
      if (isPhone() && navigator.canShare?.({ files })) await navigator.share({ files });
      else {
        for (let i = 0; i < blobs.length; i++) { download(blobs[i], names[i]); await new Promise((r) => setTimeout(r, 250)); }
        flash(`${blobs.length} images saved to your downloads`);
      }
    } catch (e) { if (!(e instanceof Error && /abort|cancel/i.test(e.name + e.message))) flash("Could not make the images"); }
    finally { setBusy(false); }
  }

  async function sendLink() {
    setMenu(false);
    const r = await shareLink();
    if (r === "copied") flash("Link copied, ready to paste");
    else if (r === "failed") flash("Could not share the link");
  }

  return (
    <div className="reader" style={{ ["--accent" as string]: book.accent }}>
      <div className="reader-stage">
        <button className="reader-arrow prev" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous page"><ArrowLeft /></button>
        <div className="pager" ref={ref} tabIndex={0} aria-roledescription="book" aria-label={book.title}>
          <div className="slot" aria-label={`Page 1 of ${total}`}><Cover book={book} /></div>
          {book.pages.map((_, i) => (
            <div className="slot" key={i} aria-label={`Page ${i + 2} of ${total}`}><Page book={book} index={i} /></div>
          ))}
          <div className="slot" aria-label={`Page ${total} of ${total}`}><EndPage book={book} next={next} /></div>
        </div>
        <button className="reader-arrow next" onClick={() => go(at + 1)} disabled={at === total - 1} aria-label="Next page"><ArrowRight /></button>
      </div>

      <div className="reader-dots" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <button key={i} tabIndex={-1} className={i === at ? "on" : ""} onClick={() => go(i)} />
        ))}
      </div>

      <div className="actions reader-actions">
        <button className={`pill ${menu ? "on" : ""}`} onClick={() => setMenu(!menu)} disabled={busy}><Share />{busy ? "Making…" : "Share"}</button>
        {at === total - 1 && next
          ? <Link href={bookHref(next)} className="pill">Next book <ArrowRight /></Link>
          : <button className="pill subtle" onClick={() => go(at === total - 1 ? 0 : at + 1)}>{at === total - 1 ? "Start again" : at === 0 ? "Open the book" : "Turn the page"}</button>}
      </div>

      {menu && (
        <div className="chooser" role="group" aria-label="Share">
          <span className="eyebrow">Share as images</span>
          <div className="row-actions">
            <button className="btn" onClick={sharePage}>This page</button>
            <button className="pill" onClick={shareAll}>All {total} pages</button>
          </div>
          <div className="chooser-split">
            <span className="eyebrow">Or send the link</span>
            <p className="muted small">Opens the book, with a preview card.</p>
            <button className="pill" onClick={sendLink}><LinkIcon /> Send the link</button>
          </div>
        </div>
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
