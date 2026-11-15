import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook, bookHref } from "@/lib/content";
import BookReader from "@/components/BookReader";
import { MotifDefs, kindLabel } from "@/components/BookPage";

export function generateStaticParams() { return books.map((b) => ({ slug: b.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBook(slug);
  if (!b) return {};
  return { title: b.title, description: b.hook, alternates: { canonical: bookHref(b) } };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBook(slug);
  if (!b) notFound();
  const i = books.findIndex((x) => x.slug === b.slug);
  const next = books[(i + 1) % books.length];
  return (
    <main className="wrap book" style={{ ["--accent" as string]: b.accent }}>
      <MotifDefs />
      <div className="piece-top">
        <Link href="/books/" className="crumb"><span className="dot" aria-hidden />Books</Link>
        <span className="faint" style={{ fontSize: "0.8rem" }}>{kindLabel(b)}</span>
      </div>
      <h1 className="sr-only">{b.title}</h1>
      <BookReader book={b} next={next.slug === b.slug ? undefined : next} />
    </main>
  );
}
