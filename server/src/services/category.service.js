import Category from "../models/Category.js";
import { crudService } from "./base.service.js";

export default {
  ...crudService(Category, { sort: { order: 1, name: 1 } }),
  listPublic: (type) => Category.find({ active: true, ...(type ? { type } : {}) }).sort({ order: 1, name: 1 }),
};
