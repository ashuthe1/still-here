import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ftr">
      <span>Still Here. Everything you write stays on this device.</span>
      <nav>
        <Link href="/ask/start/">Start here</Link>
        <Link href="/read/">Read</Link>
        <Link href="/me/">Yours</Link>
        <Link href="/about/">About</Link>
      </nav>
    </footer>
  );
}
