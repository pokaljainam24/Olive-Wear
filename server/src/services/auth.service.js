import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, env.jwtSecret, { expiresIn: env.jwtExpires });

export default {
  async login(email, password) {
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
    if (!user || !(await user.matches(password))) throw new ApiError(401, "Invalid email or password");
    return { token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },
  async ensureAdmin() {
    if (!env.admin.email || !env.admin.password) return;
    if (await User.exists({ email: env.admin.email.toLowerCase() })) return;
    await User.create({ name: env.admin.name, email: env.admin.email, password: env.admin.password });
    console.log(`Admin created: ${env.admin.email}`);
  },
  verify: (token) => jwt.verify(token, env.jwtSecret),
};
