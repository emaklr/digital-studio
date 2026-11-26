import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Abeeb Digital Studio home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 72 52" role="img">
          <path fill="#1595f6" d="M2 46 23 5 44 46H30l-7-14-7 14H2Z" />
          <path fill="#0764c8" d="M37 5h17c10 0 16 5 16 13 0 6-3 10-9 12 7 1 10 5 10 11 0 9-7 11-18 11H37V5Zm13 10v10h4c4 0 6-2 6-5s-2-5-6-5h-4Zm0 20v8h5c4 0 6-2 6-4s-2-4-6-4h-5Z" />
        </svg>
      </span>
      <span className="brand-name">ABEEB<span>Digital Studio</span></span>
    </Link>
  );
}
