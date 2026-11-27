import { http, qs } from "./http";

export const shopApi = {
  products: (params) => http(`/products${qs(params)}`),
  product: (id) => http(`/products/${id}`),
  // the - / + counter lives on the server: action = "inc" | "dec" | "check"
  quantity: (id, body) => http(`/products/${id}/quantity`, { method: "POST", body }),
  createPaymentOrder: (body) => http("/payments/order", { method: "POST", body }),
  verifyPayment: (body) => http("/payments/verify", { method: "POST", body }),
  orderHistory: (tokens) => http("/orders/history", { method: "POST", body: { tokens } }),
  sendOrderHistoryOtp: (email) => http("/orders/history/otp", { method: "POST", body: { email } }),
  verifyOrderHistoryOtp: (body) => http("/orders/history/verify", { method: "POST", body }),
  categories: (type = "category") => http(`/categories${qs({ type })}`),
  content: (type) => http(`/content${qs({ type })}`),
  sendOtp: (body) => http("/contact/send-otp", { method: "POST", body }),
  verifyOtp: (body) => http("/contact/verify", { method: "POST", body }),
};
