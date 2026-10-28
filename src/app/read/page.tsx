import Link from "next/link";
import type { Metadata } from "next";
import { themes, themeHref } from "@/lib/content";
import DailyPiece from "@/components/DailyPiece";

export const metadata: Metadata = { title: "Read" };

export default function ReadHome() {
  return (
    <main className="wrap">
      <section className="hero">
        <DailyPiece />
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Where are you right now?</h2>
          <Link href="/random/" className="link-arrow">A random piece</Link>
        </div>
        <div className="grid">
          {themes.map((t) => (
            <Link key={t.key} href={themeHref(t.key)} className="tile" style={{ ["--a" as string]: t.accent }}>
              <div>
                <h3><span className="dot" aria-hidden />{t.title}</h3>
                <p>{t.tagline}</p>
              </div>
              <span className="count">{t.count} pieces</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
