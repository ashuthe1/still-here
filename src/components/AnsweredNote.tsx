"use client";
import { useEffect, useState } from "react";
import { getEntries, isSealed, formatDate } from "@/lib/answers";

/** Under the question: "You answered this 3 days ago", before the reader scrolls to the entries. */
export default function AnsweredNote({ id }: { id: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const es = getEntries(id).filter((e) => !isSealed(e));
    if (!es.length) return;
    const last = new Date(es[0].t);
    const days = Math.floor((Date.now() - last.getTime()) / 86400000);
    const when = days === 0 ? "today" : days === 1 ? "yesterday" : days < 30 ? `${days} days ago` : `on ${formatDate(es[0].t)}`;
    setText(es.length === 1 ? `You answered this ${when}.` : `You have answered this ${es.length} times, last ${when}.`);
  }, [id]);
  if (!text) return null;
  return <p className="answered-note"><span className="dot" aria-hidden />{text} Scroll down to read it, or write again.</p>;
}
