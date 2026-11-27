import mongoose from "mongoose";

// One row = stock of one product / colour / size at one location.
const schema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    location: { type: String, default: "Main Warehouse", trim: true },
    qty: { type: Number, default: 0, min: [0, "Quantity cannot be negative"] },
    reorderLevel: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);
schema.index({ product: 1, color: 1, size: 1, location: 1 }, { unique: true });

export default mongoose.model("Inventory", schema);
