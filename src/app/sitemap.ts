import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { themes, pieces, categories, questions, themeHref, pieceHref, categoryHref, questionHref } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") =>
    ({ url: `${SITE_URL}${path}`, priority, changeFrequency });
  return [
    at("/", 1, "daily"),
    at("/read/", 0.8, "weekly"),
    at("/ask/start/", 0.8),
    at("/about/", 0.5),
    at("/privacy/", 0.3),
    ...categories.map((c) => at(categoryHref(c.key), 0.7)),
    ...questions.map((q) => at(questionHref(q), 0.6)),
    ...themes.map((t) => at(themeHref(t.key), 0.6)),
    ...pieces.map((p) => at(pieceHref(p), 0.5)),
  ];
}
