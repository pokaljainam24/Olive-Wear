import orderService from "../services/order.service.js";
import otpService from "../services/otp.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  list: asyncHandler(async (req, res) => res.json(await orderService.listConfirmed())),
  history: asyncHandler(async (req, res) => res.json(await orderService.listByAccessTokens(req.body?.tokens))),
  sendHistoryOtp: asyncHandler(async (req, res) => {
    const result = await otpService.sendOrderHistoryOtp(req.body?.email);
    res.json({ ...result, message: "If orders match this email, a verification code has been sent." });
  }),
  verifyHistoryOtp: asyncHandler(async (req, res) => {
    res.json(await otpService.verifyOrderHistoryOtp(req.body));
  }),
  updateTracking: asyncHandler(async (req, res) => res.json(await orderService.updateTracking(req.params.id, req.body))),
};
