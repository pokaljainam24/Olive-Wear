import { ApiError } from "../utils/ApiError.js";

// Generic CRUD used by categories, content and queries.
export const crudService = (Model, { sort = { createdAt: -1 } } = {}) => ({
  list: (filter = {}) => Model.find(filter).sort(sort),
  async get(id) {
    const doc = await Model.findById(id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    return doc;
  },
  create: (data) => Model.create(data),
  async update(id, data) {
    const doc = await Model.findById(id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    doc.set(data);
    return doc.save();
  },
  async remove(id) {
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    return doc;
  },
});
