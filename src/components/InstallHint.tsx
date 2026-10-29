"use client";
import { useEffect, useRef, useState } from "react";
import { Share } from "./Icons";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** A small sheet at the bottom of the screen on phones, once, nudging towards the home screen. */
export default function InstallHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [steps, setSteps] = useState(false);
  const [bip, setBip] = useState<BIP | null>(null);
  const sheet = useRef<HTMLElement>(null);

  useEffect(() => {
    const onBip = (e: Event) => { e.preventDefault(); setBip(e as BIP); };
    window.addEventListener("beforeinstallprompt", onBip);
    try {
      if (localStorage.getItem("sh-install-hint") === "no") return;
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (standalone) return;
      const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
      if (!phone) return;
      const visits = Number(localStorage.getItem("sh-visits") || "0") + 1;
      localStorage.setItem("sh-visits", String(visits));
      setIos(/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent)));
      // second visit, or after a quiet minute on the first
      if (visits >= 2) setShow(true);
      else { const t = setTimeout(() => setShow(true), 60000); return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", onBip); }; }
    } catch {}
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  function dismiss() { try { localStorage.setItem("sh-install-hint", "no"); } catch {} setShow(false); }
  // a tap outside the sheet, or Escape, closes it like "Not now"
  useEffect(() => {
    if (!show) return;
    const onDown = (e: PointerEvent) => { if (sheet.current && !sheet.current.contains(e.target as Node)) dismiss(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    const t = setTimeout(() => { document.addEventListener("pointerdown", onDown); window.addEventListener("keydown", onKey); }, 400);
    return () => { clearTimeout(t); document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [show]);
  async function install() {
    if (!bip) { setSteps(true); return; }
    await bip.prompt();
    const r = await bip.userChoice;
    if (r.outcome === "accepted") dismiss();
  }

  if (!show) return null;
  return (
    <aside ref={sheet} className="install-sheet" role="dialog" aria-label="Keep Still Here on your home screen">
      <span className="breathe" aria-hidden />
      <div className="install-body">
        <p className="install-title">Keep it close.</p>
        <p className="muted small">Add Still Here to your home screen. It opens like an app, works offline, and nothing in it leaves your phone.</p>
        {steps && (
          <ol className="install-steps">
            {ios ? (
              <>
                <li>Tap the <span className="glyph"><Share /></span> Share button at the bottom of Safari.</li>
                <li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>
              </>
            ) : (
              <>
                <li>Open your browser menu (the three dots).</li>
                <li>Tap <b>Add to Home screen</b> or <b>Install app</b>.</li>
              </>
            )}
          </ol>
        )}
        <div className="row-actions">
          {!steps && <button className="btn gold" onClick={install}>{bip ? "Add to home screen" : "Show me how"}</button>}
          <button className="pill" onClick={dismiss}>{steps ? "Got it" : "Not now"}</button>
        </div>
      </div>
    </aside>
  );
}
