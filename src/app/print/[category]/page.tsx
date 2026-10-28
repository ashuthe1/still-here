import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, questionsFor } from "@/lib/content";
import PrintBooklet from "@/components/PrintBooklet";

export function generateStaticParams() { return categories.map((c) => ({ category: c.key })); }
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const c = getCategory((await params).category);
  return { title: `Print: ${c?.title ?? ""}` };
}

export default async function PrintPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  return <PrintBooklet category={c} questions={questionsFor(category)} />;
}
