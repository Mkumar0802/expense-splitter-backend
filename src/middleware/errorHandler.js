import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
