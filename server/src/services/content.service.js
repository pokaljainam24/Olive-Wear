import Content from "../models/Content.js";
import { crudService } from "./base.service.js";

export default {
  ...crudService(Content, { sort: { order: 1, createdAt: 1 } }),
  listPublic: (type) => Content.find({ published: true, ...(type ? { type } : {}) }).sort({ order: 1, createdAt: 1 }),
};
