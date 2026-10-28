import Link from "next/link";
import DailyQuestion from "@/components/DailyQuestion";
import CategoryGrid from "@/components/CategoryGrid";
import { ArrowRight } from "@/components/Icons";
import { startPath } from "@/lib/content";
import ReadyLetters from "@/components/ReadyLetters";
import InstallHint from "@/components/InstallHint";
import Welcome from "@/components/Welcome";

export default function Home() {
  return (
    <main className="wrap">
      <Welcome />
      <section className="hero">
        <ReadyLetters />
        <DailyQuestion />
      </section>
      <section className="section">
        <Link href="/ask/start/" className="start-banner">
          <div>
            <div className="eyebrow"><b>New here?</b></div>
            <h2>Start with {startPath.length} questions</h2>
            <p>A gentle first pass across every part of your life. Twenty minutes, or a week of evenings.</p>
          </div>
          <ArrowRight />
        </Link>
        <div className="section-head" style={{ marginTop: 40 }}>
          <h2>Or pick a place to begin</h2>
          <span className="faint" style={{ fontSize: "0.85rem" }}>One question at a time</span>
        </div>
        <CategoryGrid />
        <InstallHint />
        <p className="promise">
          Everything you write stays on this device. No account, nothing sent anywhere, and you can export it all as one file whenever you like.
        </p>
      </section>
    </main>
  );
}
