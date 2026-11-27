import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  login: asyncHandler(async (req, res) => res.json(await authService.login(req.body.email, req.body.password))),
  me: asyncHandler(async (req, res) => res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role })),
};
