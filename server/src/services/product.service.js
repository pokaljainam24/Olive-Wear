import mongoose from "mongoose";
import { parse } from "csv-parse/sync";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const notFound = () => new ApiError(404, "Product not found");
const oid = (id) => new mongoose.Types.ObjectId(String(id));

// { Olive: { S: 4, M: 10 }, Sand: { ... } } summed over all locations
const stockMatrix = async (productId) => {
  const rows = await Inventory.aggregate([
    { $match: { product: oid(productId) } },
    { $group: { _id: { c: "$color", s: "$size" }, qty: { $sum: "$qty" } } },
  ]);
  const matrix = {};
  rows.forEach((r) => ((matrix[r._id.c] ||= {})[r._id.s] = r.qty));
  return matrix;
};

const available = async (productId, color, size) => {
  const r = await Inventory.aggregate([
    { $match: { product: oid(productId), color, size } },
    { $group: { _id: null, qty: { $sum: "$qty" } } },
  ]);
  return r[0]?.qty || 0;
};

const addOpeningStock = (product, qty, location) => {
  const rows = [];
  product.colors.forEach((c) => product.sizes.forEach((size) => rows.push({ product: product._id, color: c.name, size, location, qty })));
  return rows.length ? Inventory.insertMany(rows) : [];
};

const withTotals = async (products) => {
  const totals = await Inventory.aggregate([{ $group: { _id: "$product", total: { $sum: "$qty" } } }]);
  const map = new Map(totals.map((t) => [String(t._id), t.total]));
  return products.map((p) => ({ ...p.toJSON(), totalStock: map.get(String(p._id)) || 0 }));
};

const splitList = (v, sep = "|") => String(v || "").split(sep).map((s) => s.trim()).filter(Boolean);

export default {
  async list({ category, q, admin = false } = {}) {
    const filter = admin ? {} : { active: true };
    if (category && category !== "All") filter.category = category;
    if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    return withTotals(await Product.find(filter).sort({ createdAt: -1 }));
  },

  async getAdmin(id) {
    if (!mongoose.isValidObjectId(id)) throw notFound();
    const p = await Product.findById(id);
    if (!p) throw notFound();
    return p;
  },

  // Details page: product + stock matrix + similar clothes
  async getPublic(id) {
    if (!mongoose.isValidObjectId(id)) throw notFound();
    const product = await Product.findOne({ _id: id, active: true });
    if (!product) throw notFound();
    const base = { active: true, _id: { $ne: product._id } };
    const [stock, same, others] = await Promise.all([
      stockMatrix(product._id),
      Product.find({ ...base, category: product.category }).limit(4),
      Product.find({ ...base, category: { $ne: product.category } }).limit(4),
    ]);
    return { ...product.toJSON(), stock, similar: [...same, ...others].slice(0, 4) };
  },

  async create({ openingStock = 0, location = "Main Warehouse", ...data }) {
    const product = await Product.create(data);
    await addOpeningStock(product, Math.max(0, Number(openingStock) || 0), location || "Main Warehouse");
    return product;
  },

  async update(id, data) {
    const product = await this.getAdmin(id);
    delete data.openingStock;
    delete data.location;
    product.set(data);
    return product.save();
  },

  async remove(id) {
    const product = await this.getAdmin(id);
    await Inventory.deleteMany({ product: product._id });
    await product.deleteOne();
  },

  // The - / + counter on the details page. All limits are decided here.
  async adjustQuantity(id, { color, size, qty = 1, action = "check" }) {
    if (!mongoose.isValidObjectId(id)) throw notFound();
    const product = await Product.findOne({ _id: id, active: true });
    if (!product) throw notFound();
    if (!product.sizes.includes(size) || !product.colors.some((c) => c.name === color)) {
      throw new ApiError(400, "Please select a valid size and colour");
    }
    const avail = await available(id, color, size);
    const max = Math.min(avail, env.maxQty);
    let q = Math.floor(Number(qty)) || 1;
    if (action === "inc") q += 1;
    if (action === "dec") q -= 1;
    const limited = q > max && action !== "dec";
    q = max === 0 ? 0 : Math.min(Math.max(q, 1), max);
    return { qty: q, available: avail, max, limited, inStock: avail > 0 };
  },

  // CSV columns: name,category,collection,price,tag,img,gallery,description,fabric,sizes,colors,stock,location
  async bulkCreate(buffer) {
    let rows;
    try {
      rows = parse(buffer, { columns: true, skip_empty_lines: true, trim: true, bom: true });
    } catch (e) {
      throw new ApiError(400, `Invalid CSV: ${e.message}`);
    }
    const created = [];
    const failed = [];
    for (const [i, r] of rows.entries()) {
      try {
        const colors = splitList(r.colors).map((c) => {
          const [name, hex] = c.split(":");
          return { name: name.trim(), hex: (hex || "#6b7f3a").trim() };
        });
        const p = await this.create({
          name: r.name,
          category: r.category,
          collectionName: r.collection,
          price: Number(r.price),
          tag: r.tag,
          img: r.img,
          gallery: splitList(r.gallery),
          description: r.description,
          fabric: r.fabric,
          sizes: splitList(r.sizes).length ? splitList(r.sizes) : ["S", "M", "L", "XL"],
          colors,
          openingStock: Number(r.stock || 0),
          location: r.location || "Main Warehouse",
        });
        created.push(p.name);
      } catch (e) {
        failed.push({ row: i + 2, error: e.message });
      }
    }
    return { created: created.length, failed };
  },

  sampleCsv() {
    return [
      "name,category,collection,price,tag,img,gallery,description,fabric,sizes,colors,stock,location",
      'Sample Hoodie,Men,Autumn Edit,2499,New,https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700,,Soft relaxed hoodie,100% organic cotton,S|M|L|XL,Olive:#6b7f3a|Sand:#d9d2b6,10,Main Warehouse',
    ].join("\n");
  },
};
