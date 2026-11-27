import productService from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export default {
  // public
  list: asyncHandler(async (req, res) => res.json(await productService.list({ category: req.query.category, q: req.query.q }))),
  get: asyncHandler(async (req, res) => res.json(await productService.getPublic(req.params.id))),
  quantity: asyncHandler(async (req, res) => res.json(await productService.adjustQuantity(req.params.id, req.body))),
  // admin
  adminList: asyncHandler(async (req, res) => res.json(await productService.list({ q: req.query.q, admin: true }))),
  adminGet: asyncHandler(async (req, res) => res.json(await productService.getAdmin(req.params.id))),
  create: asyncHandler(async (req, res) => res.status(201).json(await productService.create(req.body))),
  update: asyncHandler(async (req, res) => res.json(await productService.update(req.params.id, req.body))),
  remove: asyncHandler(async (req, res) => {
    await productService.remove(req.params.id);
    res.json({ message: "Deleted" });
  }),
  bulk: asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Please choose a CSV file");
    res.json(await productService.bulkCreate(req.file.buffer));
  }),
  sample: (req, res) => res.type("text/csv").send(productService.sampleCsv()),
};
