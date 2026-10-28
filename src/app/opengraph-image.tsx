import { ogImage, OG_SIZE } from "@/lib/og";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Still Here";
export default function Image() {
  return ogImage({ eyebrow: "Ask & Find", text: "One gentle question a day. Write privately, know yourself better.", sub: "Everything you write stays on your device.", accent: "#c9a66b" });
}
