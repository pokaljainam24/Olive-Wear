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
  const { pathname } = useLocation();
  const { itemCount, openCart } = useCart();
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

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
          <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Menu">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav mx-auto gap-lg-3">
              {links.map((l) => (
                <li className="nav-item" key={l.label}>
                  <Link className={`nav-link ${pathname === l.to ? "active" : ""}`} to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="d-flex align-items-center gap-2 ms-auto ms-lg-3">
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
      <OrderHistoryModal open={historyOpen} onClose={closeHistory} />
    </>
  );
}
