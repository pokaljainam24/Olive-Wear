import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// 1) Sets --sy (scroll position) on <html> for parallax.
// 2) Adds class "in" to every .reveal element when it enters the screen,
//    including elements that appear later (after API data loads).
export default function useScrollEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => root.style.setProperty("--sy", window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    const scan = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(() => requestAnimationFrame(scan));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
}
