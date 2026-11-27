import { asyncHandler } from "../utils/asyncHandler.js";

export const crudController = (service, { filterKeys = [] } = {}) => ({
  list: asyncHandler(async (req, res) => {
    const filter = {};
    filterKeys.forEach((k) => req.query[k] && (filter[k] = req.query[k]));
    res.json(await service.list(filter));
  }),
  get: asyncHandler(async (req, res) => res.json(await service.get(req.params.id))),
  create: asyncHandler(async (req, res) => res.status(201).json(await service.create(req.body))),
  update: asyncHandler(async (req, res) => res.json(await service.update(req.params.id, req.body))),
  remove: asyncHandler(async (req, res) => {
    await service.remove(req.params.id);
    res.json({ message: "Deleted" });
  }),
});
