"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pieces, pieceHref } from "@/lib/content";
import { hiddenPieces, randomVisible } from "@/lib/hidden";

export default function RandomPage() {
  const router = useRouter();
  useEffect(() => {
    const p = randomVisible(pieces, new Set(hiddenPieces()));
    router.replace(p ? pieceHref(p) : "/read/");
  }, [router]);
  return <main className="wrap"><p className="empty">Picking one for you…</p></main>;
}
