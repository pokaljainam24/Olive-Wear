import paymentService from "../services/payment.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  createOrder: asyncHandler(async (req, res) => {
    res.status(201).json(await paymentService.createOrder(req.body));
  }),
  verify: asyncHandler(async (req, res) => {
    res.json(await paymentService.verify(req.body));
  }),
};
