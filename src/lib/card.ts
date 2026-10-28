import type { Piece } from "./content";
import { headline, headlineAuthor } from "./content";
import { SITE_HOST } from "./site";

function fontFamily(varName: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || "Georgia";
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n+/)) {
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) { out.push(line); line = w; }
      else line = test;
    }
    out.push(line);
  }
  return out;
}

/** Renders a 1080x1350 share card (Instagram portrait) and returns a PNG blob. */
export async function renderCard(piece: Piece, accent: string): Promise<Blob> {
  const serif = fontFamily("--font-serif");
  const sans = fontFamily("--font-sans");
  await Promise.all([
    document.fonts.load(`300 60px ${serif}`),
    document.fonts.load(`italic 400 40px ${serif}`),
    document.fonts.load(`500 30px ${sans}`),
  ]).catch(() => {});

  const W = 1080, H = 1350, PAD = 110;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#0f0e0c"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W * 0.9);
  g.addColorStop(0, accent + "55"); g.addColorStop(1, "transparent");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const text = headline(piece);
  const author = headlineAuthor(piece);
  const isOriginal = author === "Still Here";

  // fit text: shrink until it fits the box
  let size = 64;
  let lines: string[] = [];
  const maxH = H - PAD * 2 - 260;
  for (; size >= 30; size -= 2) {
    ctx.font = `${isOriginal ? "italic " : ""}300 ${size}px ${serif}`;
    lines = wrap(ctx, text, W - PAD * 2);
    if (lines.length * size * 1.3 <= maxH) break;
  }
  const lh = size * 1.3;
  const blockH = lines.length * lh;
  let y = (H - blockH) / 2 - 40;

  ctx.fillStyle = "#ece6da"; ctx.textBaseline = "top";
  if (!isOriginal) {
    ctx.fillStyle = accent; ctx.font = `300 ${size * 1.6}px ${serif}`;
    ctx.fillText("“", PAD - 8, y - size * 0.9);
    ctx.fillStyle = "#ece6da";
  }
  ctx.font = `${isOriginal ? "italic " : ""}300 ${size}px ${serif}`;
  for (const l of lines) { ctx.fillText(l, PAD, y); y += lh; }

  y += 48;
  ctx.fillStyle = accent; ctx.fillRect(PAD, y, 56, 3); y += 26;
  ctx.fillStyle = "#ece6da"; ctx.font = `500 30px ${sans}`;
  ctx.fillText(isOriginal ? (piece.title || "Still Here") : author, PAD, y); y += 40;
  const src = isOriginal ? "" : (piece.type === "reflection" ? piece.quoteSource : piece.source);
  if (src) { ctx.fillStyle = "#8d8679"; ctx.font = `400 26px ${sans}`; ctx.fillText(src, PAD, y); }

  // wordmark and address
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(PAD + 7, H - PAD + 4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#a9a195"; ctx.font = `italic 400 32px ${serif}`;
  ctx.fillText("Still Here", PAD + 28, H - PAD - 14);
  ctx.fillStyle = "#6f685e"; ctx.font = `400 22px ${sans}`; ctx.textAlign = "right";
  ctx.fillText(SITE_HOST, W - PAD, H - PAD - 8); ctx.textAlign = "left";

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png"));
}

// ---------------- Question cards ----------------
import type { Question } from "./content";

export type QuestionCardMode = "question" | "ruled" | "answer";

/**
 * 1080x1350 card for a question.
 *  question: dark, for sharing
 *  ruled:    paper, with lines to write on by hand
 *  answer:   paper, with the reader's answer typeset under the question
 */
export async function renderQuestionCard(q: Question, categoryTitle: string, accent: string, mode: QuestionCardMode, answer = ""): Promise<Blob> {
  const serif = fontFamily("--font-serif");
  const sans = fontFamily("--font-sans");
  await Promise.all([
    document.fonts.load(`300 60px ${serif}`),
    document.fonts.load(`italic 400 40px ${serif}`),
    document.fonts.load(`500 30px ${sans}`),
  ]).catch(() => {});

  const W = 1080, H = 1350, PAD = 100;
  const paper = mode === "ruled";
  const bg = paper ? "#f7f3ec" : "#0f0e0c";
  const ink = paper ? "#1c1a17" : "#ece6da";
  const ink2 = paper ? "#5e5850" : "#a9a195";
  const ink3 = paper ? "#b9b2a6" : "#6f685e";

  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  if (!paper) {
    const g = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W * 0.9);
    g.addColorStop(0, accent + "55"); g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.textBaseline = "top";

  // category eyebrow
  ctx.fillStyle = accent; ctx.font = `600 22px ${sans}`;
  ctx.fillText(categoryTitle.toUpperCase().split("").join(String.fromCharCode(8202)), PAD, PAD);

  // question text: fit to the space the mode allows
  const maxW = W - PAD * 2;
  let size = mode === "question" ? 66 : 50;
  let lines: string[] = [];
  const maxQH = mode === "question" ? H - PAD * 2 - 240 : 400;
  for (; size >= 28; size -= 2) {
    ctx.font = `300 ${size}px ${serif}`;
    lines = wrap(ctx, q.text, maxW);
    if (lines.length * size * 1.28 <= maxQH) break;
  }
  const lh = size * 1.28;
  const qH = lines.length * lh;
  const bottom = H - PAD - 60;

  // the answer, when there is one: shrink until the whole block fits
  let asz = 36, alines: string[] = [], aH = 0;
  if (mode === "answer") {
    for (; asz >= 20; asz -= 2) {
      ctx.font = `400 ${asz}px ${serif}`;
      alines = wrap(ctx, answer.trim() || "(no answer yet)", maxW);
      aH = alines.length * asz * 1.5;
      if (qH + 110 + aH <= bottom - (PAD + 80)) break;
    }
  }

  // vertical placement: centred for share cards, top-anchored for the ruled sheet
  let y: number;
  if (mode === "question") {
    y = Math.max(PAD + 80, (H - qH - 120) / 2);
  } else if (mode === "answer") {
    const total = qH + 110 + aH;
    y = Math.max(PAD + 80, (H - total) / 2);
  } else {
    y = PAD + 60;
  }

  ctx.fillStyle = ink; ctx.font = `300 ${size}px ${serif}`;
  for (const l of lines) { ctx.fillText(l, PAD, y); y += lh; }

  if (mode === "question") {
    y += 40;
    ctx.fillStyle = accent; ctx.fillRect(PAD, y, 56, 3); y += 26;
    if (q.why) {
      ctx.fillStyle = ink2; ctx.font = `italic 400 30px ${serif}`;
      for (const l of wrap(ctx, q.why, maxW)) { ctx.fillText(l, PAD, y); y += 42; }
    }
  } else if (mode === "ruled") {
    y += 36;
    ctx.fillStyle = accent; ctx.fillRect(PAD, y, 56, 3); y += 40;
    ctx.strokeStyle = ink3; ctx.lineWidth = 1.5;
    for (let ly = y + 48; ly < bottom; ly += 64) {
      ctx.beginPath(); ctx.moveTo(PAD, ly); ctx.lineTo(W - PAD, ly); ctx.stroke();
    }
  } else {
    y += 36;
    ctx.fillStyle = accent; ctx.fillRect(PAD, y, 56, 3); y += 40;
    ctx.fillStyle = ink2; ctx.font = `400 ${asz}px ${serif}`;
    const maxLines = Math.floor((bottom - y) / (asz * 1.5));
    alines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, PAD, y + i * asz * 1.5));
    if (alines.length > maxLines) ctx.fillText("…", PAD, y + maxLines * asz * 1.5);
  }

  // wordmark and address
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(PAD + 7, H - PAD + 4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = ink2; ctx.font = `italic 400 32px ${serif}`;
  ctx.fillText("Still Here", PAD + 28, H - PAD - 14);
  ctx.fillStyle = ink3; ctx.font = `400 22px ${sans}`; ctx.textAlign = "right";
  ctx.fillText(SITE_HOST, W - PAD, H - PAD - 8); ctx.textAlign = "left";

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png"));
}

/** A dark card announcing a sealed letter without revealing a word of it. */
export async function renderSealedCard(categoryTitle: string, accent: string, opensOn: string): Promise<Blob> {
  const serif = fontFamily("--font-serif");
  const sans = fontFamily("--font-sans");
  await Promise.all([document.fonts.load(`300 60px ${serif}`), document.fonts.load(`italic 400 40px ${serif}`), document.fonts.load(`500 30px ${sans}`)]).catch(() => {});
  const W = 1080, H = 1350, PAD = 100;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0f0e0c"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.7);
  g.addColorStop(0, accent + "40"); g.addColorStop(1, "transparent");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "top";
  ctx.fillStyle = accent; ctx.font = `600 22px ${sans}`;
  ctx.fillText(categoryTitle.toUpperCase().split("").join(String.fromCharCode(8202)), PAD, PAD);
  // envelope
  const ex = W / 2 - 150, ey = H * 0.30, ew = 300, eh = 200;
  ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.lineJoin = "round";
  ctx.strokeRect(ex, ey, ew, eh);
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + ew / 2, ey + eh * 0.55); ctx.lineTo(ex + ew, ey); ctx.stroke();
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(ex + ew / 2, ey + eh * 0.55, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0f0e0c"; ctx.beginPath(); ctx.arc(ex + ew / 2, ey + eh * 0.55, 10, 0, Math.PI * 2); ctx.fill();
  // text
  ctx.textAlign = "center";
  ctx.fillStyle = "#ece6da"; ctx.font = `300 64px ${serif}`;
  ctx.fillText("I wrote a letter", W / 2, ey + eh + 90);
  ctx.fillText("to myself.", W / 2, ey + eh + 90 + 80);
  ctx.fillStyle = "#a9a195"; ctx.font = `italic 400 38px ${serif}`;
  ctx.fillText(`It opens on ${opensOn}.`, W / 2, ey + eh + 90 + 200);
  ctx.fillStyle = "#6f685e"; ctx.font = `400 26px ${sans}`;
  ctx.fillText("Write one to yourself", W / 2, ey + eh + 90 + 290);
  ctx.textAlign = "left";
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(PAD + 7, H - PAD + 4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#a9a195"; ctx.font = `italic 400 32px ${serif}`;
  ctx.fillText("Still Here", PAD + 28, H - PAD - 14);
  ctx.fillStyle = "#6f685e"; ctx.font = `400 22px ${sans}`; ctx.textAlign = "right";
  ctx.fillText(SITE_HOST, W - PAD, H - PAD - 8); ctx.textAlign = "left";
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png"));
}
