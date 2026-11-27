import crypto from "crypto";
import Otp from "../models/Otp.js";
import Query from "../models/Query.js";
import Order from "../models/Order.js";
import OrderHistoryGrant from "../models/OrderHistoryGrant.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { sendContactQueryEmails, sendMail } from "./mail.service.js";

const hash = (code, id) => crypto.createHash("sha256").update(`${code}:${id}:${env.jwtSecret}`).digest("hex");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  // Step 1: validate the form, mail an OTP. The query is NOT saved yet.
  async send({ name, email, phone = "", topic = "Order help", message }) {
    if (!name?.trim() || !message?.trim()) throw new ApiError(400, "Name and message are required");
    if (!EMAIL.test(email || "")) throw new ApiError(400, "Please enter a valid email");
    const code = String(crypto.randomInt(100000, 1000000));
    const doc = new Otp({ email: email.toLowerCase(), codeHash: "x", payload: { name: name.trim(), email: email.toLowerCase(), phone, topic, message: message.trim() } });
    doc.codeHash = hash(code, doc.id);
    await doc.save();
    await sendMail({
      to: doc.email,
      subject: "Your Olive Wear verification code",
      text: `Your verification code is ${code}. It is valid for ${env.otpExpiryMinutes} minutes.`,
      html: `<p>Your Olive Wear verification code is</p><h2 style="letter-spacing:4px">${code}</h2><p>It is valid for ${env.otpExpiryMinutes} minutes.</p>`,
    });
    return { requestId: doc.id };
  },

  // Step 2: check OTP, then save the query for the admin.
  async verify({ requestId, otp }) {
    const doc = await Otp.findById(requestId);
    if (!doc) throw new ApiError(400, "OTP expired. Please request a new one.");
    if (doc.payload?.purpose === "order-history") {
      throw new ApiError(400, "Use the order history verification form for this code.");
    }
    if (doc.attempts >= 5) {
      await doc.deleteOne();
      throw new ApiError(429, "Too many wrong attempts. Please request a new OTP.");
    }
    if (hash(String(otp || "").trim(), doc.id) !== doc.codeHash) {
      doc.attempts += 1;
      await doc.save();
      throw new ApiError(400, "Invalid OTP");
    }
    let query;
    if (doc.payload?.queryId) {
      query = await Query.findById(doc.payload.queryId);
    }
    if (!query) {
      const { queryId, ...queryPayload } = doc.payload;
      query = await Query.create(queryPayload);
      doc.payload = { ...queryPayload, queryId: query.id };
      await doc.save();
    }
    await sendContactQueryEmails(query);
    await doc.deleteOne();
    return query;
  },

  async sendOrderHistoryOtp(email) {
    if (!EMAIL.test(email || "")) throw new ApiError(400, "Please enter a valid email.");
    const normalizedEmail = email.trim().toLowerCase();
    const code = String(crypto.randomInt(100000, 1000000));
    const doc = new Otp({
      email: normalizedEmail,
      codeHash: "x",
      payload: { purpose: "order-history" },
    });
    doc.codeHash = hash(code, doc.id);
    await doc.save();
    await sendMail({
      to: normalizedEmail,
      subject: "Your Olive Wear order history code",
      text: `Your order history verification code is ${code}. It is valid for ${env.otpExpiryMinutes} minutes.`,
      html: `<p>Your Olive Wear order history verification code is</p><h2 style="letter-spacing:4px">${code}</h2><p>It is valid for ${env.otpExpiryMinutes} minutes.</p>`,
    });
    return { requestId: doc.id };
  },

  async verifyOrderHistoryOtp(payload = {}) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new ApiError(400, "Verification details are invalid.");
    }
    const { requestId, otp } = payload;
    const doc = await Otp.findById(requestId);
    if (!doc || doc.payload?.purpose !== "order-history") {
      throw new ApiError(400, "Order history code expired. Please request a new one.");
    }
    if (doc.attempts >= 5) {
      await doc.deleteOne();
      throw new ApiError(429, "Too many wrong attempts. Please request a new code.");
    }
    if (hash(String(otp || "").trim(), doc.id) !== doc.codeHash) {
      doc.attempts += 1;
      await doc.save();
      throw new ApiError(400, "Invalid verification code.");
    }

    const email = doc.email;
    await doc.deleteOne();
    const hasOrders = await Order.exists({ paymentStatus: "paid", customerEmail: email });
    if (!hasOrders) return { historyToken: "" };

    const historyToken = crypto.randomBytes(32).toString("hex");
    await OrderHistoryGrant.create({
      email,
      tokenHash: crypto.createHash("sha256").update(historyToken).digest("hex"),
    });
    return { historyToken };
  },
};
