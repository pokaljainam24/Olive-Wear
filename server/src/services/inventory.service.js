import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import { ApiError } from "../utils/ApiError.js";

const num = (v, name) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new ApiError(400, `${name} must be 0 or more`);
  return Math.floor(n);
};

export default {
  async list({ product, location, low } = {}) {
    const filter = {};
    if (product && mongoose.isValidObjectId(product)) filter.product = product;
    if (location) filter.location = location;
    const docs = await Inventory.find(filter).populate("product", "name img").sort({ location: 1, color: 1, size: 1 });
    const all = docs.filter((d) => d.product).map((d) => ({ ...d.toJSON(), low: d.qty <= d.reorderLevel }));
    const byLocation = {};
    all.forEach((r) => (byLocation[r.location] = (byLocation[r.location] || 0) + r.qty));
    return {
      rows: low === "true" ? all.filter((r) => r.low) : all,
      summary: {
        totalUnits: all.reduce((s, r) => s + r.qty, 0),
        lowCount: all.filter((r) => r.low).length,
        outCount: all.filter((r) => r.qty === 0).length,
        byLocation: Object.entries(byLocation).map(([location, total]) => ({ location, total })),
      },
    };
  },

  // Create the row, or overwrite qty if the same product/colour/size/location already exists.
  async save({ product, color, size, location = "Main Warehouse", qty = 0, reorderLevel = 5 }) {
    if (!mongoose.isValidObjectId(product) || !color || !size) throw new ApiError(400, "Product, colour and size are required");
    return Inventory.findOneAndUpdate(
      { product, color, size, location: location.trim() || "Main Warehouse" },
      { $set: { qty: num(qty, "Quantity"), reorderLevel: num(reorderLevel, "Reorder level") } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  async update(id, data) {
    const row = await Inventory.findById(id);
    if (!row) throw new ApiError(404, "Stock row not found");
    if (data.qty !== undefined) row.qty = num(data.qty, "Quantity");
    if (data.reorderLevel !== undefined) row.reorderLevel = num(data.reorderLevel, "Reorder level");
    return row.save();
  },

  async remove(id) {
    const row = await Inventory.findByIdAndDelete(id);
    if (!row) throw new ApiError(404, "Stock row not found");
  },

  async locations() {
    return Inventory.distinct("location");
  },
};
