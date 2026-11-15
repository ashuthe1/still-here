"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dailyPool, questionHref } from "@/lib/content";
import { hiddenQuestions, randomVisible } from "@/lib/hidden";

export default function RandomQuestion() {
  const router = useRouter();
  useEffect(() => {
    const q = randomVisible(dailyPool, new Set(hiddenQuestions()));
    router.replace(q ? questionHref(q) : "/");
  }, [router]);
  return <main className="wrap"><p className="empty">Finding one for you…</p></main>;
}
