// src/config/db.js
import { PrismaClient } from "@prisma/client";
import logger from "./logger.js";

const prisma = new PrismaClient();

export const checkDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");
  } catch (err) {
    logger.error("❌ Database connection failed:", err);
    process.exit(1); // stop the app if DB connection fails
  }
};

export default prisma;
