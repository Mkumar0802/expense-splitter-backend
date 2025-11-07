import dotenv from "dotenv";
import app from "./app.js";
import logger from "./config/logger.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
