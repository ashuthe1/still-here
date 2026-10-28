"use client";
import type { CardSize } from "@/lib/card";

/** Feed (4:5) or Story (9:16). */
export default function ShapeToggle({ value, onChange }: { value: CardSize; onChange: (v: CardSize) => void }) {
  return (
    <div className="shape-toggle" role="radiogroup" aria-label="Image shape">
      <button type="button" role="radio" aria-checked={value === "feed"} className={value === "feed" ? "on" : ""} onClick={() => onChange("feed")}>
        <span className="shape feed" aria-hidden /> Feed
      </button>
      <button type="button" role="radio" aria-checked={value === "story"} className={value === "story" ? "on" : ""} onClick={() => onChange("story")}>
        <span className="shape story" aria-hidden /> Story
      </button>
    </div>
  );
}
