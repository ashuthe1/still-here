import Link from "next/link";
import type { Book, Run, PageLine } from "@/lib/content";
import { parsePage, pageDrawing, getQuestionById, questionHref, getCategory } from "@/lib/content";
import { motif, CREATURE } from "@/lib/motifs";

export function Motif({ name, className, flip }: { name: string; className?: string; flip?: boolean }) {
  const m = motif(name);
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d={m.wash} className="m-wash" />
      <g filter="url(#sh-hand)">
        <path d={m.ink} className="m-ink" />
        {(m.dots ?? []).map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="m-dot" />)}
      </g>
    </svg>
  );
}

/** The wobble filter the motifs share; rendered once per page that shows books. */
export function MotifDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="sh-hand" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="2.2" />
      </filter>
    </svg>
  );
}

export function kindLabel(b: Book): string {
  switch (b.kind) {
    case "creature": return `Advice from ${CREATURE[b.motif] ?? "a friend"}`;
    case "list": return "A short list";
    case "pair": return "In pairs";
    case "notes": return "Notes";
    case "talk": return "A conversation";
    default: return "A short story";
  }
}

function R({ runs }: { runs: Run[] }) {
  return <>{runs.map((r, i) => (r.mark ? <mark key={i}>{r.text}</mark> : <span key={i}>{r.text}</span>))}</>;
}

/** Number of pages in the reader: cover, the book's pages, and the last page. */
export const pageCount = (b: Book) => b.pages.length + 2;

export function Cover({ book }: { book: Book }) {
  return (
    <div className="bp bp-cover" style={{ ["--accent" as string]: book.accent }}>
      <div className="bp-eyebrow">{kindLabel(book)}</div>
      <h2 className="bp-title">{book.title}</h2>
      <p className="bp-hook">{book.hook}</p>
      <Motif name={book.motif} className="bp-motif-cover" />
      <div className="bp-foot"><span>{book.mins} min · {book.pages.length} pages</span><span>Swipe</span></div>
    </div>
  );
}

function Lines({ lines }: { lines: PageLine[] }) {
  return (
    <>
      {lines.map((l, i) => {
        if (l.kind === "gap") return <div key={i} className="bp-gap" />;
        if (l.kind === "h") return <h3 key={i} className="bp-h"><R runs={l.runs} /></h3>;
        if (l.kind === "cap") return <p key={i} className="bp-cap"><R runs={l.runs} /></p>;
        if (l.kind === "p") return <p key={i} className="bp-p"><R runs={l.runs} /></p>;
        if (l.kind === "say") return <p key={i} className={`bp-say bp-say-${l.side}`}><R runs={l.runs} /></p>;
        return null;
      })}
    </>
  );
}

export function Page({ book, index }: { book: Book; index: number }) {
  const lines = parsePage(book.pages[index]);
  const n = index + 1;            // position among the book's own pages
  const total = book.pages.length + 2; // with the cover and the last page
  const halves = lines.filter((l): l is Extract<PageLine, { kind: "half" }> => l.kind === "half");
  const only = lines.length === 1 && lines[0].kind === "h";
  const creature = book.kind === "creature";
  const scene = pageDrawing(lines);
  return (
    <div className={`bp bp-${book.kind} ${only ? "bp-only" : ""}`} style={{ ["--accent" as string]: book.accent }}>
      {book.kind === "list" && <div className="bp-eyebrow">No. {n}</div>}
      {book.kind === "pair" && halves.length ? (
        <div className="bp-halves">
          {halves.map((h, i) => (
            <div key={i} className={`bp-half bp-half-${h.side}`}>
              <div className="bp-eyebrow">{book.labels[h.side === "A" ? 0 : 1] ?? ""}</div>
              <p><R runs={h.runs} /></p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bp-body"><Lines lines={lines} /></div>
      )}
      {scene
        ? <Motif name={scene} className="bp-scene" />
        : <Motif name={book.motif} className={creature ? "bp-motif-creature" : "bp-motif-small"} flip={creature && n % 2 === 0} />}
      <div className="bp-foot"><span className="bp-name">{book.title}</span><span>{n + 1} / {total}</span></div>
    </div>
  );
}

export function EndPage({ book, next }: { book: Book; next?: Book }) {
  const q = book.ask ? getQuestionById(book.ask) : undefined;
  const cat = q ? getCategory(q.cat) : undefined;
  return (
    <div className="bp bp-end" style={{ ["--accent" as string]: book.accent }}>
      <div className="bp-body">
        {book.close && <p className="bp-close">{book.close}</p>}
        {q && (
          <Link href={questionHref(q)} className="bp-ask">
            <span className="bp-eyebrow">{cat ? `A question to keep · ${cat.title}` : "A question to keep"}</span>
            <span className="bp-q">{q.text}</span>
            <span className="bp-go">Answer it, just for you →</span>
          </Link>
        )}
        {book.credit && <p className="bp-cap bp-credit">{book.credit}</p>}
      </div>
      {next && <div className="bp-foot"><span>Next: {next.title}</span><span>The end</span></div>}
    </div>
  );
}
