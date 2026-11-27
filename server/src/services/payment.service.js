import crypto from "node:crypto";
import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const RAZORPAY_API = "https://api.razorpay.com/v1";
const FREE_SHIPPING_THRESHOLD_PAISE = 199900;
const SHIPPING_FEE_PAISE = 7900;

const requireCredentials = () => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new ApiError(503, "Razorpay test keys are not configured on the server.");
  }
};

const razorpayRequest = async (path, { method = "GET", body } = {}) => {
  const credentials = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64");
  let response;
  try {
    response = await fetch(`${RAZORPAY_API}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${credentials}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(502, "Could not connect to Razorpay. Please try again.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(502, data.error?.description || "Razorpay could not process the request.");
  }
  return data;
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new ApiError(400, "Your cart is empty or contains too many items.");
  }

  const merged = new Map();
  for (const item of items) {
    const productId = String(item?.productId || "");
    const color = typeof item?.color === "string" ? item.color.trim() : "";
    const size = typeof item?.size === "string" ? item.size.trim() : "";
    const qty = Number(item?.qty);
    if (!mongoose.isValidObjectId(productId) || !color || !size || !Number.isSafeInteger(qty) || qty < 1) {
      throw new ApiError(400, "A cart item is invalid. Please review your cart.");
    }

    const key = `${productId}:${color}:${size}`;
    const totalQty = (merged.get(key)?.qty || 0) + qty;
    if (totalQty > env.maxQty) throw new ApiError(400, `Maximum ${env.maxQty} of each item can be ordered.`);
    merged.set(key, { productId, color, size, qty: totalQty });
  }
  return [...merged.values()];
};

const getAvailableQty = async (productId, color, size) => {
  const rows = await Inventory.aggregate([
    { $match: { product: productId, color, size } },
    { $group: { _id: null, qty: { $sum: "$qty" } } },
  ]);
  return rows[0]?.qty || 0;
};

const getOrderLines = async (items) => Promise.all(normalizeItems(items).map(async (item) => {
  const product = await Product.findOne({ _id: item.productId, active: true });
  if (!product) throw new ApiError(400, "A product in your cart is no longer available.");
  if (!product.colors.some((entry) => entry.name === item.color) || !product.sizes.includes(item.size)) {
    throw new ApiError(400, `Please review the colour and size for ${product.name}.`);
  }
  const available = await getAvailableQty(product._id, item.color, item.size);
  if (item.qty > available) {
    throw new ApiError(400, `Only ${available} of ${product.name} (${item.color}, ${item.size}) are available.`);
  }
  return {
    ...item,
    name: product.name,
    category: product.category,
    image: product.img,
    pricePaise: Math.round(product.price * 100),
  };
}));

export default {
  async createOrder(payload = {}) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new ApiError(400, "Invalid checkout request.");
    }
    requireCredentials();
    const { items } = payload;
    const customer = payload.customer && typeof payload.customer === "object" && !Array.isArray(payload.customer)
      ? payload.customer
      : {};
    const historyToken = crypto.randomBytes(32).toString("hex");
    const lines = await getOrderLines(items);
    const subtotalPaise = lines.reduce((total, item) => total + item.pricePaise * item.qty, 0);
    const shippingPaise = subtotalPaise === 0 || subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : SHIPPING_FEE_PAISE;
    const amount = subtotalPaise + shippingPaise;
    if (amount < 100) throw new ApiError(400, "The order total must be at least ₹1 to use Razorpay.");
    const receipt = `ow_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const order = await razorpayRequest("/orders", {
      method: "POST",
      body: {
        amount,
        currency: "INR",
        receipt,
        notes: { item_count: String(lines.reduce((count, item) => count + item.qty, 0)) },
      },
    });
    await Order.create({
      razorpayOrderId: order.id,
      receipt,
      historyTokenHash: crypto.createHash("sha256").update(historyToken).digest("hex"),
      currency: order.currency,
      subtotalPaise,
      shippingPaise,
      totalPaise: amount,
      customerName: typeof customer.name === "string" ? customer.name.trim().slice(0, 120) : "",
      customerEmail: typeof customer.email === "string" ? customer.email.trim().slice(0, 254).toLowerCase() : "",
      customerPhone: typeof customer.contact === "string" ? customer.contact.trim().slice(0, 30) : "",
      items: lines.map((item) => ({
        product: item.productId,
        name: item.name,
        category: item.category,
        image: item.image,
        color: item.color,
        size: item.size,
        qty: item.qty,
        unitPricePaise: item.pricePaise,
      })),
    });
    return { keyId: env.razorpay.keyId, orderId: order.id, amount, currency: order.currency, historyToken };
  },

  async verify(payload = {}) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new ApiError(400, "Payment verification details are invalid.");
    }
    requireCredentials();
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = payload;
    if (![orderId, paymentId, signature].every((value) => typeof value === "string" && value.length > 0)) {
      throw new ApiError(400, "Payment verification details are incomplete.");
    }

    const expected = crypto
      .createHmac("sha256", env.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest();
    if (!/^[\da-f]{64}$/i.test(signature)) throw new ApiError(400, "Payment signature is invalid.");
    const received = Buffer.from(signature, "hex");
    if (!crypto.timingSafeEqual(expected, received)) throw new ApiError(400, "Payment signature is invalid.");

    const savedOrder = await Order.findOne({ razorpayOrderId: orderId });
    if (!savedOrder) throw new ApiError(404, "This Razorpay order was not found.");
    const [order, payment] = await Promise.all([
      razorpayRequest(`/orders/${encodeURIComponent(orderId)}`),
      razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`),
    ]);
    if (
      payment.order_id !== orderId ||
      payment.id !== paymentId ||
      payment.status !== "captured" ||
      payment.currency !== "INR" ||
      payment.amount !== order.amount ||
      payment.amount !== savedOrder.totalPaise ||
      order.currency !== "INR" ||
      order.amount_paid !== order.amount
    ) {
      throw new ApiError(400, "Razorpay has not confirmed a captured payment for this order.");
    }

    if (savedOrder.paymentStatus === "paid") {
      if (savedOrder.razorpayPaymentId === paymentId) return { verified: true, paymentId };
      throw new ApiError(409, "This order has already been paid with a different payment.");
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { razorpayOrderId: orderId, paymentStatus: "pending" },
      {
        $set: {
          razorpayPaymentId: paymentId,
          paymentStatus: "paid",
          customerEmail: payment.email?.trim().toLowerCase() || savedOrder.customerEmail,
          customerPhone: payment.contact || savedOrder.customerPhone,
          paidAt: new Date(),
        },
      },
      { new: true }
    );
    if (!updatedOrder) {
      const current = await Order.findOne({ razorpayOrderId: orderId });
      if (current?.paymentStatus === "paid" && current.razorpayPaymentId === paymentId) {
        return { verified: true, paymentId };
      }
      throw new ApiError(409, "This order could not be marked as paid. Please contact support.");
    }
    return { verified: true, paymentId };
  },
};
