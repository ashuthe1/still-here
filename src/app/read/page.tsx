import type { Metadata } from "next";
import ReadHome from "@/components/ReadHome";

export const metadata: Metadata = { title: "Read", alternates: { canonical: "/" } };

export default function ReadPage() {
  return <ReadHome />;
}
