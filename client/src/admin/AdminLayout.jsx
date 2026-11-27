import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useConfirm } from "../components/ui/ConfirmProvider";
import { notify } from "../components/ui/notify";
import Logo from "../components/Logo";

const links = [
  { to: "/admin", label: "Dashboard", icon: "bi-speedometer2", end: true },
  { to: "/admin/products", label: "Products", icon: "bi-box-seam" },
  { to: "/admin/categories", label: "Categories", icon: "bi-tags" },
  { to: "/admin/cms", label: "Content / CMS", icon: "bi-file-earmark-text" },
  { to: "/admin/inventory", label: "Inventory", icon: "bi-boxes" },
  { to: "/admin/orders", label: "Orders", icon: "bi-bag-check" },
  { to: "/admin/queries", label: "Queries", icon: "bi-chat-dots" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const onLogout = async () => {
    const ok = await confirm({ title: "Logout?", message: "You will need to login again to open the admin panel.", confirmText: "Logout" });
    if (!ok) return;
    logout();
    notify.success("Logged out");
    navigate("/admin/login");
  };

  return (
    <div className="admin">
      <aside className={`admin-side ${open ? "open" : ""}`}>
        <div className="mb-3"><Logo size={36} /></div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="admin-link">
            <i className={`bi ${l.icon}`} /> {l.label}
          </NavLink>
        ))}
        <div className="mt-auto">
          <small className="text-muted-olive d-block mb-2 text-truncate">{user?.email}</small>
          <button className="btn btn-outline-olive btn-sm w-100" onClick={onLogout}><i className="bi bi-box-arrow-right me-1" /> Logout</button>
        </div>
      </aside>
      {open && <div className="admin-scrim" onClick={() => setOpen(false)} />}
      <div className="admin-body">
        <div className="admin-top">
          <button className="btn btn-outline-olive btn-sm" onClick={() => setOpen(true)} aria-label="Menu"><i className="bi bi-list" /></button>
          <span className="fw-bold">Admin panel</span>
        </div>
        <div className="admin-main"><Outlet /></div>
      </div>
    </div>
  );
}
