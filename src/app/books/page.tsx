import type { Metadata } from "next";
import Link from "next/link";
import Redirect from "@/components/Redirect";

// Books were renamed Bytes. Old links land here and move on.
export const metadata: Metadata = { title: "Bytes", robots: { index: false }, alternates: { canonical: "/bytes/" } };

export default function OldBooks() {
  return (
    <main className="wrap page">
      <Redirect to="/bytes/" />
      <p className="muted">Books are now called Bytes. <Link className="u" href="/bytes/">Take me there</Link>.</p>
    </main>
  );
}
