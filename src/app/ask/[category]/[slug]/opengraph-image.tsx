import { ogImage, OG_SIZE } from "@/lib/og";
import { questions, getCategory, getQuestion } from "@/lib/content";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A question from Still Here";
export function generateStaticParams() { return questions.map((q) => ({ category: q.cat, slug: q.slug })); }
export default async function Image({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const q = getQuestion(category, slug); const c = getCategory(category);
  return ogImage({ eyebrow: c?.title ?? "Ask & Find", text: q?.text ?? "Still Here", sub: q?.why, accent: c?.accent ?? "#c9a66b" });
}
