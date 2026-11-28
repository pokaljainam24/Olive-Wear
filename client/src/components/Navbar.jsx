import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { useCart } from "./CartContext";
import OrderHistoryModal from "./OrderHistoryModal";

const links = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/#shop" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { itemCount, openCart } = useCart();
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 992) setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark fixed-top site-nav ${solid ? "solid" : ""}`}>
        <div className="container">
          <Logo className="navbar-brand me-0" />
          <button
            type="button"
            className="navbar-toggler"
            aria-label="Open menu"
            aria-controls="mobile-nav-drawer"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mx-auto gap-lg-3">
              {links.map((l) => (
                <li className="nav-item" key={l.label}>
                  <Link className={`nav-link ${pathname === l.to ? "active" : ""}`} to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="d-none d-lg-flex align-items-center gap-2 ms-auto ms-lg-3">
            <button
              type="button"
              className="btn btn-outline-olive btn-sm order-history-trigger"
              onClick={() => setHistoryOpen(true)}
              aria-label="Orders"
              aria-haspopup="dialog"
              aria-expanded={historyOpen}
              title="Orders"
            >
              <i className="bi bi-box-seam" />
              <span>Orders</span>
            </button>
            <button type="button" className="btn btn-olive btn-sm px-4" onClick={openCart}>
              Cart ({itemCount})
            </button>
          </div>
        </div>
      </nav>
      <div
        className={`mobile-nav-backdrop ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${menuOpen ? "show" : ""}`}
        aria-label="Main navigation"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-header">
          <span>Menu</span>
          <button
            type="button"
            className="mobile-nav-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <ul className="navbar-nav mobile-nav-links">
          {links.map((l) => (
            <li className="nav-item" key={l.label}>
              <Link
                className={`nav-link ${pathname === l.to ? "active" : ""}`}
                to={l.to}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-nav-actions">
          <button
            type="button"
            className="btn btn-outline-olive order-history-trigger"
            onClick={() => {
              setMenuOpen(false);
              setHistoryOpen(true);
            }}
            aria-label="Orders"
            aria-haspopup="dialog"
            aria-expanded={historyOpen}
            title="Orders"
          >
            <i className="bi bi-box-seam" />
            <span>Orders</span>
          </button>
          <button
            type="button"
            className="btn btn-olive"
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
          >
            Cart ({itemCount})
          </button>
        </div>
      </aside>
      <OrderHistoryModal open={historyOpen} onClose={closeHistory} />
    </>
  );
}
