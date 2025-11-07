import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import participationRoutes from "./routes/participationRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./config/logger.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/participations", participationRoutes);


// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server running fine" });
});


// Root check
app.get("/", (req, res) => {
  res.send("💰 Expense Splitter API is running...");
});

// Error handler
app.use(errorHandler);

export default app;
