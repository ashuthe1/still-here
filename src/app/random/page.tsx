"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pieces, pieceHref } from "@/lib/content";

export default function RandomPage() {
  const router = useRouter();
  useEffect(() => {
    const p = pieces[Math.floor(Math.random() * pieces.length)];
    router.replace(pieceHref(p));
  }, [router]);
  return <main className="wrap"><p className="empty">Picking one for you…</p></main>;
}
