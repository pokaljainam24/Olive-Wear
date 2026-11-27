import User from "../models/User.js";
import authService from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Please login");
  let payload;
  try {
    payload = authService.verify(token);
  } catch {
    throw new ApiError(401, "Session expired. Please login again.");
  }
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, "User not found");
  req.user = user;
  next();
});

export const adminOnly = (req, res, next) =>
  req.user?.role === "admin" ? next() : next(new ApiError(403, "Admin access only"));
