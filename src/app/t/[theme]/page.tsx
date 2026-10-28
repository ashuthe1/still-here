import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { themes, getTheme, piecesFor, pieceHref, themeHref, headline, headlineAuthor, paragraphs } from "@/lib/content";

export function generateStaticParams() { return themes.map((t) => ({ theme: t.key })); }

export async function generateMetadata({ params }: { params: Promise<{ theme: string }> }): Promise<Metadata> {
  const t = getTheme((await params).theme);
  return { title: t?.title ?? "Still Here", description: t?.tagline, alternates: t ? { canonical: themeHref(t.key) } : undefined };
}

const KIND = { line: "Line", reflection: "Reflection", letter: "Letter" } as const;

export default async function ThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  const t = getTheme(theme);
  if (!t) notFound();
  const list = piecesFor(theme);
  return (
    <main className="wrap" style={{ ["--accent" as string]: t.accent }}>
      <section className="theme-hero">
        <div className="eyebrow"><b>Room {String(t.order).padStart(2, "0")}</b> &nbsp;·&nbsp; {t.count} pieces</div>
        <h1>{t.title}</h1>
        <p className="tagline">{t.tagline}</p>
        <div className="intro">{paragraphs(t.intro).map((p, i) => <p key={i}>{p}</p>)}</div>
      </section>
      <section className="list">
        {list.map((p) => {
          const original = headlineAuthor(p) === "Still Here";
          return (
            <Link key={p.id} href={pieceHref(p)} className="row">
              <span className={`kind ${p.type}`}>{KIND[p.type]}</span>
              <div>
                <p className={`text ${p.type === "letter" ? "letter" : ""}`}>{headline(p)}</p>
                <div className="who">
                  {original ? <b>{p.title}</b> : <><b>{headlineAuthor(p)}</b>{p.type === "reflection" && p.title ? <> &nbsp;·&nbsp; {p.title}</> : null}</>}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
