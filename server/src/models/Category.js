import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], unique: true, trim: true },
    slug: { type: String, index: true },
    type: { type: String, enum: ["category", "collection"], default: "category" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);
schema.pre("validate", function (next) {
  if (this.name) this.slug = slugify(this.name);
  next();
});

export default mongoose.model("Category", schema);
