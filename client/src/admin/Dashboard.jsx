import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import Loader from "../components/ui/Loader";
import GlassCard from "../components/GlassCard";
import { PageHead, fmtDate } from "./ui";

export default function Dashboard() {
  const { data, loading, error } = useFetch(() => adminApi.dashboard());
  if (loading) return <Loader />;
  if (error) return <p className="text-danger">{error}</p>;
  const c = data.counts;
  const cards = [
    { label: "Products", value: c.products, icon: "bi-box-seam", to: "/admin/products" },
    { label: "Categories", value: c.categories, icon: "bi-tags", to: "/admin/categories" },
    { label: "Units in stock", value: c.totalUnits, icon: "bi-boxes", to: "/admin/inventory" },
    { label: "Low stock alerts", value: c.lowStock, icon: "bi-exclamation-triangle", to: "/admin/inventory" },
    { label: "New queries", value: c.newQueries, icon: "bi-chat-dots", to: "/admin/queries" },
  ];

  return (
    <>
      <PageHead title="Dashboard" />
      <div className="row g-3 mb-4">
        {cards.map((s) => (
          <div className="col-6 col-lg" key={s.label}>
            <Link to={s.to}>
              <GlassCard className="stat p-3 h-100">
                <i className={`bi ${s.icon}`} />
                <div className="stat-num">{s.value}</div>
                <small className="text-muted-olive">{s.label}</small>
              </GlassCard>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <GlassCard className="p-3 h-100">
            <h6 className="mb-3">Restock alerts</h6>
            {data.alerts.length === 0 && <p className="text-muted-olive mb-0">All stock levels are fine.</p>}
            {data.alerts.map((a) => (
              <div key={a.id} className="d-flex justify-content-between border-top border-secondary py-2 small">
                <span>{a.product} · {a.color} · {a.size} <span className="text-muted-olive">({a.location})</span></span>
                <strong className={a.qty === 0 ? "text-danger" : "price"}>{a.qty} left</strong>
              </div>
            ))}
          </GlassCard>
        </div>
        <div className="col-12 col-xl-6">
          <GlassCard className="p-3 h-100">
            <h6 className="mb-3">Recent queries</h6>
            {data.recentQueries.length === 0 && <p className="text-muted-olive mb-0">No queries yet.</p>}
            {data.recentQueries.map((q) => (
              <div key={q.id} className="border-top border-secondary py-2 small">
                <div className="d-flex justify-content-between"><strong>{q.name}</strong><span className="text-muted-olive">{fmtDate(q.createdAt)}</span></div>
                <div className="text-muted-olive text-truncate">{q.message}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </>
  );
}
