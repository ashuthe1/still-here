/** A small drawn envelope. `open` lifts the flap and slides the letter out. */
export default function EnvelopeArt({ open = false, ready = false }: { open?: boolean; ready?: boolean }) {
  return (
    <svg className={`env-art ${open ? "open" : ""} ${ready ? "ready" : ""}`} viewBox="0 0 160 116" aria-hidden>
      <rect className="env-back" x="8" y="30" width="144" height="80" rx="9" />
      <g className="env-letter">
        <rect x="26" y="24" width="108" height="72" rx="4" />
        <line x1="42" y1="44" x2="118" y2="44" />
        <line x1="42" y1="56" x2="104" y2="56" />
        <line x1="42" y1="68" x2="112" y2="68" />
      </g>
      <path className="env-front" d="M8 40 L80 88 L152 40 L152 101 Q152 110 143 110 L17 110 Q8 110 8 101 Z" />
      <path className="env-flap" d="M8 40 L80 84 L152 40 L152 36 Q152 30 146 30 L14 30 Q8 30 8 36 Z" />
      <g className="env-seal">
        <circle cx="80" cy="82" r="12" />
        <circle cx="80" cy="82" r="4.5" className="env-seal-dot" />
      </g>
    </svg>
  );
}
