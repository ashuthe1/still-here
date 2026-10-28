import { ogImage, OG_SIZE } from "@/lib/og";
import { themes, getTheme } from "@/lib/content";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A room on the Still Here shelf";
export function generateStaticParams() { return themes.map((t) => ({ theme: t.key })); }
export default async function Image({ params }: { params: Promise<{ theme: string }> }) {
  const t = getTheme((await params).theme);
  return ogImage({ eyebrow: `Read · ${t?.count ?? ""} pieces`, text: t?.title ?? "Still Here", sub: t?.tagline, accent: t?.accent ?? "#c9a66b" });
}
