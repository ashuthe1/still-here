"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initNative, syncStatusBar, isNative } from "@/lib/native";

export default function Native() {
  const router = useRouter();
  useEffect(() => {
    initNative();
    // The Android shell serves the home page for any folder path it is asked for directly
    // (a reload, or a link opening the app), and the router caches it under that address.
    // A refresh fetches the real page for the current address.
    if (isNative() && window.location.pathname !== "/" && document.querySelector("[data-home]")) {
      router.refresh();
    }
    const obs = new MutationObserver(() => { syncStatusBar(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, [router]);
  return null;
}
