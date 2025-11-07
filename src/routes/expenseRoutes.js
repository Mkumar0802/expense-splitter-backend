import express from "express";
import { getExpenses, createExpense } from "../controllers/expenseController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createExpenseSchema } from "../validations/expenseValidation.js";

const router = express.Router();

router.get("/", getExpenses);
router.post("/", validateRequest(createExpenseSchema), createExpense);
router.get("/balance", validateRequest(createExpenseSchema), getExpenses);


export default router;
