// Link preview images, rendered at build time with next/og (satori).
import { ImageResponse } from "next/og";
import { SITE_HOST } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

const FRAUNCES = "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIc6RujDg.ttf";
const INTER = "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf";

let fontsPromise: Promise<{ name: string; data: ArrayBuffer; weight: 300 | 500; style: "normal" }[]> | null = null;
export function ogFonts() {
  fontsPromise ??= Promise.all([
    fetch(FRAUNCES).then((r) => r.arrayBuffer()),
    fetch(INTER).then((r) => r.arrayBuffer()),
  ]).then(([f, i]) => [
    { name: "Fraunces", data: f, weight: 300 as const, style: "normal" as const },
    { name: "Inter", data: i, weight: 500 as const, style: "normal" as const },
  ]);
  return fontsPromise;
}

export interface OgProps {
  eyebrow: string;     // category or room
  text: string;        // the question or the line
  sub?: string;        // why-line or author
  accent: string;
  quoted?: boolean;
}

function sizeFor(text: string): number {
  const n = text.length;
  if (n < 60) return 68;
  if (n < 110) return 56;
  if (n < 170) return 46;
  if (n < 240) return 40;
  return 34;
}

export async function ogImage({ eyebrow, text, sub, accent, quoted }: OgProps) {
  const fonts = await ogFonts();
  const size = sizeFor(text);
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "64px 72px", background: "#0f0e0c", color: "#ece6da", fontFamily: "Fraunces",
        backgroundImage: `radial-gradient(circle at 92% 6%, ${accent}66 0%, rgba(15,14,12,0) 55%)`,
      }}>
        <div style={{ display: "flex", fontFamily: "Inter", fontSize: 22, letterSpacing: 4, color: accent, textTransform: "uppercase" }}>{eyebrow}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: size, lineHeight: 1.22, letterSpacing: -0.5 }}>{quoted ? `“${text}”` : text}</div>
          {sub && <div style={{ display: "flex", fontFamily: "Inter", fontSize: 24, color: "#a9a195", lineHeight: 1.4 }}>{sub}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Inter", fontSize: 24, color: "#a9a195" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: accent }} />
            <span style={{ fontFamily: "Fraunces", fontSize: 30 }}>Still Here</span>
          </div>
          <span style={{ fontSize: 22, color: "#6f685e" }}>{SITE_HOST}</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
