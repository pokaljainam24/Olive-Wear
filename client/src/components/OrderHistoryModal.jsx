import { useEffect, useRef, useState } from "react";
import { shopApi } from "../api/shop";
import { readOrderHistoryTokens, saveOrderHistoryToken } from "../utils/orderHistory";
import SafeImage from "./SafeImage";

const stages = [
  { value: "confirmed", label: "Order confirmed" },
  { value: "processing", label: "Preparing your order" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
];
const money = (paise) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const date = (value) => new Date(value).toLocaleString("en-IN", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export default function OrderHistoryModal({ open, onClose }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [result, setResult] = useState({ orders: [], loading: false, error: "", hasAccess: false });
  const [recovery, setRecovery] = useState({ email: "", otp: "", requestId: "", busy: false, error: "" });
  const scrollTimeout = useRef(null);

  const handleContentScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => setIsScrolling(false), 800);
  };

  const requestRecoveryCode = async (event) => {
    event.preventDefault();
    setRecovery((current) => ({ ...current, busy: true, error: "" }));
    try {
      const response = await shopApi.sendOrderHistoryOtp(recovery.email);
      setRecovery((current) => ({ ...current, requestId: response.requestId, otp: "", error: "" }));
    } catch (error) {
      setRecovery((current) => ({ ...current, error: error.message }));
    } finally {
      setRecovery((current) => ({ ...current, busy: false }));
    }
  };

  const verifyRecoveryCode = async (event) => {
    event.preventDefault();
    setRecovery((current) => ({ ...current, busy: true, error: "" }));
    try {
      const response = await shopApi.verifyOrderHistoryOtp({
        requestId: recovery.requestId,
        otp: recovery.otp,
      });
      if (!response.historyToken) {
        setRecovery((current) => ({ ...current, requestId: "", otp: "", error: "No paid orders were found for that email." }));
        return;
      }
      if (!saveOrderHistoryToken(response.historyToken)) {
        throw new Error("Could not save your order access on this browser.");
      }
      setRecovery((current) => ({ ...current, requestId: "", otp: "", error: "" }));
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setRecovery((current) => ({ ...current, error: error.message }));
    } finally {
      setRecovery((current) => ({ ...current, busy: false }));
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    const tokens = readOrderHistoryTokens();
    if (!tokens.length) {
      setResult({ orders: [], loading: false, error: "", hasAccess: false });
      return () => { active = false; };
    }

    setResult({ orders: [], loading: true, error: "", hasAccess: true });
    shopApi.orderHistory(tokens)
      .then((orders) => active && setResult({ orders, loading: false, error: "", hasAccess: true }))
      .catch((error) => active && setResult({ orders: [], loading: false, error: error.message, hasAccess: true }));
    return () => { active = false; };
  }, [open, refreshKey]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  useEffect(() => () => window.clearTimeout(scrollTimeout.current), []);

  if (!open) return null;

  return (
    <div className="order-history-layer">
      <button type="button" className="order-history-backdrop" onClick={onClose} aria-label="Close order history" />
      <section
        className="order-history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="order-history-head">
          <div>
            <span className="order-history-eyebrow">OLIVE WEAR</span>
            <h2 id="order-history-title">Your orders</h2>
            <p>Order details and delivery updates, all in one place.</p>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="order-history-icon" onClick={() => setRefreshKey((key) => key + 1)} aria-label="Refresh orders">
              <i className="bi bi-arrow-clockwise" />
            </button>
            <button type="button" className="order-history-icon" onClick={onClose} aria-label="Close order history">
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </header>

        <div className={`order-history-content${isScrolling ? " is-scrolling" : ""}`} onScroll={handleContentScroll}>
          {result.loading && <div className="order-history-message"><span className="spinner-border spinner-border-sm" /> Loading your orders...</div>}
          {result.error && <div className="order-history-message text-danger">{result.error}</div>}
          {!result.loading && !result.error && !result.orders.length && (
            <div className="order-history-empty">
              <i className="bi bi-box-seam" />
              <h3>No confirmed orders yet</h3>
              <p>{result.hasAccess ? "Your paid orders will appear here with their delivery updates." : "Orders are shown here on the browser used to place them."}</p>
            </div>
          )}
          {result.orders.map((order) => {
            const activeStage = Math.max(0, stages.findIndex((stage) => stage.value === order.fulfillmentStatus));
            return (
              <article className="history-order-card" key={order.id}>
                <div className="history-order-top">
                  <div>
                    <span className="history-order-label">ORDER</span>
                    <h3>{order.razorpayOrderId}</h3>
                    <small>Placed {date(order.paidAt)}</small>
                    {(order.customerEmail || order.customerPhone) && (
                      <small className="history-customer-contact">
                        {[order.customerEmail, order.customerPhone].filter(Boolean).join(" · ")}
                      </small>
                    )}
                  </div>
                  <span className="history-paid"><i className="bi bi-check-circle-fill" /> Paid</span>
                </div>

                <div className="history-order-items">
                  {order.items.map((item, index) => (
                    <div className="history-order-item" key={`${item.product}-${item.color}-${item.size}-${index}`}>
                      <SafeImage src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.color} · {item.size} · Qty {item.qty}</small>
                      </div>
                      <strong>{money(item.unitPricePaise * item.qty)}</strong>
                    </div>
                  ))}
                </div>

                <div className="history-tracking">
                  <div className="history-tracking-head">
                    <div>
                      <span className="history-order-label">DELIVERY TRACKING</span>
                      <h4>{stages[activeStage].label}</h4>
                    </div>
                    {order.trackingUrl && (
                      <a className="history-track-link" href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                        Track parcel <i className="bi bi-box-arrow-up-right" />
                      </a>
                    )}
                  </div>
                  <div className="history-timeline-wrap">
                    <ol className="history-timeline">
                      {stages.map((stage, index) => (
                        <li className={index <= activeStage ? "complete" : ""} key={stage.value}>
                          <span className="history-timeline-dot" />
                          <span>{stage.label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {(order.shippingProvider || order.trackingNumber) && (
                    <div className="history-tracking-meta">
                      {order.shippingProvider && <span>{order.shippingProvider}</span>}
                      {order.trackingNumber && <strong>Tracking no. {order.trackingNumber}</strong>}
                    </div>
                  )}
                  {activeStage < 3 && !order.trackingNumber && (
                    <p className="history-tracking-note">Courier details will appear here once your order ships.</p>
                  )}
                </div>

                <div className="history-order-total">
                  <span>Total paid</span>
                  <strong>{money(order.totalPaise)}</strong>
                </div>
              </article>
            );
          })}
          {!result.loading && (
            <details className="order-history-recovery" open={!result.orders.length}>
              <summary>Find older orders or orders from another browser</summary>
              <p>Enter the email used during checkout. We’ll send a one-time code to verify it.</p>
              <form onSubmit={recovery.requestId ? verifyRecoveryCode : requestRecoveryCode}>
                <label htmlFor="order-history-email">Checkout email</label>
                <input
                  id="order-history-email"
                  type="email"
                  className="form-control glass-input"
                  autoComplete="email"
                  required
                  value={recovery.email}
                  disabled={recovery.busy || Boolean(recovery.requestId)}
                  onChange={(event) => setRecovery((current) => ({ ...current, email: event.target.value, error: "" }))}
                />
                {recovery.requestId && (
                  <>
                    <p className="order-history-recovery-hint">A six-digit code was sent to {recovery.email}.</p>
                    <label htmlFor="order-history-otp">Verification code</label>
                    <input
                      id="order-history-otp"
                      className="form-control glass-input"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={recovery.otp}
                      onChange={(event) => setRecovery((current) => ({ ...current, otp: event.target.value.replace(/\D/g, ""), error: "" }))}
                    />
                  </>
                )}
                {recovery.error && <p className="order-history-recovery-error">{recovery.error}</p>}
                <div className="d-flex flex-wrap gap-2">
                  <button type="submit" className="btn btn-olive btn-sm" disabled={recovery.busy}>
                    {recovery.busy ? "Please wait..." : recovery.requestId ? "Verify and show orders" : "Send verification code"}
                  </button>
                  {recovery.requestId && (
                    <button
                      type="button"
                      className="btn btn-outline-olive btn-sm"
                      onClick={() => setRecovery((current) => ({ ...current, requestId: "", otp: "", error: "" }))}
                      disabled={recovery.busy}
                    >
                      Change email
                    </button>
                  )}
                </div>
              </form>
            </details>
          )}
        </div>
      </section>
    </div>
  );
}
