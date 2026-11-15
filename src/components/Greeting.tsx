"use client";
import { useEffect, useState } from "react";

/** A greeting that knows the time of day, set on the device so it is the reader's own evening. */
export default function Greeting() {
  const [g, setG] = useState<{ hi: string; sub: string } | null>(null);
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5) setG({ hi: "Still up?", sub: "Something short and quiet, then sleep." });
    else if (h < 12) setG({ hi: "Good morning.", sub: "Something small to read with your tea." });
    else if (h < 17) setG({ hi: "Good afternoon.", sub: "A few minutes away from everything." });
    else if (h < 21) setG({ hi: "Good evening.", sub: "Something for the next few minutes." });
    else setG({ hi: "Good night.", sub: "One small read before the day ends." });
  }, []);
  return (
    <div className="greeting" aria-live="polite">
      <h1 className="serif">{g?.hi ?? " "}</h1>
      <p className="muted">{g?.sub ?? " "}</p>
    </div>
  );
}
