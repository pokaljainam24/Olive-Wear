import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    topic: { type: String, default: "Order help" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new" },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

export default mongoose.model("Query", schema);
