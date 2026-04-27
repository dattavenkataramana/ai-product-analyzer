import pkg from "uuid";
const { v4: uuidv4 } = pkg;

import morgan from "morgan";
import { logger } from "../utils/logger.js";

export const requestId = (req, res, next) => {
  try {
    req.id = req.headers["x-request-id"] || uuidv4();
    res.setHeader("x-request-id", req.id);
    next();
  } catch (err) {
    console.error("requestId error:", err);
    next();
  }
};

export const httpLogger = morgan((tokens, req, res) => {
  try {
    logger.info({
      requestId: req.id,
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
