import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateQuestion,
  evaluateAnswer,
  getHistory
} from "../controllers/mockController.js";

const router = express.Router();

router.post("/generate", protect, generateQuestion);
router.post("/evaluate", protect, evaluateAnswer);
router.get("/history", protect, getHistory);

export default router;