import express from "express";
import { getAllParticipations } from "../controllers/participationController.js";

const router = express.Router();
router.get("/", getAllParticipations);

export default router;
