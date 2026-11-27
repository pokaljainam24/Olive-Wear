import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { notify } from "../components/ui/notify";
import GlassCard from "../components/GlassCard";
import Logo from "../components/Logo";
import "../styles/admin.css";

export default function Login() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || "/admin";

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.email, form.password);
      notify.success("Welcome back");
      navigate(from, { replace: true });
    } catch (err) {
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <GlassCard className="p-4 p-md-5">
        <div className="text-center mb-4"><Logo size={44} /></div>
        <form onSubmit={submit}>
          <label className="form-label" htmlFor="a-email">Email</label>
          <input id="a-email" type="email" required autoFocus className="form-control glass-input mb-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="form-label" htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" required className="form-control glass-input mb-4" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn btn-olive w-100" disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
        </form>
      </GlassCard>
    </div>
  );
}
