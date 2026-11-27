import { Router } from "express";
import publicRoutes from "./public.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";

const r = Router();
r.get("/health", (req, res) => res.json({ ok: true }));
r.use("/auth", authRoutes);
r.use("/admin", adminRoutes);
r.use("/", publicRoutes);

export default r;
