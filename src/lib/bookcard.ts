// Renders one page of a book as a 1080x1350 paper image, the same layout as the reader.
// Sizes are in "u", a hundredth of the width, matching the cqw units in the CSS.
import type { Book, Run } from "./content";
import { parsePage, pageDrawing, getQuestionById } from "./content";
import { motifSvg, CREATURE } from "./motifs";
import { SITE_HOST } from "./site";

const W = 1080, H = 1350, u = W / 100;
const PAPER = "#f7f3ec", INK = "#1c1a17", INK2 = "#5e5850", INK3 = "#948d82";

function font(v: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fallback;
}

/** Mixes the accent toward ink so light accents stay readable on paper. */
function deepen(hex: string, k = 0.35): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c: number, t: number) => Math.round(c * (1 - k) + t * k);
  return `rgb(${m(r, 0x1c)},${m(g, 0x1a)},${m(b, 0x17)})`;
}

const img = (svg: string) => new Promise<HTMLImageElement>((res, rej) => {
  const i = new Image();
  i.onload = () => res(i); i.onerror = rej;
  i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
});

interface Seg { text: string; mark: boolean; x: number; w: number }

function wrapRuns(ctx: CanvasRenderingContext2D, runs: Run[], maxW: number): Seg[][] {
  const words: { text: string; mark: boolean }[] = [];
  runs.forEach((r) => r.text.split(/(\s+)/).forEach((w) => { if (w && !/^\s+$/.test(w)) words.push({ text: w, mark: r.mark }); else if (w && words.length) words[words.length - 1].text += " "; }));
  const lines: Seg[][] = [];
  let line: Seg[] = [], x = 0;
  const space = ctx.measureText(" ").width;
  for (const w of words) {
    const t = w.text.trimEnd();
    const wd = ctx.measureText(t).width;
    if (line.length && x + wd > maxW) { lines.push(line); line = []; x = 0; }
    line.push({ text: t, mark: w.mark, x, w: wd });
    x += wd + space;
  }
  if (line.length) lines.push(line);
  return lines;
}

export async function renderBookPage(book: Book, index: number, next?: Book): Promise<Blob> {
  const serif = font("--font-serif", "Georgia"), sans = font("--font-sans", "Helvetica");
  await Promise.all([
    document.fonts.load(`300 60px ${serif}`), document.fonts.load(`400 60px ${serif}`),
    document.fonts.load(`italic 300 40px ${serif}`), document.fonts.load(`600 30px ${sans}`),
  ]).catch(() => {});

  const total = book.pages.length + 2;
  const accent = book.accent, accentInk = deepen(accent);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "top";
  const P = 8 * u, maxW = W - 2 * P;

  const eyebrow = (text: string, x: number, y: number) => {
    ctx.fillStyle = accentInk; ctx.font = `600 ${2.5 * u}px ${sans}`;
    ctx.fillText(text.toUpperCase().split("").join(String.fromCharCode(8202)), x, y);
  };
  const drawMotif = async (x: number, y: number, s: number, flip = false, name = book.motif) => {
    const im = await img(motifSvg(name, INK, accent));
    ctx.save();
    if (flip) { ctx.translate(x + s, y); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0, s, s); }
    else ctx.drawImage(im, x, y, s, s);
    ctx.restore();
  };
  const drawLines = (lines: Seg[][], x: number, y: number, size: number, lh: number, color: string) => {
    for (const l of lines) {
      // one highlighter stroke per run of marked words
      for (let a = 0; a < l.length; a++) {
        if (!l[a].mark) continue;
        let b = a;
        while (b + 1 < l.length && l[b + 1].mark) b++;
        const x0 = l[a].x, x1 = l[b].x + l[b].w;
        ctx.fillStyle = accent + "57";
        ctx.beginPath(); ctx.roundRect(x + x0 - size * 0.12, y + size * 0.02, x1 - x0 + size * 0.24, size * 1.16, size * 0.16); ctx.fill();
        a = b;
      }
      ctx.fillStyle = color;
      for (const s of l) ctx.fillText(s.text, x + s.x, y);
      y += lh;
    }
    return y;
  };
  const foot = (left: string, right: string) => {
    const y = H - 5.5 * u - 2.4 * u;
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(P + 0.6 * u, y + 1.25 * u, 0.6 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK2; ctx.font = `italic 400 ${2.9 * u}px ${serif}`; ctx.fillText("Still Here", P + 2.2 * u, y - 0.2 * u);
    ctx.fillStyle = INK3; ctx.font = `400 ${2.3 * u}px ${sans}`;
    ctx.textAlign = "right"; ctx.fillText(right, W - P, y + 0.2 * u); ctx.textAlign = "left";
    void left;
  };

  if (index === 0) {
    // cover
    eyebrow(book.kind === "creature" ? `Advice from ${CREATURE[book.motif] ?? "a friend"}` : ({ list: "A short list", pair: "In pairs", notes: "Notes", story: "A short story", talk: "A conversation" } as Record<string, string>)[book.kind] ?? "", P, P);
    let size = 9.5 * u, lines: Seg[][] = [];
    for (; size > 6 * u; size -= 0.3 * u) { ctx.font = `300 ${size}px ${serif}`; lines = wrapRuns(ctx, [{ text: book.title, mark: false }], maxW); if (lines.length <= 3) break; }
    ctx.font = `300 ${size}px ${serif}`;
    let y = drawLines(lines, P, P + 6 * u, size, size * 1.08, INK);
    ctx.font = `italic 300 ${4.6 * u}px ${serif}`;
    drawLines(wrapRuns(ctx, [{ text: book.hook, mark: false }], maxW * 0.86), P, y + 3 * u, 4.6 * u, 4.6 * u * 1.35, INK2);
    await drawMotif(W - 4 * u - 52 * u, H - 9 * u - 52 * u, 52 * u);
    foot("", SITE_HOST);
  } else if (index === total - 1) {
    // last page: the closing line and the question it hands over to
    const q = book.ask ? getQuestionById(book.ask) : undefined;
    let y = P + 8 * u;
    if (book.close) {
      ctx.font = `italic 300 ${6.4 * u}px ${serif}`;
      y = drawLines(wrapRuns(ctx, [{ text: book.close, mark: false }], maxW), P, y, 6.4 * u, 6.4 * u * 1.3, INK) + 6 * u;
    }
    if (q) {
      ctx.font = `300 ${5.6 * u}px ${serif}`;
      const ql = wrapRuns(ctx, [{ text: q.text, mark: false }], maxW - 10 * u);
      const boxH = 5 * u + 3 * u + 3 * u + ql.length * 5.6 * u * 1.3 + 3 * u + 3 * u + 5 * u;
      ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(P, y, maxW, boxH, 3 * u); ctx.stroke();
      eyebrow("A question to keep", P + 5 * u, y + 5 * u);
      ctx.font = `300 ${5.6 * u}px ${serif}`;
      const yy = drawLines(ql, P + 5 * u, y + 11 * u, 5.6 * u, 5.6 * u * 1.3, INK);
      ctx.fillStyle = accentInk; ctx.font = `500 ${2.9 * u}px ${sans}`;
      ctx.fillText("Answer it privately in Still Here", P + 5 * u, yy + 3 * u);
      y += boxH + 4 * u;
    }
    if (book.credit) { ctx.font = `400 ${2.6 * u}px ${sans}`; drawLines(wrapRuns(ctx, [{ text: book.credit, mark: false }], maxW), P, y, 2.6 * u, 3.6 * u, INK3); }
    foot("", SITE_HOST);
    void next;
  } else {
    const i = index - 1;
    const lines = parsePage(book.pages[i]);
    const creature = book.kind === "creature";
    const top = book.kind === "list" ? P + 7 * u : P + 6 * u;
    if (book.kind === "list") eyebrow(`No. ${i + 1}`, P, P);

    if (book.kind === "pair") {
      const halves = lines.filter((l) => l.kind === "half") as { kind: "half"; side: "A" | "B"; runs: Run[] }[];
      const a = halves.find((h) => h.side === "A"), b = halves.find((h) => h.side === "B");
      const mid = H * 0.5;
      if (a) {
        eyebrow(book.labels[0] ?? "", P, P);
        ctx.font = `300 ${6 * u}px ${serif}`;
        drawLines(wrapRuns(ctx, a.runs, maxW), P, P + 6 * u, 6 * u, 6 * u * 1.32, INK2);
      }
      ctx.fillStyle = accent; ctx.fillRect(P, mid - 3 * u, 8 * u, 3);
      if (b) {
        eyebrow(book.labels[1] ?? "", P, mid + 2 * u);
        ctx.font = `400 ${6 * u}px ${serif}`;
        drawLines(wrapRuns(ctx, b.runs, maxW), P, mid + 8 * u, 6 * u, 6 * u * 1.32, INK);
      }
      await drawMotif(W - P - 13 * u, mid - 15 * u, 13 * u);
    } else {
      const scene = pageDrawing(lines);
      const body = lines.filter((l) => l.kind !== "draw");
      const only = body.length === 1 && body[0].kind === "h";
      const motifS = scene ? 40 * u : creature ? 44 * u : 28 * u;
      const avail = H - top - motifS - (creature && !scene ? 6 : 10) * u;
      // lays out (and optionally draws) the page at scale k; returns the height used
      let k = 1;
      const measure = (draw: boolean, y0: number) => {
        let y = y0;
        for (const l of body) {
          if (l.kind === "gap") { y += 3 * u * k; continue; }
          if (l.kind === "half") continue;
          if (l.kind === "say") {
            const size = 4.7 * u * k, lh = size * 1.34, px = 3.4 * u * k, py = 2 * u * k;
            ctx.font = `400 ${size}px ${serif}`;
            const wrapped = wrapRuns(ctx, l.runs, maxW * 0.8 - 2 * px);
            const tw = Math.max(...wrapped.map((ln) => { const last = ln[ln.length - 1]; return last.x + last.w; }));
            const bw = tw + 2 * px, bh = wrapped.length * lh + 2 * py;
            const bx = l.side === "me" ? W - P - bw : P;
            if (draw) {
              const r = 4 * u * k, sm = 1 * u * k;
              ctx.beginPath();
              ctx.roundRect(bx, y, bw, bh, l.side === "me" ? [r, r, sm, r] : [r, r, r, sm]);
              if (l.side === "them") { ctx.fillStyle = accent + "38"; ctx.fill(); }
              else { ctx.strokeStyle = accent + "c0"; ctx.lineWidth = 0.35 * u; ctx.stroke(); }
              ctx.font = `400 ${size}px ${serif}`;
              drawLines(wrapped, bx + px, y + py, size, lh, INK);
            }
            y += bh + 1.8 * u * k;
            continue;
          }
          const size = (l.kind === "h" ? (only ? 9 : 7) : l.kind === "cap" ? 2.8 : 5.4) * u * k;
          const lh = size * (l.kind === "h" ? 1.15 : l.kind === "cap" ? 1.4 : 1.42);
          ctx.font = l.kind === "h" ? `400 ${size}px ${serif}` : l.kind === "cap" ? `400 ${size}px ${sans}` : `300 ${size}px ${serif}`;
          const wrapped = wrapRuns(ctx, l.runs, maxW);
          if (l.kind === "cap") y += 1.5 * u * k;
          if (draw) drawLines(wrapped, P, y, size, lh, l.kind === "cap" ? INK3 : INK);
          y += wrapped.length * lh + (l.kind === "h" ? 2.5 * u * k : 0);
        }
        return y - y0;
      };
      while (k > 0.6 && measure(false, top) > avail) k -= 0.04;
      const h = measure(false, top);
      measure(true, only ? (H - h) / 2 - 4 * u : top);
      if (scene) await drawMotif(W - 5 * u - motifS, H - 8.5 * u - motifS, motifS, false, scene);
      else if (creature) await drawMotif(W - 3 * u - motifS, H - 8 * u - motifS, motifS, (i + 1) % 2 === 0);
      else await drawMotif(W - 5 * u - motifS, H - 8 * u - motifS, motifS);
    }
    foot(book.title, `${index + 1} / ${total}`);
  }
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png"));
}
