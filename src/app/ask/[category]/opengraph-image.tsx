import { ogImage, OG_SIZE } from "@/lib/og";
import { categories, getCategory } from "@/lib/content";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A set of questions from Still Here";
export function generateStaticParams() { return categories.map((c) => ({ category: c.key })); }
export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const c = getCategory((await params).category);
  return ogImage({ eyebrow: `${c?.count ?? ""} questions`, text: c?.title ?? "Still Here", sub: c?.tagline, accent: c?.accent ?? "#c9a66b" });
}
