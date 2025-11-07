import express from "express";
import { getUsers, createUser } from "../controllers/userController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createUserSchema } from "../validations/userValidation.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", validateRequest(createUserSchema), createUser);

export default router;
