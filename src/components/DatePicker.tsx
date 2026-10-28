"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "./Icons";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** A small calendar in the site's own style. Returns a YYYY-MM-DD string. */
export default function DatePicker({ value, min, onChange }: { value: string; min: Date; onChange: (iso: string) => void }) {
  const selected = value ? new Date(value + "T12:00:00") : null;
  const start = selected ?? min;
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const today = new Date();
  const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.y, view.m, i + 1))];
  while (cells.length % 7) cells.push(null);

  const canGoBack = new Date(view.y, view.m, 1) > new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  const move = (n: number) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const jump = (months: number) => { const d = new Date(today); d.setMonth(d.getMonth() + months); onChange(key(d)); setView({ y: d.getFullYear(), m: d.getMonth() }); };

  return (
    <div className="cal" role="group" aria-label="Choose a date">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Previous month"><ArrowLeft /></button>
        <span className="cal-title">{MONTHS[view.m]} <span className="faint">{view.y}</span></span>
        <button type="button" className="cal-nav" onClick={() => move(1)} aria-label="Next month"><ArrowRight /></button>
      </div>
      <div className="cal-grid">
        {DAYS.map((d) => <span key={d} className="cal-dow">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const disabled = d < minDay;
          const isSel = !!selected && sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <button
              key={i} type="button" disabled={disabled}
              className={`cal-day ${isSel ? "sel" : ""} ${isToday ? "today" : ""}`}
              onClick={() => onChange(key(d))} aria-pressed={isSel} aria-label={d.toDateString()}
            >{d.getDate()}</button>
          );
        })}
      </div>
      <div className="cal-quick">
        <button type="button" onClick={() => jump(1)}>a month</button>
        <button type="button" onClick={() => jump(3)}>three</button>
        <button type="button" onClick={() => jump(6)}>six</button>
        <button type="button" onClick={() => jump(12)}>a year</button>
        <button type="button" onClick={() => jump(24)}>two years</button>
      </div>
    </div>
  );
}
