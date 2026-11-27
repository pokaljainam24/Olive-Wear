import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadImage, uploadCsv } from "../middleware/upload.js";
import dashboard from "../controllers/dashboard.controller.js";
import product from "../controllers/product.controller.js";
import category from "../controllers/category.controller.js";
import content from "../controllers/content.controller.js";
import inventory from "../controllers/inventory.controller.js";
import query from "../controllers/query.controller.js";
import upload from "../controllers/upload.controller.js";
import order from "../controllers/order.controller.js";

const r = Router();
r.use(protect, adminOnly);

r.get("/dashboard", dashboard.get);
r.get("/orders", order.list);
r.put("/orders/:id/tracking", order.updateTracking);
r.post("/upload", uploadImage.single("image"), upload.handle);

// products (bulk routes first so ":id" does not swallow them)
r.get("/products", product.adminList);
r.post("/products/bulk", uploadCsv.single("file"), product.bulk);
r.get("/products/bulk/sample", product.sample);
r.get("/products/:id", product.adminGet);
r.post("/products", product.create);
r.put("/products/:id", product.update);
r.delete("/products/:id", product.remove);

// categories / collections
r.get("/categories", category.list);
r.post("/categories", category.create);
r.put("/categories/:id", category.update);
r.delete("/categories/:id", category.remove);

// CMS
r.get("/content", content.list);
r.post("/content", content.create);
r.put("/content/:id", content.update);
r.delete("/content/:id", content.remove);

// inventory
r.get("/inventory", inventory.list);
r.get("/inventory/locations", inventory.locations);
r.post("/inventory", inventory.save);
r.put("/inventory/:id", inventory.update);
r.delete("/inventory/:id", inventory.remove);

// contact queries
r.get("/queries", query.list);
r.put("/queries/:id", query.update);
r.delete("/queries/:id", query.remove);

export default r;
