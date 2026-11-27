import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Query from "../models/Query.js";
import Inventory from "../models/Inventory.js";

export default {
  async get() {
    const [products, categories, queries, newQueries, stock, recentQueries] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Query.countDocuments(),
      Query.countDocuments({ status: "new" }),
      Inventory.find().populate("product", "name"),
      Query.find().sort({ createdAt: -1 }).limit(5),
    ]);
    const rows = stock.filter((r) => r.product);
    const low = rows.filter((r) => r.qty <= r.reorderLevel);
    return {
      counts: { products, categories, queries, newQueries, lowStock: low.length, totalUnits: rows.reduce((s, r) => s + r.qty, 0) },
      alerts: low.slice(0, 8).map((r) => ({ id: r.id, product: r.product.name, color: r.color, size: r.size, location: r.location, qty: r.qty })),
      recentQueries,
    };
  },
};
