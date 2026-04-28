import { randomUUID } from "crypto";
import morgan from "morgan";
import { logger } from "../utils/logger.js";

/* ================= REQUEST ID ================= */
export const requestId = (req, res, next) => {
  try {
    req.id = req.headers["x-request-id"] || randomUUID();
    res.setHeader("x-request-id", req.id);
  } catch (err) {
    console.error("requestId error:", err);
    req.id = "unknown"; // fallback
  }
  next();
};

/* ================= HTTP LOGGER ================= */
export const httpLogger = morgan((tokens, req, res) => {
  try {
    logger.info({
      requestId: req.id || "no-id",
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      responseTime: tokens["response-time"](req, res),
    });
  } catch (err) {
    console.error("logger error:", err);
  }
  return null;
});
