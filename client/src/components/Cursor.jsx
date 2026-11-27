import { useEffect, useRef } from "react";

// Custom pointer: a small dot + a trailing ring that grows over clickable things.
// Only runs on devices with a real mouse (hidden on touch screens).
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let x = -100, y = -100, rx = -100, ry = -100, raf;
    const hot = "a, button, input, textarea, select, label, .tilt, [data-cursor]";

    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.current.style.transform = `translate(${x}px, ${y}px)`;
      ring.current.classList.toggle("hot", !!e.target.closest?.(hot));
      html.classList.remove("cursor-out");
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const down = () => ring.current.classList.add("press");
    const up = () => ring.current.classList.remove("press");
    const out = () => html.classList.add("cursor-out");

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", out);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor", "cursor-out");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", out);
    };
  }, []);

  return (
    <>
      <div className="cursor cursor-ring" ref={ring}><span /></div>
      <div className="cursor cursor-dot" ref={dot}><span /></div>
    </>
  );
}
