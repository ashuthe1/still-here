import Link from "next/link";
import DailyQuestion from "@/components/DailyQuestion";
import CategoryGrid from "@/components/CategoryGrid";
import { ArrowRight } from "@/components/Icons";
import ReadyLetters from "@/components/ReadyLetters";
import InstallHint from "@/components/InstallHint";
import Welcome from "@/components/Welcome";
import StartBanner from "@/components/StartBanner";

export default function Home() {
  return (
    <main className="wrap">
      <Welcome />
      <section className="hero">
        <ReadyLetters />
        <DailyQuestion />
      </section>
      <section className="section">
        <StartBanner />
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
