import { useEffect, useState } from "react";
import { heroImages } from "../data/static";
import SafeImage from "./SafeImage";

const letters = "OliveWear".split("");

// Full-screen splash: hanger draws itself, brand letters flip in, cards float in 3D,
// then two panels split open to reveal the home page.
export default function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setLeaving(true), reduced ? 600 : 2800); // intro length in ms
    return () => {
      clearTimeout(t);
      document.body.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div className={`intro ${leaving ? "leaving" : ""}`} role="status" aria-label="Loading Olive Wear">
      <div className="intro-panel top" />
      <div className="intro-panel bottom" />

      <div className="intro-cards" aria-hidden="true">
        <div className="intro-card c1"><SafeImage src={heroImages.left} alt="" /></div>
        <div className="intro-card c2"><SafeImage src={heroImages.main} alt="" /></div>
        <div className="intro-card c3"><SafeImage src={heroImages.right} alt="" /></div>
      </div>

      <div className="intro-center">
        <svg className="hanger" viewBox="0 0 120 80" fill="none" aria-hidden="true">
          <path pathLength="1" d="M60 28 L60 22 C60 12 74 12 74 21 C74 27 66 27 64 33 M60 28 L14 58 Q8 63 16 63 L104 63 Q112 63 106 58 L60 28" />
        </svg>
        <div className="intro-brand" aria-hidden="true">
          {letters.map((l, i) => (
            <span key={i} className={i >= 5 ? "light" : ""} style={{ animationDelay: `${0.7 + i * 0.07}s` }}>{l}</span>
          ))}
        </div>
        <p className="intro-tag">Wear the colour of calm.</p>
      </div>
    </div>
  );
}
