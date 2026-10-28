import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { questions, getCategory, getQuestion, questionsFor, questionHref, categoryHref, getPieceById, headline, headlineAuthor, pieceHref } from "@/lib/content";
import QuestionEditor from "@/components/QuestionEditor";
import { ArrowLeft, ArrowRight } from "@/components/Icons";

export function generateStaticParams() { return questions.map((q) => ({ category: q.cat, slug: q.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params;
  const q = getQuestion(category, slug);
  if (!q) return {};
  const short = q.text.length > 64 ? q.text.slice(0, 64).replace(/\s+\S*$/, "") + "…" : q.text;
  return { title: short, description: q.why, alternates: { canonical: questionHref(q) } };
}

export default async function QuestionPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const c = getCategory(category);
  const q = getQuestion(category, slug);
  if (!c || !q) notFound();
  const list = questionsFor(category);
  const i = list.findIndex((x) => x.id === q.id);
  const prev = i > 0 ? list[i - 1] : undefined;
  const next = i < list.length - 1 ? list[i + 1] : undefined;
  const piece = q.read ? getPieceById(q.read) : undefined;
  return (
    <main className="wrap piece" style={{ ["--accent" as string]: c.accent }}>
      <div className="piece-top">
        <Link href={categoryHref(c.key)} className="crumb"><span className="dot" aria-hidden />{c.title}</Link>
        <span className="faint" style={{ fontSize: "0.8rem" }}>{i + 1} / {list.length}</span>
      </div>
      <div>
        <article className="piece-main">
          <div className="eyebrow"><b>A question</b> &nbsp;·&nbsp; {c.title}</div>
          <h1 className="quote q-text">{q.text}</h1>
          {q.why && <p className="why">{q.why}</p>}
          <QuestionEditor question={q} accent={c.accent} categoryTitle={c.title} nextHref={next ? questionHref(next) : "/ask/random/"} />
          {piece && (
            <aside className="read-with">
              <span className="eyebrow">Read with this</span>
              <Link href={pieceHref(piece)} className="read-with-card">
                <p className="serif">{headline(piece).split(/\n\s*\n/)[0]}</p>
                <span className="muted">{headlineAuthor(piece) === "Still Here" ? piece.title : headlineAuthor(piece)}</span>
              </Link>
            </aside>
          )}
        </article>
      </div>
      <nav className="piece-nav" aria-label="Previous and next">
        {prev ? <Link href={questionHref(prev)} className="n prev"><ArrowLeft /><span><small>Previous</small>{prev.text}</span></Link> : <span className="n" />}
        <span className="mid" aria-hidden>{i + 1} / {list.length}</span>
        {next ? <Link href={questionHref(next)} className="n next"><span><small>Next</small>{next.text}</span><ArrowRight /></Link> : <span className="n" />}
      </nav>
    </main>
  );
}
