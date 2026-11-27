import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("OrderHistoryGrant", schema);
