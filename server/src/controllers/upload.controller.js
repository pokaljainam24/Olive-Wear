import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export default {
  handle: (req, res, next) => {
    if (!req.file) return next(new ApiError(400, "Please choose an image"));
    res.status(201).json({ url: `${env.serverUrl}/uploads/${req.file.filename}` });
  },
};
