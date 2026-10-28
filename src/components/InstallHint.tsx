"use client";
import { useEffect, useState } from "react";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** A quiet, one-time nudge on phones to keep the app on the home screen. */
export default function InstallHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [bip, setBip] = useState<BIP | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("sh-install-hint") === "no") return;
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (standalone) return;
      const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!phone) return;
      const visits = Number(localStorage.getItem("sh-visits") || "0") + 1;
      localStorage.setItem("sh-visits", String(visits));
      if (visits < 2) return;
      setIos(/iPhone|iPad|iPod/i.test(navigator.userAgent));
      setShow(true);
    } catch {}
    const onBip = (e: Event) => { e.preventDefault(); setBip(e as BIP); };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  function dismiss() { try { localStorage.setItem("sh-install-hint", "no"); } catch {} setShow(false); }
  async function install() {
    if (!bip) return;
    await bip.prompt();
    const r = await bip.userChoice;
    if (r.outcome === "accepted") dismiss();
  }

  if (!show) return null;
  return (
    <aside className="install" role="note">
      <span className="breathe" aria-hidden />
      <div>
        <p className="install-title">Keep it close.</p>
        <p className="muted small">
          {ios
            ? "Tap Share, then Add to Home Screen. It opens like an app, and nothing in it leaves your phone."
            : bip
              ? "Add Still Here to your home screen. It opens like an app, and nothing in it leaves your phone."
              : "In your browser menu, choose Add to Home Screen. It opens like an app, and nothing in it leaves your phone."}
        </p>
        <div className="row-actions">
          {bip && !ios && <button className="btn" onClick={install}>Add to home screen</button>}
          <button className="pill" onClick={dismiss}>Not now</button>
        </div>
      </div>
    </aside>
  );
}
