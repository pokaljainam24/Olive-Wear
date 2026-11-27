import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { shopApi } from "../api/shop";
import { useCart } from "./CartContext";
import { notify } from "./ui/notify";
import { saveOrderHistoryToken } from "../utils/orderHistory";
import SafeImage from "./SafeImage";

const money = (amount) => `₹${amount.toLocaleString("en-IN")}`;
const checkoutPrefill = {
  name: "Test Customer",
  email: "test@example.com",
  contact: "9999999999",
};
let razorpayScriptPromise;

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => {
        script.remove();
        razorpayScriptPromise = undefined;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 1999 ? 0 : 79;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, closeCart]);

  const orderNow = async () => {
    setCheckoutBusy(true);
    try {
      if (!(await loadRazorpay())) throw new Error("Could not load Razorpay checkout. Please try again.");
      const order = await shopApi.createPaymentOrder({
        items: items.map(({ productId, color, size, qty }) => ({ productId, color, size, qty })),
        customer: checkoutPrefill,
      });
      if (!saveOrderHistoryToken(order.historyToken)) {
        notify.info("This browser could not save order-history access for this purchase.");
      }
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Olive Wear",
        description: "Secure order payment",
        prefill: checkoutPrefill,
        theme: { color: "#c3d08a" },
        modal: { ondismiss: () => setCheckoutBusy(false) },
        handler: async (payment) => {
          try {
            const result = await shopApi.verifyPayment(payment);
            if (!result.verified) throw new Error("Payment verification failed. Please contact support.");
            notify.success("Payment successful. Your payment has been verified.");
            clearCart();
            closeCart();
          } catch (error) {
            notify.error(error.message);
          } finally {
            setCheckoutBusy(false);
          }
        },
      });
      checkout.on("payment.failed", (event) => {
        notify.error(event.error?.description || "Payment failed. Please try again.");
        setCheckoutBusy(false);
      });
      closeCart();
      checkout.open();
    } catch (error) {
      notify.error(error.message);
      setCheckoutBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`cart-backdrop ${isOpen ? "show" : ""}`}
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeCart}
      />
      <aside
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-labelledby="cart-title"
      >
        <div className="cart-head">
          <h2 id="cart-title">Your cart</h2>
          <button type="button" className="cart-close" aria-label="Close cart" onClick={closeCart}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {items.length ? (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.key}>
                  <Link className="cart-image" to={`/product/${item.productId}`} onClick={closeCart}>
                    <SafeImage src={item.image} alt={item.name} />
                  </Link>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.category} · {item.color} · Size {item.size}</p>
                    <small>{money(item.price)} each × {item.qty}</small>
                    <strong>{money(item.price * item.qty)}</strong>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        disabled={item.qty <= 1}
                        onClick={() => updateQuantity(item.key, -1)}
                      >−</button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        disabled={item.qty >= item.max}
                        onClick={() => updateQuantity(item.key, 1)}
                      >+</button>
                    </div>
                    <button type="button" className="cart-remove" onClick={() => removeItem(item.key)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <footer className="cart-footer">
              <div className="cart-total">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <strong>{shipping ? money(shipping) : "Free"}</strong>
                </div>
                <div className="cart-grand-total">
                  <span>Total</span>
                  <strong>{money(total)}</strong>
                </div>
              </div>
              <button type="button" className="btn btn-olive cart-order" onClick={orderNow} disabled={checkoutBusy}>
                {checkoutBusy ? "Opening secure checkout..." : "Order now"}
              </button>
              {subtotal < 1999 && <small>Free shipping on orders above ₹1,999.</small>}
            </footer>
          </>
        ) : (
          <div className="cart-empty">
            <i className="bi bi-bag" />
            <p>Your cart is empty.</p>
            <Link to="/#shop" className="btn btn-outline-olive" onClick={closeCart}>Continue shopping</Link>
          </div>
        )}
      </aside>
    </>
  );
}
