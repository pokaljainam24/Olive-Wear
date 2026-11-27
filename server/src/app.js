import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { UPLOAD_DIR } from "./middleware/upload.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
// images in /uploads are shown on the client site (different port), so allow cross-origin loading
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.clientUrl.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
