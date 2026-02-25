import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume, getResume } from "../controllers/resumeController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", protect, upload.single("file"), uploadResume);
router.get("/", protect, getResume);

export default router;