import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Content from "../models/Content.js";
import Product from "../models/Product.js";
import productService from "../services/product.service.js";
import authService from "../services/auth.service.js";
import { categories, products, content } from "./data.js";

await connectDB();
await authService.ensureAdmin();

for (const c of categories) await Category.updateOne({ name: c.name }, { $set: c }, { upsert: true });
for (const c of content) await Content.updateOne({ key: c.key }, { $set: c }, { upsert: true });

if ((await Product.countDocuments()) === 0) {
  for (const p of products) await productService.create({ ...p, openingStock: 12, location: "Main Warehouse" });
  console.log(`${products.length} products added`);
} else {
  console.log("Products already exist, skipped");
}

console.log("Seed done");
await mongoose.disconnect();
