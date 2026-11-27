import { Router } from "express";
import rateLimit from "express-rate-limit";
import product from "../controllers/product.controller.js";
import category from "../controllers/category.controller.js";
import content from "../controllers/content.controller.js";
import contact from "../controllers/contact.controller.js";
import payment from "../controllers/payment.controller.js";
import order from "../controllers/order.controller.js";

const r = Router();
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, message: { message: "Too many requests. Please try again later." } });
const paymentLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: "Too many payment requests. Please try again shortly." } });
const orderHistoryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { message: "Too many order history requests. Please try again later." } });
const orderHistoryOtpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { message: "Too many verification requests. Please try again later." } });

r.get("/products", product.list);
r.get("/products/:id", product.get);
r.post("/products/:id/quantity", product.quantity);
r.post("/payments/order", paymentLimiter, payment.createOrder);
r.post("/payments/verify", paymentLimiter, payment.verify);
r.post("/orders/history", orderHistoryLimiter, order.history);
r.post("/orders/history/otp", orderHistoryOtpLimiter, order.sendHistoryOtp);
r.post("/orders/history/verify", orderHistoryOtpLimiter, order.verifyHistoryOtp);
r.get("/categories", category.publicList);
r.get("/content", content.publicList);
r.post("/contact/send-otp", otpLimiter, contact.sendOtp);
r.post("/contact/verify", otpLimiter, contact.verify);

export default r;
