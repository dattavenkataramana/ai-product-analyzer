//D:\ai-product-analyzer\services\api-gateway\src\middleware\error.js
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error({
    requestId: req.id,
    message: err.message,
    stack: err.stack,
  });
  //res.status(500).json({ error: "Internal Error", requestId: req.id });
  res.status(500).json({
    error: err.message,
    requestId: req.id,
  });
};


console.log("errorHandler");
