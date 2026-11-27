import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// New page -> scroll to top. Link with #hash -> scroll to that section. Also closes the mobile menu.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    document.getElementById("nav")?.classList.remove("show");
  }, [pathname, hash]);
  return null;
}
