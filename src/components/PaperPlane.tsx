/** A small paper plane for letters that go back in time. */
export default function PaperPlane() {
  return (
    <svg className="plane" viewBox="0 0 64 48" aria-hidden>
      <path className="plane-body" d="M2 22 L62 4 L40 46 L30 30 Z" />
      <path className="plane-fold" d="M30 30 L62 4 L24 26 Z" />
      <path className="plane-line" d="M2 22 L30 30" />
    </svg>
  );
}
