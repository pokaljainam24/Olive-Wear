import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const r = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { message: "Too many login attempts. Try again later." } });

r.post("/login", loginLimiter, auth.login);
r.get("/me", protect, auth.me);

export default r;
