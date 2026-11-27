import { Link } from "react-router-dom";

// Brand logo: an olive leaf shaped like a clothes hanger + two-line wordmark.
// Used in the Navbar and Footer. Change `size` to scale the mark.
export default function Logo({ size = 40, className = "" }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Olive Wear home">
      <svg className="logo-mark" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="logoLeaf" x1="8" y1="14" x2="42" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d8e6a0" />
            <stop offset="1" stopColor="#6b7f3a" />
          </linearGradient>
        </defs>
        <circle className="logo-ring" cx="24" cy="24" r="22.5" />
        <path className="logo-hook" d="M24 12 C24 7.5 29.5 7.5 29.5 11.5 C29.5 14.5 24 14.5 24 18" />
        <path d="M24 18 C34 21 40 29 38.5 35 C32 37 16 37 9.5 35 C8 29 14 21 24 18 Z" fill="url(#logoLeaf)" />
        <path
          d="M24 21 V34 M24 26 L19 23.5 M24 30 L17.5 27.5 M24 26 L29 23.5 M24 30 L30.5 27.5"
          stroke="#0b0e08" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"
        />
      </svg>
      <span className="logo-text">
        <b>Olive</b>
        <i>Wear</i>
      </span>
    </Link>
  );
}
