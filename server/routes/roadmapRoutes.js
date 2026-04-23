import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateRoadmap, getRoadmapHistory } from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/generate", protect, generateRoadmap);
router.get("/history", protect, getRoadmapHistory);

export default router;

