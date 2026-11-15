"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Sends the reader on to a new address, keeping any #part of the old one. */
export default function Redirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => { router.replace(to + window.location.hash); }, [router, to]);
  return null;
}
