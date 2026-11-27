import inventoryService from "../services/inventory.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  list: asyncHandler(async (req, res) => res.json(await inventoryService.list(req.query))),
  save: asyncHandler(async (req, res) => res.status(201).json(await inventoryService.save(req.body))),
  update: asyncHandler(async (req, res) => res.json(await inventoryService.update(req.params.id, req.body))),
  remove: asyncHandler(async (req, res) => {
    await inventoryService.remove(req.params.id);
    res.json({ message: "Deleted" });
  }),
  locations: asyncHandler(async (req, res) => res.json(await inventoryService.locations())),
};
