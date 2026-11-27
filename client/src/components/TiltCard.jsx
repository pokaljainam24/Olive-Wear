import { useRef } from "react";

// Wrapper that tilts in 3D following the mouse.
export default function TiltCard({ children, className = "", max = 12 }) {
  const ref = useRef(null);

  const move = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale3d(1.03,1.03,1.03)`;
  };
  const leave = () => (ref.current.style.transform = "");

  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={move} onMouseLeave={leave}>
      {children}
    </div>
  );
}
