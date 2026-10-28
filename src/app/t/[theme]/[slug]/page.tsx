import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pieces, getTheme, getPiece, piecesFor, pieceHref, themeHref, headline, headlineAuthor } from "@/lib/content";
import PieceBody from "@/components/PieceBody";
import PieceActions from "@/components/PieceActions";
import { ArrowLeft, ArrowRight } from "@/components/Icons";

export function generateStaticParams() { return pieces.map((p) => ({ theme: p.theme, slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ theme: string; slug: string }> }): Promise<Metadata> {
  const { theme, slug } = await params;
  const p = getPiece(theme, slug);
  if (!p) return {};
  const text = headline(p).slice(0, 140);
  return { title: p.title || `${headlineAuthor(p)}`, description: text };
}

export default async function PiecePage({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme, slug } = await params;
  const t = getTheme(theme);
  const p = getPiece(theme, slug);
  if (!t || !p) notFound();
  const list = piecesFor(theme);
  const i = list.findIndex((x) => x.id === p.id);
  const prev = i > 0 ? list[i - 1] : undefined;
  const next = i < list.length - 1 ? list[i + 1] : undefined;
  return (
    <main className="wrap piece" style={{ ["--accent" as string]: t.accent }}>
      <div className="piece-top">
        <Link href={themeHref(t.key)} className="crumb"><span className="dot" aria-hidden />{t.title}</Link>
        <span className="faint" style={{ fontSize: "0.8rem" }}>{i + 1} / {list.length}</span>
      </div>
      <div>
        <PieceBody piece={p} themeTitle={t.title} />
        <div className="piece-main" style={{ paddingTop: 0, animation: "none" }}>
          <PieceActions piece={p} accent={t.accent} prevHref={prev && pieceHref(prev)} nextHref={next && pieceHref(next)} />
        </div>
      </div>
      <nav className="piece-nav" aria-label="Previous and next">
        {prev ? <Link href={pieceHref(prev)} className="n prev"><ArrowLeft /><span>{prev.title || headlineAuthor(prev)}</span></Link> : <span className="n" />}
        <span className="mid">← →</span>
        {next ? <Link href={pieceHref(next)} className="n next"><span>{next.title || headlineAuthor(next)}</span><ArrowRight /></Link> : <span className="n" />}
      </nav>
    </main>
  );
}
