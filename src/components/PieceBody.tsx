import type { Piece } from "@/lib/content";
import { paragraphs } from "@/lib/content";

const KIND: Record<Piece["type"], string> = { line: "A line", reflection: "A reflection", letter: "A letter" };

export default function PieceBody({ piece, themeTitle }: { piece: Piece; themeTitle: string }) {
  const isRefl = piece.type === "reflection";
  const isLetter = piece.type === "letter";
  const quoteText = isRefl ? piece.quote : piece.body;
  return (
    <article className="piece-main">
      <div className="eyebrow"><b>{KIND[piece.type]}</b> &nbsp;·&nbsp; {themeTitle}</div>
      {isLetter && piece.title && <p className="piece-title">{piece.title}</p>}
      <div className={`quote ${isLetter ? "letter" : "q"}`}>
        {paragraphs(quoteText).map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {isRefl ? (
        <>
          <div className="attrib">
            <span className="name">{piece.quoteAuthor}</span>
            {piece.quoteSource && <span className="src">{piece.quoteSource}</span>}
          </div>
          <div className="reflect">
            {piece.title && <p className="piece-title">{piece.title}</p>}
            {paragraphs(piece.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </>
      ) : (
        <div className="attrib">
          <span className="name">{piece.author}</span>
          {piece.source && (piece.url
            ? <a className="src" href={piece.url} target="_blank" rel="noopener noreferrer">{piece.source} ↗</a>
            : <span className="src">{piece.source}</span>)}
        </div>
      )}
      {piece.note && (
        <aside className="note">
          <span className="eyebrow">Why this one</span>
          {piece.note}
        </aside>
      )}
    </article>
  );
}
