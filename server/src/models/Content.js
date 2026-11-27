import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const item = new mongoose.Schema(
  { title: String, text: String, image: String, icon: String },
  { _id: false }
);

// type: home (keys hero, features, banner) | lookbook | sizeguide | policy (terms, privacy, shipping, returns)
const schema = new mongoose.Schema(
  {
    type: { type: String, enum: ["home", "lookbook", "sizeguide", "policy"], required: true, index: true },
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    image: { type: String, default: "" },
    items: { type: [item], default: [] },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);
schema.pre("validate", function (next) {
  if (!this.key) this.key = slugify(this.title || `${this.type}-${Date.now()}`);
  next();
});

export default mongoose.model("Content", schema);
