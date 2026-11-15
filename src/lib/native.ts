// The thin bridge to the native shell. Every function is a no-op in a plain browser.
import { Capacitor } from "@capacitor/core";
import { SITE_URL } from "./site";

export function isNative(): boolean {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Shares an image through the native sheet. Returns false in a browser so the caller can fall back. */
export async function shareBlob(blob: Blob, name: string): Promise<boolean> {
  if (!isNative()) return false;
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");
  const data = await blobToBase64(blob);
  const written = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
  await Share.share({ files: [written.uri], dialogTitle: "Still Here" });
  return true;
}

/** Saves a text file to the phone's Documents and offers to send it on. Returns false in a browser. */
export async function saveText(name: string, text: string): Promise<boolean> {
  if (!isNative()) return false;
  const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");
  const written = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true });
  try { await Share.share({ files: [written.uri], dialogTitle: "Still Here backup" }); } catch {}
  return true;
}

export async function haptic(kind: "light" | "medium" | "success" = "light") {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "success") await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: kind === "light" ? ImpactStyle.Light : ImpactStyle.Medium });
  } catch {}
}

export async function syncStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const light = document.documentElement.dataset.theme === "light";
    await StatusBar.setBackgroundColor({ color: light ? "#f7f3ec" : "#0f0e0c" });
    await StatusBar.setStyle({ style: light ? Style.Light : Style.Dark });
  } catch {}
}

/** The in-app path for a public link, or null if the link is not ours. */
export function pathFromLink(link: string): string | null {
  try {
    const u = new URL(link);
    if (u.hostname !== new URL(SITE_URL).hostname) return null;
    return (u.pathname || "/") + u.search;
  } catch { return null; }
}

/** Runs once at start-up in the app: back button walks history, splash goes away, status bar matches the theme. */
export async function initNative(openPath?: (path: string) => void) {
  if (!isNative()) return;
  try {
    const { App } = await import("@capacitor/app");
    // a link tapped elsewhere while the app is running
    App.addListener("appUrlOpen", ({ url }) => { const p = pathFromLink(url); if (p && openPath) openPath(p); });
    // a link that launched the app from cold
    const launch = await App.getLaunchUrl();
    const p = launch?.url ? pathFromLink(launch.url) : null;
    if (p && p !== "/" && openPath) openPath(p);
  } catch {}
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && window.location.pathname !== "/") window.history.back();
      else App.minimizeApp();
    });
  } catch {}
  await syncStatusBar();
  try { const { SplashScreen } = await import("@capacitor/splash-screen"); await SplashScreen.hide(); } catch {}
}

/** The public address of the current page, even inside the app, so the recipient gets the preview card. */
export function publicUrl(): string {
  if (typeof window === "undefined") return SITE_URL;
  const path = window.location.pathname.endsWith("/") ? window.location.pathname : window.location.pathname + "/";
  return SITE_URL + path;
}

/**
 * Shares only the page's public address, no text: native sheet in the app, the system sheet on phones, the clipboard on laptops.
 * Returns what happened so the caller can say so.
 */
export async function shareLink(): Promise<"shared" | "copied" | "failed"> {
  const url = publicUrl();
  try {
    if (isNative()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ url, dialogTitle: "Send the link" });
      return "shared";
    }
    const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
    if (phone && navigator.share) {
      await navigator.share({ url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (e) {
    // closing the share sheet is not a failure
    if (e instanceof Error && /abort|cancel/i.test(e.name + e.message)) return "shared";
    try { await navigator.clipboard.writeText(url); return "copied"; } catch { return "failed"; }
  }
}
