import mongoose from "mongoose";
import { env } from "../config/env.js";

// Holds the contact form data until the email is verified. Deleted automatically after expiry.
const schema = new mongoose.Schema({
  email: { type: String, required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  payload: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: env.otpExpiryMinutes * 60 },
});

export default mongoose.model("Otp", schema);
