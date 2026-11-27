import dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default { get: asyncHandler(async (req, res) => res.json(await dashboardService.get())) };
