import crypto from "node:crypto";
import mongoose from "mongoose";
import Order, { fulfillmentStatuses } from "../models/Order.js";
import OrderHistoryGrant from "../models/OrderHistoryGrant.js";
import { ApiError } from "../utils/ApiError.js";

export default {
  listConfirmed: () => Order.find({ paymentStatus: "paid" })
    .select("-historyTokenHash")
    .sort({ paidAt: -1 })
    .limit(200),

  async listByAccessTokens(tokens) {
    if (!Array.isArray(tokens) || tokens.length === 0 || tokens.length > 50) {
      throw new ApiError(400, "No order history credentials were provided.");
    }
    if (tokens.some((token) => typeof token !== "string" || !/^[\da-f]{64}$/i.test(token))) {
      throw new ApiError(400, "Order history credentials are invalid.");
    }
    const hashes = tokens.map((token) => crypto.createHash("sha256").update(token).digest("hex"));
    const grants = await OrderHistoryGrant.find({ tokenHash: { $in: hashes } }).select("email -_id");
    const queries = [{ historyTokenHash: { $in: hashes } }];
    if (grants.length) queries.push({ customerEmail: { $in: grants.map((grant) => grant.email) } });
    return Order.find({ paymentStatus: "paid", $or: queries })
      .select("-historyTokenHash")
      .sort({ paidAt: -1 })
      .limit(50);
  },

  async updateTracking(id, data = {}) {
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid order id.");
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new ApiError(400, "Tracking details are invalid.");
    const status = data.fulfillmentStatus;
    if (!fulfillmentStatuses.includes(status)) throw new ApiError(400, "Select a valid tracking status.");

    const shippingProvider = typeof data.shippingProvider === "string" ? data.shippingProvider.trim().slice(0, 80) : "";
    const trackingNumber = typeof data.trackingNumber === "string" ? data.trackingNumber.trim().slice(0, 100) : "";
    const trackingUrl = typeof data.trackingUrl === "string" ? data.trackingUrl.trim() : "";
    if (trackingUrl) {
      let parsed;
      try {
        parsed = new URL(trackingUrl);
      } catch {
        throw new ApiError(400, "Enter a valid HTTPS tracking link.");
      }
      if (parsed.protocol !== "https:") throw new ApiError(400, "Tracking links must use HTTPS.");
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, paymentStatus: "paid" },
      { $set: { fulfillmentStatus: status, shippingProvider, trackingNumber, trackingUrl } },
      { new: true, runValidators: true }
    ).select("-historyTokenHash");
    if (!order) throw new ApiError(404, "Confirmed order not found.");
    return order;
  },
};
