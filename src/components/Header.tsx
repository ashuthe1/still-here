"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, Sun, Moon, Search } from "./Icons";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const path = usePathname() || "/";
  useEffect(() => {
    const t = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(t);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f7f3ec" : "#0f0e0c");
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); window.location.href = "/search/"; }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f7f3ec" : "#0f0e0c");
    try { localStorage.setItem("sh-theme", next); } catch {}
    setTheme(next);
  }
  const onRead = path.startsWith("/read") || path.startsWith("/t/");
  const onAsk = !onRead && !path.startsWith("/me") && !path.startsWith("/about") && !path.startsWith("/search");
  return (
    <header className="hdr">
      <Link href="/" className="wordmark" aria-label="Still Here, home">
        <span className="dot" aria-hidden />
        Still Here
      </Link>
      <nav className="nav" aria-label="Sections">
        <Link href="/" className={onAsk ? "on" : ""}>Ask &amp; Find</Link>
        <Link href="/read/" className={onRead ? "on" : ""}>Read</Link>
      </nav>
      <div className="hdr-actions">
        <Link href="/search/" className="icon-btn" title="Search" aria-label="Search"><Search /></Link>
        <Link href="/me/" className="icon-btn" title="Your answers and saved pieces" aria-label="Your answers and saved pieces"><Bookmark /></Link>
        <button className="icon-btn" onClick={toggle} title={theme === "dark" ? "Light mode" : "Dark mode"} aria-label="Toggle light and dark">
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  );
}
