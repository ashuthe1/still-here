import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, questionsFor, questionHref, paragraphs } from "@/lib/content";
import AnsweredMark from "@/components/AnsweredMark";
import { Printer } from "@/components/Icons";

export function generateStaticParams() { return categories.map((c) => ({ category: c.key })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const c = getCategory((await params).category);
  return { title: c?.title ?? "Still Here", description: c?.tagline };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const list = questionsFor(category);
  return (
    <main className="wrap" style={{ ["--accent" as string]: c.accent }}>
      <section className="theme-hero">
        <div className="eyebrow"><b>Ask &amp; Find</b> &nbsp;·&nbsp; {c.count} questions</div>
        <h1>{c.title}</h1>
        <p className="tagline">{c.tagline}</p>
        <div className="intro">{paragraphs(c.intro).map((p, i) => <p key={i}>{p}</p>)}</div>
        <div className="row-actions" style={{ marginTop: 28 }}>
          <Link href={questionHref(list[0])} className="btn">Begin with the first</Link>
          <Link href={`/print/${c.key}/`} className="pill"><Printer /> Print as a booklet</Link>
        </div>
      </section>
      <section className="list">
        {list.map((q, i) => (
          <Link key={q.id} href={questionHref(q)} className="row">
            <span className="kind">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="text">{q.text}</p>
              <div className="who"><span className="muted">{q.why}</span> <AnsweredMark id={q.id} /></div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
