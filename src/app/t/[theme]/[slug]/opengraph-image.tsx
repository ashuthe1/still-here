import { ogImage, OG_SIZE } from "@/lib/og";
import { pieces, getTheme, getPiece, headline, headlineAuthor } from "@/lib/content";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A line from Still Here";
export function generateStaticParams() { return pieces.map((p) => ({ theme: p.theme, slug: p.slug })); }
export default async function Image({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme, slug } = await params;
  const p = getPiece(theme, slug); const t = getTheme(theme);
  if (!p) return ogImage({ eyebrow: "Read", text: "Still Here", accent: "#c9a66b" });
  const author = headlineAuthor(p);
  const original = author === "Still Here";
  const text = headline(p).split(/\n\s*\n/)[0];
  return ogImage({ eyebrow: t?.title ?? "Read", text: text.length > 300 ? text.slice(0, 300).replace(/\s+\S*$/, "") + "…" : text, sub: original ? p.title : author, accent: t?.accent ?? "#c9a66b", quoted: !original });
}
