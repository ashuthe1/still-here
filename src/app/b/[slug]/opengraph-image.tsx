import { ogImage, OG_SIZE } from "@/lib/og";
import { books, getBook } from "@/lib/content";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A byte from Still Here";
export function generateStaticParams() { return books.map((b) => ({ slug: b.slug })); }
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBook(slug);
  if (!b) return ogImage({ eyebrow: "Bytes", text: "Still Here", accent: "#c9a66b" });
  return ogImage({ eyebrow: "A byte from Still Here", text: b.title, sub: b.hook, accent: b.accent });
}
