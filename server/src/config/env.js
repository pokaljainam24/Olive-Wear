import dotenv from "dotenv";
dotenv.config();

const need = (k) => {
  if (!process.env[k]) throw new Error(`Missing env variable: ${k}`);
  return process.env[k];
};
const port = Number(process.env.PORT || 5000);

export const env = {
  port,
  mongoUri: need("MONGO_URI"),
  jwtSecret: need("JWT_SECRET"),
  jwtExpires: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  serverUrl: process.env.SERVER_URL || `http://localhost:${port}`,
  admin: {
    name: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || "Olive Wear <no-reply@olivewear.com>",
  },
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
  maxQty: Number(process.env.MAX_QTY_PER_ORDER || 10),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  },
};
