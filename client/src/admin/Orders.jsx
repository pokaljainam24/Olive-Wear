import { useState } from "react";
import { adminApi } from "../api/admin";
import useFetch from "../hooks/useFetch";
import Loader from "../components/ui/Loader";
import SafeImage from "../components/SafeImage";
import { notify } from "../components/ui/notify";
import { PageHead, fmtDate } from "./ui";
import AdminSelect from "./components/AdminSelect";

const money = (paise) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const statuses = [
  ["confirmed", "Confirmed"],
  ["processing", "Processing"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
];

export default function Orders() {
  const { data, loading, error, reload } = useFetch(() => adminApi.orders.list());
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState("");

  const draftFor = (order) => drafts[order.id] || {
    fulfillmentStatus: order.fulfillmentStatus || "confirmed",
    shippingProvider: order.shippingProvider || "",
    trackingNumber: order.trackingNumber || "",
    trackingUrl: order.trackingUrl || "",
  };
  const updateDraft = (order, field, value) => {
    setDrafts((current) => {
      const currentDraft = current[order.id] || {
        fulfillmentStatus: order.fulfillmentStatus || "confirmed",
        shippingProvider: order.shippingProvider || "",
        trackingNumber: order.trackingNumber || "",
        trackingUrl: order.trackingUrl || "",
      };
      return { ...current, [order.id]: { ...currentDraft, [field]: value } };
    });
  };
  const saveTracking = async (event, order) => {
    event.preventDefault();
    setSavingId(order.id);
    try {
      await adminApi.orders.updateTracking(order.id, draftFor(order));
      notify.success("Tracking details updated");
      setDrafts((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
      reload(true);
    } catch (saveError) {
      notify.error(saveError.message);
    } finally {
      setSavingId("");
    }
  };

  return (
    <>
      <PageHead title="Confirmed orders">
        <button type="button" className="btn btn-outline-olive btn-sm" onClick={() => reload(true)}>
          <i className="bi bi-arrow-clockwise me-1" />Refresh
        </button>
      </PageHead>
      {loading && <Loader />}
      {error && <p className="text-danger">{error}</p>}
      {data && (
        data.length ? (
          <div className="admin-orders">
            {data.map((order) => (
              <article className="admin-order-card glass" key={order.id}>
                <header className="admin-order-card-head">
                  <div>
                    <span className="admin-order-paid"><i className="bi bi-check-circle-fill me-1" />Payment confirmed</span>
                    <h3>{order.razorpayOrderId}</h3>
                    <small>{fmtDate(order.paidAt)}</small>
                  </div>
                  <div className="admin-order-amount">
                    <span>Total paid</span>
                    <strong>{money(order.totalPaise)}</strong>
                  </div>
                </header>

                <div className="admin-order-card-grid">
                  <section className="admin-order-cell">
                    <span className="admin-order-label">CUSTOMER</span>
                    <strong>{order.customerName || "Customer"}</strong>
                    {order.customerEmail && <span>{order.customerEmail}</span>}
                    {order.customerPhone && <span>{order.customerPhone}</span>}
                  </section>

                  <section className="admin-order-cell admin-order-products">
                    <span className="admin-order-label">ITEMS</span>
                    {order.items.map((item, index) => (
                      <div key={`${item.product}-${item.color}-${item.size}-${index}`} className="order-item-line">
                        <SafeImage className="order-item-image" src={item.image} alt="" />
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.color} · {item.size} · Qty {item.qty} · {money(item.unitPricePaise)} each</span>
                        </div>
                      </div>
                    ))}
                  </section>

                  <section className="admin-order-cell">
                    <span className="admin-order-label">PAYMENT</span>
                    <strong className="admin-order-id">{order.razorpayPaymentId}</strong>
                    <span className="text-muted-olive">Subtotal {money(order.subtotalPaise)}</span>
                    <span className="text-muted-olive">Shipping {order.shippingPaise ? money(order.shippingPaise) : "Free"}</span>
                  </section>

                  <section className="admin-order-cell">
                    <span className="admin-order-label">DELIVERY</span>
                    <span className="admin-order-status">{order.fulfillmentStatus?.replaceAll("_", " ") || "confirmed"}</span>
                    {order.shippingProvider && <span>{order.shippingProvider}</span>}
                    {order.trackingNumber && <strong>{order.trackingNumber}</strong>}
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">Open tracking link</a>
                    )}
                  </section>
                </div>

                <details className="admin-tracking-editor">
                  <summary><i className="bi bi-truck me-2" />Update delivery tracking</summary>
                  <form className="order-tracking-form" onSubmit={(event) => saveTracking(event, order)}>
                    <AdminSelect
                      className="form-select form-select-sm glass-input"
                      value={draftFor(order).fulfillmentStatus}
                      onChange={(value) => updateDraft(order, "fulfillmentStatus", value)}
                      options={statuses.map(([value, label]) => ({ value, label }))}
                      ariaLabel="Delivery status"
                    />
                    <input
                      className="form-control form-control-sm glass-input"
                      placeholder="Courier name"
                      value={draftFor(order).shippingProvider}
                      onChange={(event) => updateDraft(order, "shippingProvider", event.target.value)}
                    />
                    <input
                      className="form-control form-control-sm glass-input"
                      placeholder="Tracking number"
                      value={draftFor(order).trackingNumber}
                      onChange={(event) => updateDraft(order, "trackingNumber", event.target.value)}
                    />
                    <input
                      type="url"
                      className="form-control form-control-sm glass-input"
                      placeholder="https:// tracking link"
                      value={draftFor(order).trackingUrl}
                      onChange={(event) => updateDraft(order, "trackingUrl", event.target.value)}
                    />
                    <button className="btn btn-olive btn-sm" type="submit" disabled={savingId === order.id}>
                      {savingId === order.id ? "Saving..." : "Save tracking"}
                    </button>
                  </form>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-orders-empty glass">
            <i className="bi bi-bag-check" />
            <h3>No confirmed orders yet</h3>
            <p>Paid Razorpay orders will appear here with customer and delivery details.</p>
          </div>
        )
      )}
    </>
  );
}
