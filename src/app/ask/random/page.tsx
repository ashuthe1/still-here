"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { questions, questionHref } from "@/lib/content";

export default function RandomQuestion() {
  const router = useRouter();
  useEffect(() => {
    const q = questions[Math.floor(Math.random() * questions.length)];
    router.replace(questionHref(q));
  }, [router]);
  return <main className="wrap"><p className="empty">Finding one for you…</p></main>;
}
