"use client";
import { useState } from "react";
import type { CardSize } from "@/lib/card";
import { deliverImages } from "@/lib/share";
import { shareLink } from "@/lib/native";
import { LinkIcon } from "./Icons";
import ShapeToggle from "./ShapeToggle";

export interface ShareOption {
  label: string;
  disabled?: boolean;
  /** Makes the image(s) for this option in the chosen shape. */
  make: (shape: CardSize) => Promise<{ blobs: Blob[]; names: string[] }>;
}

/**
 * The one share sheet used everywhere: pick Post or Story, pick what to share, or send the link.
 * The same three steps on a piece, a question and a byte.
 */
export default function ShareSheet({ options, linkNote, flash, onClose }: {
  options: ShareOption[];
  linkNote: string;
  flash: (msg: string) => void;
  onClose: () => void;
}) {
  const [shape, setShape] = useState<CardSize>("feed");
  const [busy, setBusy] = useState(false);

  async function run(o: ShareOption) {
    setBusy(true);
    try {
      const { blobs, names } = await o.make(shape);
      const r = await deliverImages(blobs, names);
      if (r === "downloaded") flash(blobs.length > 1 ? `${blobs.length} images saved to your downloads` : "Image saved to your downloads");
      if (r !== "cancelled") onClose();
    } catch { flash("Could not make the image"); }
    finally { setBusy(false); }
  }

  async function link() {
    onClose();
    const r = await shareLink();
    if (r === "copied") flash("Link copied, ready to paste");
    else if (r === "failed") flash("Could not share the link");
  }

  return (
    <div className="chooser share-sheet" role="group" aria-label="Share">
      <span className="eyebrow">Share as an image</span>
      <ShapeToggle value={shape} onChange={setShape} />
      <p className="faint small share-hint">
        {shape === "feed" ? "4:5, for an Instagram or WhatsApp post." : "9:16, for an Instagram story or WhatsApp status."}
      </p>
      <div className="row-actions">
        {options.map((o, i) => (
          <button key={o.label} className={i === 0 ? "btn" : "pill"} onClick={() => run(o)} disabled={busy || o.disabled}>
            {busy && i === 0 ? "Making…" : o.label}
          </button>
        ))}
      </div>
      <div className="chooser-split">
        <span className="eyebrow">Or send the link</span>
        <p className="muted small">{linkNote}</p>
        <button className="pill" onClick={link}><LinkIcon /> Send the link</button>
      </div>
    </div>
  );
}
