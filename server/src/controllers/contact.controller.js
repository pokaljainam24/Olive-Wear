import otpService from "../services/otp.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  sendOtp: asyncHandler(async (req, res) => {
    const { requestId } = await otpService.send(req.body);
    res.json({ requestId, message: "OTP sent to your email" });
  }),
  verify: asyncHandler(async (req, res) => {
    await otpService.verify(req.body);
    res.status(201).json({ message: "Your query has been sent" });
  }),
};
