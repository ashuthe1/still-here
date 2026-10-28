"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAll } from "@/lib/answers";

/** On a question page, for someone arriving from a shared card: one quiet line, once. */
export default function FirstVisitNote() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("sh-qnote") || localStorage.getItem("sh-welcomed")) return;
      if (Object.keys(getAll()).length) return;
      setShow(true);
      localStorage.setItem("sh-qnote", "1");
    } catch {}
  }, []);
  if (!show) return null;
  return (
    <p className="first-note">
      <span className="dot" aria-hidden /> New here? Still Here asks one gentle question a day. Whatever you write stays on this phone.
      {" "}<Link href="/">See how it works</Link>
    </p>
  );
}
