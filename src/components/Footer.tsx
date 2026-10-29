import Link from "next/link";
import { GitHub } from "./Icons";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-left">
        <span>Still Here. Everything you write stays on this device.</span>
        <a className="oss" href="https://github.com/ashuthe1/still-here" target="_blank" rel="noopener noreferrer">
          <GitHub /> Open source on GitHub
        </a>
      </div>
      <nav>
        <Link href="/ask/start/">Start here</Link>
        <Link href="/read/">Read</Link>
        <Link href="/me/">Yours</Link>
        <Link href="/about/">About</Link>
        <Link href="/privacy/">Privacy</Link>
      </nav>
    </footer>
  );
}
