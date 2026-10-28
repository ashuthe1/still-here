import Link from "next/link";
export default function NotFound() {
  return (
    <main className="wrap page">
      <h1>Not here.</h1>
      <p>That page does not exist. <Link className="u" href="/">Go home</Link>, or <Link className="u" href="/random/">read something at random</Link>.</p>
    </main>
  );
}
