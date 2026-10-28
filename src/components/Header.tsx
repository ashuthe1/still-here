"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, Sun, Moon } from "./Icons";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const path = usePathname() || "/";
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("sh-theme", next); } catch {}
    setTheme(next);
  }
  const onRead = path.startsWith("/read") || path.startsWith("/t/");
  const onAsk = !onRead && !path.startsWith("/me") && !path.startsWith("/about");
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
        <Link href="/me/" className="icon-btn" title="Your answers and saved pieces" aria-label="Your answers and saved pieces"><Bookmark /></Link>
        <button className="icon-btn" onClick={toggle} title={theme === "dark" ? "Light mode" : "Dark mode"} aria-label="Toggle light and dark">
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  );
}
