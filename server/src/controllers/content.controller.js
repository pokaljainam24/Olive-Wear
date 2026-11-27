import contentService from "../services/content.service.js";
import { crudController } from "./base.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  ...crudController(contentService, { filterKeys: ["type"] }),
  publicList: asyncHandler(async (req, res) => res.json(await contentService.listPublic(req.query.type))),
};
