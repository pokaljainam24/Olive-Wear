import mongoose from "mongoose";

export const fulfillmentStatuses = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
    color: { type: String, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPricePaise: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    receipt: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending", index: true },
    fulfillmentStatus: { type: String, enum: fulfillmentStatuses, default: "confirmed" },
    historyTokenHash: { type: String, required: true, select: false },
    currency: { type: String, required: true, default: "INR" },
    subtotalPaise: { type: Number, required: true, min: 0 },
    shippingPaise: { type: Number, required: true, min: 0 },
    totalPaise: { type: Number, required: true, min: 0 },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    shippingProvider: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    items: { type: [itemSchema], required: true },
    paidAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

schema.index({ paymentStatus: 1, createdAt: -1 });
schema.index({ historyTokenHash: 1 }, { unique: true, sparse: true });

export default mongoose.model("Order", schema);
