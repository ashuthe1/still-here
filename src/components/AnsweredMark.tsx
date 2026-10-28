"use client";
import { useEffect, useState } from "react";
import { getEntries, formatDate } from "@/lib/answers";

export default function AnsweredMark({ id }: { id: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const e = getEntries(id);
    if (e.length) setLabel(e.length === 1 ? `Answered ${formatDate(e[0].t)}` : `${e.length} answers · last ${formatDate(e[0].t)}`);
  }, [id]);
  if (!label) return null;
  return <span className="answered">{label}</span>;
}
