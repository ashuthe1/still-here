"use client";
import { useEffect } from "react";
import { initNative, syncStatusBar } from "@/lib/native";

export default function Native() {
  useEffect(() => {
    initNative();
    const obs = new MutationObserver(() => { syncStatusBar(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return null;
}
