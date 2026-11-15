"use client";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/bytes";

/** A small "Read" tag on a byte's cover once it has been read to the end. */
export default function ReadMark({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => { setDone(!!getProgress()[slug]?.done); }, [slug]);
  return done ? <span className="read-mark">Read ✓</span> : null;
}
