import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.originalUrl}`));

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.code === 11000) {
    status = 409;
    message = `Already exists: ${Object.keys(err.keyValue || {}).join(", ")}`;
  } else if (err.name === "MulterError") {
    status = 400;
  }
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? "Server error" : message });
};
