import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { syncLeetcode,getLeetcodeStats } from "../controllers/leetcodeController.js";

const router = express.Router();

router.post("/:username", protect, syncLeetcode);
router.get("/", protect, getLeetcodeStats);

export default router;