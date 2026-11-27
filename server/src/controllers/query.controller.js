import queryService from "../services/query.service.js";
import { crudController } from "./base.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const base = crudController(queryService, { filterKeys: ["status"] });

export default {
  list: base.list,
  remove: base.remove,
  // admin can only change the status
  update: asyncHandler(async (req, res) => res.json(await queryService.updateStatus(req.params.id, req.body.status))),
};
