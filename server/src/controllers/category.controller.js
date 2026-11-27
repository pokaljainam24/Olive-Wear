import categoryService from "../services/category.service.js";
import { crudController } from "./base.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export default {
  ...crudController(categoryService, { filterKeys: ["type"] }),
  publicList: asyncHandler(async (req, res) => res.json(await categoryService.listPublic(req.query.type))),
};
