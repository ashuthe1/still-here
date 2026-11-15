import { ogImage, OG_SIZE } from "@/lib/og";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Still Here";
export default function Image() {
  return ogImage({ eyebrow: "Ask & Find", text: "One thoughtful question a day. Write privately, see what matters.", sub: "Everything you write stays on your device.", accent: "#c9a66b" });
}
