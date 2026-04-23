import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCodingStats,
  syncCodeforcesProfile,
  syncLeetcodeProfile
} from "../controllers/codingController.js";

const router = express.Router();

router.get("/", protect, getCodingStats);
router.post("/leetcode/:username", protect, syncLeetcodeProfile);
router.post("/codeforces/:handle", protect, syncCodeforcesProfile);

export default router;

