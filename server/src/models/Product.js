import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
    collectionName: { type: String, trim: true, default: "" },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    tag: { type: String, default: "" },
    img: { type: String, required: [true, "Main image is required"] },
    gallery: { type: [String], default: [] },
    description: { type: String, default: "" },
    fabric: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    colors: { type: [{ name: String, hex: String, _id: false }], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);
schema.pre("validate", function (next) {
  if (!this.colors.length) this.colors = [{ name: "Olive", hex: "#6b7f3a" }];
  next();
});
schema.index({ name: "text" });

export default mongoose.model("Product", schema);
