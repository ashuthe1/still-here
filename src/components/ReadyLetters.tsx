"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sealedLetters, isReady, formatDate, daysUntil } from "@/lib/answers";
import { getQuestionById, questionHref } from "@/lib/content";
import { Envelope, ArrowRight } from "./Icons";

/** On the home page: a letter that is ready to open, or the next one coming. */
export default function ReadyLetters() {
  const [item, setItem] = useState<{ href: string; ready: boolean; when: string; days: number } | null>(null);
  useEffect(() => {
    const all = sealedLetters();
    if (!all.length) return;
    const ready = all.find((l) => isReady(l.entry));
    const pick = ready || all[0];
    const q = getQuestionById(pick.id);
    if (!q) return;
    setItem({ href: questionHref(q), ready: !!ready, when: formatDate(pick.entry.sealedUntil!), days: daysUntil(pick.entry.sealedUntil!) });
  }, []);
  if (!item) return null;
  return (
    <Link href={item.href} className={`letter-banner ${item.ready ? "ready" : ""}`}>
      <span className="env-icon"><Envelope /></span>
      <span className="letter-text">
        {item.ready ? <b>A letter you wrote to yourself is ready to open.</b> : <b>You have a sealed letter.</b>}
        <span className="muted">{item.ready ? `You sealed it until ${item.when}. The day has come.` : `It opens ${item.when}, in ${item.days} day${item.days === 1 ? "" : "s"}.`}</span>
      </span>
      <ArrowRight />
    </Link>
  );
}
